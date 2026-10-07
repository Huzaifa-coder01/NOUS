require("./config/logging");
const {
  logger,
  crashLogger,
  accessLogger,
} = require("./config/logging");

global.logger = logger;

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "dev"}`,
});

require("express-async-errors");
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const moduleAlias = require("module-alias");

const aliases = require("../aliasConfig/pathAliases.config");
for (const [alias, target] of Object.entries(aliases)) {
  moduleAlias.addAlias(alias, path.join(__dirname, "..", target));
}
require("module-alias/register");

const { i18nConfig } = require("./config/i18nConfig");

const { securityMiddleware } = require("./middlewares/security");
const { initTextModeration } = require("./services/moderation/textModeration");
const { textModerationMiddleware } = require("./services/moderation/textModeration");
const createRateLimiter = require("./helperUtils/rateLimiter");

const { sendResponse } = require("./helperUtils/responseUtil");

const connectToDB = require("./helperUtils/server-setup");
const { backupMongoDB } = require("./helperUtils/dataBaseBackup");
const { getRedisClient } = require("./config/redis/redisConfig");


const swaggerUi = require("swagger-ui-express");
const swaggerFilePath = path.join(__dirname, "..", "swagger", "swagger_output.json");

if (!fs.existsSync(swaggerFilePath)) {
  fs.mkdirSync(path.dirname(swaggerFilePath), { recursive: true });
  fs.writeFileSync(swaggerFilePath, "{}\n");

  logger.warn("swagger_output.json not found; created default file", {
    filePath: swaggerFilePath,
  });
}

const swaggerFile = require(swaggerFilePath);
const { allowedOrigins } = require("./config/origins");

const app = express();
app.set("trust proxy", 1);


app.get("/api", (req, res) => {
  res.json({
    name: "Nous API",
    version: "v1",
    status: "running",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
  });
});

securityMiddleware(app, {
  allowedOrigins,
  adminIPWhitelist: [],
  maxRequestSize: "10mb",
});


app.use(i18nConfig.init);

app.use(accessLogger);

if (process.env.NODE_ENV !== "prod") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(textModerationMiddleware);

const globalLimiter = createRateLimiter("api-v1-global", 15, 200, {
  keyGenerator: (req) => `ip:${req.ip}`,
});

app.use("/api/v1", globalLimiter);


app.use("/api/v1/web", require("./roles/index"));   
app.use("/api/v1/app", require("./roles/index"));   
app.use("/api/v1", require("./routes"));     

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use((req, res) => {
  sendResponse({
    res,
    statusCode: 404,
    translationKey: "route_not_found",
  });
});

app.use((err, req, res, next) => {
  logger.error("Request error", {
    method: req.method,
    path: req.originalUrl,
    error: err.message,
    stack: err.stack,
  });

  res.status(500).json({
    message: "Internal server error",
  });
});

(async () => {
  try {
    await connectToDB();
    await initTextModeration();
    getRedisClient();

    setInterval(backupMongoDB, 24 * 60 * 60 * 1000);
  } catch (err) {
    logger.fatal("Startup failure", {
      error: err.message,
      stack: err.stack,
    });

  }
})();

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  logger.info("HTTP server listening", {
    port: PORT,
    env: process.env.NODE_ENV,
  });
});



const shutdown = async (signal) => {
  logger.warn("Shutdown signal received", { signal });

  try {
    if (global.io) {
      await global.io.close();
      logger.info("Socket.IO closed");
    }
    process.exit(0);
  } catch (err) {
    logger.error("Error during graceful shutdown", {
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  }
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

process.on("unhandledRejection", (reason, promise) => {
  crashLogger.fatal("Unhandled Promise Rejection", {
    reason: reason?.message || reason,
    stack: reason?.stack,
  });

  setTimeout(() => {
    process.exit(1);
  }, 100);
});

process.on("uncaughtException", (err) => {
  crashLogger.fatal("Uncaught Exception", {
    error: err.message,
    stack: err.stack,
  });

  setTimeout(() => {
    process.exit(1);
  }, 100);
});
