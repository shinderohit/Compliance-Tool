const parseExcel = require("../parsers/excelParser");

const firstValue = (row, keys) => {
    for (const key of keys) {
        if (row[key] !== undefined && row[key] !== null && row[key] !== "") {
            return row[key];
        }
    }

    return null;
};

const extractExcelData = async (filePath) => {
    const rows = parseExcel(filePath);

    const extractedData = rows.map((row) => ({
        uin:
            row.UIN ||
            row.uin ||
            null,

        companyName:
            row["Company Name"] ||
            row.Company ||
            row.company ||
            null,

        state:
            row.State ||
            row.state ||
            null,

        location:
            row.Location ||
            row.location ||
            null,

        gstNumber:
            row["GST Number"] ||
            row.GST ||
            row.gst ||
            null,

        pfNumber: firstValue(row, [
            "PF Number",
            "PF",
            "pfNumber",
            "pf",
        ]),

        esicNumber: firstValue(row, [
            "ESIC Number",
            "ESIC",
            "esicNumber",
            "esic",
        ]),

        ptNumber: firstValue(row, [
            "PT Number",
            "PT",
            "Professional Tax",
            "ptNumber",
            "pt",
        ]),

        lwfNumber: firstValue(row, [
            "LWF Number",
            "LWF",
            "lwfNumber",
            "lwf",
        ]),

        seNumber: firstValue(row, [
            "S&E Number",
            "S and E Number",
            "Shop Establishment Number",
            "Shop and Establishment Number",
            "seNumber",
            "se",
        ]),

        applicableDate: firstValue(row, [
            "Applicable Date",
            "applicableDate",
        ]),

        gstApplicableDate: firstValue(row, [
            "GST Applicable Date",
            "gstApplicableDate",
        ]),

        pfApplicableDate: firstValue(row, [
            "PF Applicable Date",
            "pfApplicableDate",
        ]),

        esicApplicableDate: firstValue(row, [
            "ESIC Applicable Date",
            "esicApplicableDate",
        ]),

        ptApplicableDate: firstValue(row, [
            "PT Applicable Date",
            "ptApplicableDate",
        ]),

        lwfApplicableDate: firstValue(row, [
            "LWF Applicable Date",
            "lwfApplicableDate",
        ]),

        seApplicableDate: firstValue(row, [
            "S&E Applicable Date",
            "S and E Applicable Date",
            "seApplicableDate",
        ]),

        panNumber:
            row["PAN Number"] ||
            row.PAN ||
            row.pan ||
            null,

        lawArea:
            row["Law Area"] ||
            row.lawArea ||
            null,

        actRule:
            row["Act Rule"] ||
            row.actRule ||
            null,

        compliance:
            row.Compliance ||
            row.compliance ||
            null,

        complianceType:
            row["Compliance Type"] ||
            row.complianceType ||
            row.Compliance ||
            null,

        dueDate:
            row["Due Date"] ||
            row.dueDate ||
            null,

        expiryDate:
            row["Expiry Date"] ||
            row.Expiry ||
            row.expiry ||
            null,

        gstExpiryDate: firstValue(row, [
            "GST Expiry Date",
            "GST Expire Date",
            "gstExpiryDate",
        ]),

        pfExpiryDate: firstValue(row, [
            "PF Expiry Date",
            "PF Expire Date",
            "pfExpiryDate",
        ]),

        esicExpiryDate: firstValue(row, [
            "ESIC Expiry Date",
            "ESIC Expire Date",
            "esicExpiryDate",
        ]),

        ptExpiryDate: firstValue(row, [
            "PT Expiry Date",
            "PT Expire Date",
            "ptExpiryDate",
        ]),

        lwfExpiryDate: firstValue(row, [
            "LWF Expiry Date",
            "LWF Expire Date",
            "lwfExpiryDate",
        ]),

        seExpiryDate: firstValue(row, [
            "S&E Expiry Date",
            "S and E Expiry Date",
            "S&E Expire Date",
            "seExpiryDate",
        ]),

        riskLevel:
            row["Risk Level"] ||
            row.riskLevel ||
            "LOW",

        status:
            row.Status ||
            row.status ||
            "Pending",

        assignedTo:
            row["Assigned To"] ||
            row.assignedTo ||
            null,

        department:
            row.Department ||
            row.department ||
            null,

        priority:
            row.Priority ||
            row.priority ||
            "Medium",

        frequency:
            row.Frequency ||
            row.frequency ||
            null,

        remarks:
            row.Remarks ||
            row.remarks ||
            null,
    }));

    return extractedData;
};

module.exports = extractExcelData;
