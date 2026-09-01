const storageService = require("../../services/storage/storage.service");

const parseJsonField = (value, fallback) => {
    if (!value) return fallback;
    if (typeof value !== "string") return value;

    try {
        return JSON.parse(value);
    } catch (error) {
        return fallback;
    }
};

const toNullableDate = (value) => {
    if (!value) return null;

    if (typeof value === "number") {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        excelEpoch.setUTCDate(excelEpoch.getUTCDate() + value);
        return excelEpoch;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const buildRegistrationData = (row = {}) => ({
    gst: {
        number: row.gstNumber || null,
        applicableDate: row.gstApplicableDate || row.applicableDate || null,
        expiryDate: row.gstExpiryDate || row.expiryDate || null,
    },
    pf: {
        number: row.pfNumber || null,
        applicableDate: row.pfApplicableDate || row.applicableDate || null,
        expiryDate: row.pfExpiryDate || row.expiryDate || null,
    },
    esic: {
        number: row.esicNumber || null,
        applicableDate: row.esicApplicableDate || row.applicableDate || null,
        expiryDate: row.esicExpiryDate || row.expiryDate || null,
    },
    pt: {
        number: row.ptNumber || null,
        applicableDate: row.ptApplicableDate || row.applicableDate || null,
        expiryDate: row.ptExpiryDate || row.expiryDate || null,
    },
    lwf: {
        number: row.lwfNumber || null,
        applicableDate: row.lwfApplicableDate || row.applicableDate || null,
        expiryDate: row.lwfExpiryDate || row.expiryDate || null,
    },
    se: {
        number: row.seNumber || null,
        applicableDate: row.seApplicableDate || row.applicableDate || null,
        expiryDate: row.seExpiryDate || row.expiryDate || null,
    },
});

const normalizeComplianceBody = (req) => {
    const documents = {};

    (req.files || []).forEach((file) => {
        documents[file.fieldname] = storageService.getFileMetadata(file);
    });

    return {
        ...req.body,
        registrations: parseJsonField(req.body.registrations, {}),
        branches: parseJsonField(req.body.branches, []),
        documents,
    };
};

const buildComplianceMasterData = (row, companyId, defaults = {}) => ({
    uin: row.uin || null,
    companyName: row.companyName || defaults.companyName || null,
    state: row.state || null,
    location: row.location || null,
    lawArea: row.lawArea || null,
    actRule: row.actRule || null,
    compliance: row.compliance || row.complianceName || null,
    gstNumber: row.gstNumber || null,
    panNumber: row.panNumber || null,
    complianceType: row.complianceType || null,
    complianceScore:
        row.complianceScore !== undefined && row.complianceScore !== ""
            ? Number(row.complianceScore)
            : defaults.complianceScore ?? null,
    status: row.status || "Pending",
    dueDate: toNullableDate(row.dueDate || row.applicableDate),
    expiryDate: toNullableDate(row.expiryDate),
    risk: row.risk || row.riskLevel || defaults.riskLevel || null,
    assignedTo: row.assignedTo || null,
    department: row.department || null,
    priority: row.priority || null,
    frequency: row.frequency || null,
    remarks: row.remarks || null,
    registrations: row.registrations || buildRegistrationData(row),
    documents: row.documents || defaults.documents || {},
    branches: row.branches || defaults.branches || [],
    branchId: row.branchId || defaults.branchId || null,
    companyId,
});

module.exports = {
    normalizeComplianceBody,
    buildComplianceMasterData,
    buildRegistrationData,
    toNullableDate,
};
