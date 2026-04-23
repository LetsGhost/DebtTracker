import fs from "node:fs";
import path from "node:path";
import winston from "winston";

import { env } from "@/backend/common/config/env";

const isDev = env.nodeEnv === "development";
const logsDir = path.join(process.cwd(), "logs");

const serializeLogValue = (value: unknown, seen = new WeakSet<object>()): unknown => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
      cause: value.cause ? serializeLogValue(value.cause, seen) : undefined,
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeLogValue(item, seen));
  }

  if (value && typeof value === "object") {
    const objectValue = value as Record<string, unknown>;

    if (seen.has(objectValue)) {
      return "[Circular]";
    }

    seen.add(objectValue);

    return Object.fromEntries(
      Object.entries(objectValue).map(([key, entry]) => [key, serializeLogValue(entry, seen)]),
    );
  }

  return value;
};

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    const base = `[${info.timestamp}] [${info.level.toUpperCase()}]`;
    const metadataKeys = Object.keys(info).filter((key) => !["level", "message", "timestamp", "stack"].includes(key));
    const metadataText =
      metadataKeys.length > 0
        ? ` | ${JSON.stringify(
            Object.fromEntries(metadataKeys.map((key) => [key, serializeLogValue((info as Record<string, unknown>)[key])])),
          )}`
        : "";

    if (info.stack) {
      return `${base} ${info.message}${metadataText}\n${info.stack}`;
    }
    return `${base} ${info.message}${metadataText}`;
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
