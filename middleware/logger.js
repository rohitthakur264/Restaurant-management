const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const log = `[${timestamp}] ${req.method} ${req.originalUrl} - IP: ${req.ip}\n`;
    const logFile = path.join(logDir, `${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFile(logFile, log, (err) => {
        if (err) console.error('Log write error:', err);
    });
    next();
};

module.exports = logger;
