const crypto = require("crypto");
const logger = require("../config/logger");

const requestContext = (req, res, next) => {
    const requestId =
        req.headers["x-request-id"] ||
        `req_${crypto.randomUUID().replace(/-/g, "")}`;

    req.requestId = requestId;
    req.logger = logger.child({
        requestId,
        method: req.method,
        route: req.originalUrl,
    });

    res.setHeader("X-Request-Id", requestId);

    const startedAt = Date.now();

    res.on("finish", () => {
        req.logger.info({
            statusCode: res.statusCode,
            durationMs: Date.now() - startedAt,
            userId: req.user?.id,
            role: req.user?.role,
        }, "request completed");
    });

    next();
};

module.exports = requestContext;
