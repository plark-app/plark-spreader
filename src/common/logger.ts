import fs from 'fs';
import { createLogger, transports, format } from 'winston';
import { TransformableInfo } from 'logform';

const mkdirp = require('mkdirp-sync');

const logDir = process.env.LOG_PATH || '/var/log/docker/plark-spreader';
if (!fs.existsSync(logDir)) {
    mkdirp(logDir);
}

const fileFormat = format.combine(format.timestamp(), format.json());
const logger = createLogger({
    transports: [
        new transports.File({
            format: fileFormat,
            dirname: logDir,
            filename: 'error.json',
            level: 'error',
        }),
        new transports.File({
            format: fileFormat,
            dirname: logDir,
            filename: 'app.json',
            level: 'info',
        }),
    ],
});

const isDebugMode = process.env.NODE_ENV !== 'production' || process.env.DEBUG;

logger.add(
    new transports.Console({
        level: isDebugMode ? 'debug' : 'info',
        format: format.combine(
            format.colorize(),
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf((info: TransformableInfo) => {
                return `${info.timestamp} ${info.level}: ${JSON.stringify(info.message)}`;
            }),
        ),
    }),
);

export default logger;
