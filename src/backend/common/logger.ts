import winston from "winston";

import { env } from "@/backend/common/env";

const isDev = env.nodeEnv === "development";

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
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      format,
    ),
  }),
];

if (!isDev) {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880,
      maxFiles: 5,
      format,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880,
      maxFiles: 7,
      format,
    }),
  );
}

export const logger = winston.createLogger({
  level: isDev ? "debug" : "info",
  format,
  transports,
  exceptionHandlers: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        format,
      ),
    }),
  ],
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection", { reason });
});
