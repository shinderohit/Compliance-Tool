const path = require("path");

const provider = process.env.STORAGE_PROVIDER || "local";

const normalizeLocalPath = (filePath) => filePath.replace(/\\/g, "/");

const getPublicUrl = (filePath) => {
    if (!filePath) return null;

    if (provider === "local") {
        const baseUrl = process.env.APP_BASE_URL || "";
        const normalized = normalizeLocalPath(filePath);
        return baseUrl ? `${baseUrl}/${normalized}` : normalized;
    }

    return normalizeLocalPath(filePath);
};

const getFileMetadata = (file) => {
    if (!file) return null;

    return {
        storageProvider: provider,
        originalName: file.originalname,
        storedName: file.filename || path.basename(file.path),
        fileKey: normalizeLocalPath(file.path),
        fileUrl: getPublicUrl(file.path),
        mimeType: file.mimetype,
        size: file.size,
    };
};

const storageService = {
    provider,
    getFileMetadata,
    getPublicUrl,
};

module.exports = storageService;
