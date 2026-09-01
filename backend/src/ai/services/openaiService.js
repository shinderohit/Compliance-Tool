const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const DOCUMENT_SCHEMA = {
    type: "object",
    additionalProperties: false,
    required: [
        "record",
        "registrations",
        "branches",
        "complianceScore",
        "riskLevel",
        "issues",
        "recommendations",
        "summary",
    ],
    properties: {
        record: {
            type: "object",
            additionalProperties: false,
            required: [
                "uin",
                "companyName",
                "state",
                "location",
                "panNumber",
                "lawArea",
                "actRule",
                "complianceName",
                "complianceType",
                "status",
                "dueDate",
                "expiryDate",
                "assignedTo",
                "department",
                "priority",
                "frequency",
                "remarks",
            ],
            properties: {
                uin: { type: ["string", "null"] },
                companyName: { type: ["string", "null"] },
                state: { type: ["string", "null"] },
                location: { type: ["string", "null"] },
                panNumber: { type: ["string", "null"] },
                lawArea: { type: ["string", "null"] },
                actRule: { type: ["string", "null"] },
                complianceName: { type: ["string", "null"] },
                complianceType: { type: ["string", "null"] },
                status: {
                    type: ["string", "null"],
                    enum: [
                        "Pending",
                        "Complied",
                        "Overdue",
                        "Pending Approval",
                        "Rejected",
                        "Not Applicable",
                        "One Time",
                        null,
                    ],
                },
                dueDate: { type: ["string", "null"] },
                expiryDate: { type: ["string", "null"] },
                assignedTo: { type: ["string", "null"] },
                department: { type: ["string", "null"] },
                priority: {
                    type: ["string", "null"],
                    enum: ["Low", "Medium", "High", null],
                },
                frequency: { type: ["string", "null"] },
                remarks: { type: ["string", "null"] },
            },
        },
        registrations: {
            type: "object",
            additionalProperties: false,
            required: ["gst", "pf", "esic", "pt", "lwf", "se"],
            properties: Object.fromEntries(
                ["gst", "pf", "esic", "pt", "lwf", "se"].map((key) => [
                    key,
                    {
                        type: "object",
                        additionalProperties: false,
                        required: ["number", "applicableDate", "expiryDate"],
                        properties: {
                            number: { type: ["string", "null"] },
                            applicableDate: { type: ["string", "null"] },
                            expiryDate: { type: ["string", "null"] },
                        },
                    },
                ]),
            ),
        },
        branches: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["name", "state", "location", "address"],
                properties: {
                    name: { type: ["string", "null"] },
                    state: { type: ["string", "null"] },
                    location: { type: ["string", "null"] },
                    address: { type: ["string", "null"] },
                },
            },
        },
        complianceScore: { type: "number", minimum: 0, maximum: 100 },
        riskLevel: {
            type: "string",
            enum: ["Low", "Medium", "High"],
        },
        issues: {
            type: "array",
            items: { type: "string" },
        },
        recommendations: {
            type: "array",
            items: { type: "string" },
        },
        summary: { type: "string" },
    },
};

const getClient = () => {
    if (!process.env.OPENAI_API_KEY) {
        const error = new Error(
            "AI document scanning is not configured. Add OPENAI_API_KEY to the backend environment.",
        );
        error.code = "OPENAI_API_KEY_MISSING";
        throw error;
    }

    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const buildFileContent = (file) => {
    const bytes = fs.readFileSync(file.path);
    const dataUrl = `data:${file.mimetype};base64,${bytes.toString("base64")}`;
    const extension = path.extname(file.originalname).toLowerCase();

    if ([".jpg", ".jpeg", ".png"].includes(extension)) {
        return {
            type: "input_image",
            image_url: dataUrl,
            detail: "high",
        };
    }

    return {
        type: "input_file",
        filename: file.originalname,
        file_data: dataUrl,
    };
};

const analyzeComplianceDocument = async (file) => {
    const client = getClient();
    const response = await client.responses.create({
        model: process.env.OPENAI_DOCUMENT_MODEL || "gpt-4.1-mini",
        input: [
            {
                role: "system",
                content:
                    "You extract Indian corporate compliance information from documents. Never invent identifiers or dates. Use null when a value is absent. Normalize dates as YYYY-MM-DD. Use Pending when the operational status is not explicitly known. Calculate risk from missing mandatory data, expired or near-due obligations, and document inconsistencies. Return a practical compliance score from 0 to 100.",
            },
            {
                role: "user",
                content: [
                    buildFileContent(file),
                    {
                        type: "input_text",
                        text:
                            "Analyze this document and extract the best single compliance record for the Add Compliance form. Include GST, PF, ESIC, PT, LWF, Shops & Establishment registrations and branches when present.",
                    },
                ],
            },
        ],
        text: {
            format: {
                type: "json_schema",
                name: "compliance_document_analysis",
                strict: true,
                schema: DOCUMENT_SCHEMA,
            },
        },
    });

    if (!response.output_text) {
        throw new Error("The AI analyzer returned no extractable content.");
    }

    return JSON.parse(response.output_text);
};

module.exports = {
    analyzeComplianceDocument,
};
