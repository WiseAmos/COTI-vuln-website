const { createLogger, format, transports } = require("winston");
const Syslog = require("winston-syslog").Syslog;
const path = require("path");

const logFilePath = path.join(__dirname, "logs", "application.log");

// Ensure the logs directory exists
const fs = require("fs");
if (!fs.existsSync("logs")) {
  fs.mkdirSync("logs");
}

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.json() // JSON format for structured logging
  ),
  transports: [
    new transports.Console(), // Logs to console
    new transports.File({
      filename: logFilePath, // Save logs to a local file
      level: "info", // Log only info level and above
    }),
  ],
});

module.exports = logger;
