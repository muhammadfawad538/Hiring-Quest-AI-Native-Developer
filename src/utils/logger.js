const fs = require('fs');
const path = require('path');

class Logger {
  constructor(options = {}) {
    this.level = options.level || 'info';
    this.logs = [];
    this.maxLogs = options.maxLogs || 1000;

    // Create logs directory if it doesn't exist
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    this.logFilePath = path.join(logsDir, 'ai-processing.log');
    this.writeStream = fs.createWriteStream(this.logFilePath, { flags: 'a' });

    // Initialize with a startup message
    this.info('Logger initialized');
  }

  log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      meta,
      pid: process.pid
    };

    // Store in memory
    this.logs.push(logEntry);

    // Maintain max logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Write to file
    this.writeStream.write(JSON.stringify(logEntry) + '\n');

    // Console output for higher priority logs
    if (['error', 'warn'].includes(level)) {
      console[level](`[${level.toUpperCase()}] ${timestamp}: ${message}`, meta);
    } else {
      console.log(`[${level.toUpperCase()}] ${timestamp}: ${message}`, meta);
    }
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  debug(message, meta = {}) {
    if (this.level === 'debug') {
      this.log('debug', message, meta);
    }
  }

  getRecentLogs(count = 50) {
    return this.logs.slice(-count);
  }

  getAllLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    // Truncate the log file
    fs.writeFileSync(this.logFilePath, '');
  }

  close() {
    if (this.writeStream) {
      this.writeStream.end();
    }
  }
}

module.exports = { Logger };