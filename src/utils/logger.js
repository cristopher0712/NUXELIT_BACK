const winston = require('winston');

const options = {
  file: {
    level: 'info',
    filename: 'logs/app.log',
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  },
};

const transports = [new winston.transports.Console(options.console)];

// Vercel inyecta siempre process.env.VERCEL="1".
// Si estamos en Vercel, NUNCA habilitar logs en archivo por el Read-Only filesystem.
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  transports.push(new winston.transports.File(options.file));
}

const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  transports: transports,
  exitOnError: false, // do not exit on handled exceptions
});

module.exports = logger;
