const { createLogger, format, transports } = require('winston');
const Syslog = require('winston-syslog').Syslog;

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json() // JSON format for structured logging
  ),
  transports: [
    new transports.Console(), // Logs to console
    new Syslog({
      host: '192.168.8.100', // Replace with your Wazuh server's IP
      port: 443, // Syslog default port
      protocol: 'udp4', // Use 'tcp4' if your setup requires it
      localhost: 'my-node-app', // Identify your application
      app_name: 'node-app', // Application name in logs
      facility: 'local0' // Default syslog facility
    })
  ],
});

module.exports = logger;
