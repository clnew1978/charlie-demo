const winston = require('winston');
const winstonDailyRotateField = require('winston-daily-rotate-file');

import { config } from '../environment';
import path from 'path';

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.splat(),
  winston.format.simple(),
  winston.format.printf(
    (info: { level: string, message: string, timestamp: string }) => `${info.timestamp} ${info.level}: ${info.message.trim()}`,
  )
);
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.splat(),
  winston.format.simple(),
  winston.format.printf(
    (info: { level: string, message: string, timestamp: string }) => `${info.timestamp} ${info.level}: ${info.message.trim()}`,
  )
);

config.log = config.log || {};
config.log.path = config.log.path || './logs';
config.log.level = config.log.level || 'info';

const transports = [
  new winstonDailyRotateField({
    filename: path.join(config.log.path, '%DATE%.log'),
    dataPattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    prepend: true,
    format: fileFormat,
  }),
  new winston.transports.Console({ format: consoleFormat }),
];

const _logger = winston.createLogger({ level: config.log.level, transports: transports });
_logger.info('logger created: path(%s), level(%s).', config.log.path, config.log.level);

function debug(message?: any, ...optionalParams: any[]): void {
  _logger.log('debug', message, ...optionalParams);
}

function info(message?: any, ...optionalParams: any[]): void {
  _logger.log('info', message, ...optionalParams);
}

function warn(message?: any, ...optionalParams: any[]): void {
  _logger.log('warn', message, ...optionalParams);
}

function error(message?: any, ...optionalParams: any[]): void {
  _logger.log('error', message, ...optionalParams);
}

const logger = {
  debug, info, error, warn
};

export = logger;