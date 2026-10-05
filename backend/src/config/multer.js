const multer = require("multer");

const path = require("path");

const fs = require("fs");

const uploadPath = "src/uploads";

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, {
        recursive: true,
    });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9);

        cb(
            null,
            uniqueName +
            path.extname(file.originalname)
        );
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        ".xlsx",
        ".xls",
        ".csv",
        ".pdf",
        ".doc",
        ".docx",
        ".jpg",
        ".jpeg",
        ".png",
    ];

    const ext = path.extname(
        file.originalname
    ).toLowerCase();
    const allowedLogoTypes = [".jpg", ".jpeg", ".png"];

    if (file.fieldname === "companyLogo" && !allowedLogoTypes.includes(ext)) {
        return cb(new Error("Company logo must be a JPG or PNG image"));
    }

    if (!allowedTypes.includes(ext)) {
        return cb(
            new Error(
                "Only Excel, CSV, PDF, Word, JPG, and PNG files are allowed"
            )
        );
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    dest: "uploads/",
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});

module.exports = upload;
