import fs from "node:fs";
import path from "node:path";
import winston from "winston";

import { env } from "@/backend/common/config/env";

const isDev = env.nodeEnv === "development";
const logsDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    const base = `[${info.timestamp}] [${info.level.toUpperCase()}]`;
    if (info.stack) {
      return `${base} ${info.message}\n${info.stack}`;
    }
    return `${base} ${info.message}`;
  }),
);

const transports: winston.transport[] = [
  new winston.transports.File({
    filename: path.join(logsDir, "error.log"),
    level: "error",
    maxsize: 5242880,
    maxFiles: 5,
    format,
  }),
  new winston.transports.File({
    filename: path.join(logsDir, "combined.log"),
    maxsize: 5242880,
    maxFiles: 7,
    format,
  }),
];

export const logger = winston.createLogger({
  level: isDev ? "debug" : "info",
  format,
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "exceptions.log"),
      maxsize: 5242880,
      maxFiles: 5,
      format,
    }),
  ],
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection", { reason });
});
