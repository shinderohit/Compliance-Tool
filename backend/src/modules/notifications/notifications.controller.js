const prisma = require("../../config/prisma");

const getCurrentCompany = async (userId) => {
    return prisma.company.findUnique({
        where: { userId },
    });
};

const getNotifications = async (req, res) => {
    try {
        const company = await getCurrentCompany(req.user.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        const notifications = await prisma.notification.findMany({
            where: {
                companyId: company.id,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 100,
        });

        return res.json({
            success: true,
            notifications,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
        });
    }
};

const markNotificationRead = async (req, res) => {
    try {
        const company = await getCurrentCompany(req.user.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        const notification = await prisma.notification.findFirst({
            where: {
                id: req.params.id,
                companyId: company.id,
            },
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        const updated = await prisma.notification.update({
            where: { id: notification.id },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        return res.json({
            success: true,
            notification: updated,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update notification",
        });
    }
};

const markAllNotificationsRead = async (req, res) => {
    try {
        const company = await getCurrentCompany(req.user.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        await prisma.notification.updateMany({
            where: {
                companyId: company.id,
                isRead: false,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        return res.json({
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update notifications",
        });
    }
};

module.exports = {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
};
