require("dotenv").config();

const app = require("./app");
const logger = require("./config/logger");
const {
    startComplianceNotificationWorker,
} = require("./workers/complianceNotification.worker");

const PORT =
    process.env.PORT || 5000;

app.listen(PORT, () => {
    logger.info({ port: PORT }, "server started");
    startComplianceNotificationWorker();
});
