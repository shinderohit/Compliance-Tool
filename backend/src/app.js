const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const path = require("path");
const requestContext = require("./middlewares/requestContext");

const app = express();

app.use(cors());

app.use(requestContext);

app.use(express.json());

app.use(cookieParser());

app.use(helmet());

app.use("/src/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "SaaS Compliance Platform API Running",
    });
});

const authRoutes = require("./modules/auth/auth.routes");
app.use("/api/auth", authRoutes);

const testRoutes = require("./routes/test.routes");
app.use("/api/test", testRoutes);

const superAdminRoutes = require("./modules/super-admin/superAdmin.routes");
app.use("/api/super-admin", superAdminRoutes);

const kaoRoutes = require("./modules/kao/kao.routes");
app.use("/api/kao", kaoRoutes);

const clientRoutes = require("./modules/client/client.routes");
app.use("/api/client", clientRoutes);

const complianceRoutes = require("./modules/compliance/compliance.routes");
app.use("/api/compliance", complianceRoutes);

const companyRoutes = require("./modules/company/company.routes");
app.use("/api/company", companyRoutes);

const masterRoutes = require("./modules/master/master.routes");
app.use("/api/master", masterRoutes);

const approvalRoutes = require("./modules/approval/approval.routes");
app.use("/api/approvals", approvalRoutes);

const notificationsRoutes = require("./modules/notifications/notifications.routes");
app.use("/api/notifications", notificationsRoutes);

const auditRoutes = require("./modules/audit/audit.routes");
app.use("/api/audit", auditRoutes);

module.exports = app;
