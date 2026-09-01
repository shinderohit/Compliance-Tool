const nodemailer = require("nodemailer");
const logger = require("../config/logger");

const hasSmtpConfig = () =>
    Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);

const createTransporter = () =>
    nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

const sendMail = async ({ to, subject, text, html }) => {
    const recipients = Array.from(new Set((Array.isArray(to) ? to : [to]).filter(Boolean)));

    if (recipients.length === 0) {
        return { skipped: true, reason: "No recipients" };
    }

    if (!hasSmtpConfig()) {
        logger.warn({ recipients, subject }, "SMTP is not configured; email skipped");
        return { skipped: true, reason: "SMTP is not configured" };
    }

    const transporter = createTransporter();

    return transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: recipients.join(","),
        subject,
        text,
        html,
    });
};

const sendClientCreatedEmails = async ({ client, kao, loginUrl, password }) => {
    const superAdmins = await require("../config/prisma").user.findMany({
        where: {
            role: "SUPER_ADMIN",
            isActive: true,
        },
        select: {
            email: true,
        },
    });

    const recipients = [
        client.email,
        kao?.email,
        ...superAdmins.map((admin) => admin.email),
    ];

    const subject = `Client created: ${client.name}`;
    const text = [
        `Client ${client.name} has been created.`,
        `Client admin email: ${client.email}`,
        `Login URL: ${loginUrl}`,
        password ? `Temporary password: ${password}` : null,
    ]
        .filter(Boolean)
        .join("\n");

    const html = `
        <p>Client <strong>${client.name}</strong> has been created.</p>
        <p><strong>Client admin email:</strong> ${client.email}</p>
        <p><strong>Login URL:</strong> ${loginUrl}</p>
        ${password ? `<p><strong>Temporary password:</strong> ${password}</p>` : ""}
    `;

    return sendMail({
        to: recipients,
        subject,
        text,
        html,
    });
};

const sendCompanyCreatedEmails = async ({ company, kao, loginUrl, password }) => {
    const superAdmins = await require("../config/prisma").user.findMany({
        where: {
            role: "SUPER_ADMIN",
            isActive: true,
        },
        select: {
            email: true,
        },
    });

    const recipients = [
        company.email,
        kao?.email,
        ...superAdmins.map((admin) => admin.email),
    ];

    const subject = `Company created: ${company.name}`;
    const text = [
        `Company ${company.name} has been created.`,
        `Company admin email: ${company.email}`,
        `Login URL: ${loginUrl}`,
        password ? `Temporary password: ${password}` : null,
    ]
        .filter(Boolean)
        .join("\n");

    const html = `
        <p>Company <strong>${company.name}</strong> has been created.</p>
        <p><strong>Company admin email:</strong> ${company.email}</p>
        <p><strong>Login URL:</strong> ${loginUrl}</p>
        ${password ? `<p><strong>Temporary password:</strong> ${password}</p>` : ""}
    `;

    return sendMail({
        to: recipients,
        subject,
        text,
        html,
    });
};

module.exports = {
    sendMail,
    sendClientCreatedEmails,
    sendCompanyCreatedEmails,
};
