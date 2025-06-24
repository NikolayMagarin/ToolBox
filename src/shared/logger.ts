import winston from 'winston';
import { config } from '../config';

export const logger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  format: winston.format.combine(winston.format.json(), {
    transform: (log) => {
      let message = log.message;
      if (typeof message === 'string') {
        // mask api keys
        message = message.replaceAll(
          /tbk_([0-9a-f]{10})([0-9a-f]{50})([0-9a-f]{4})/g,
          'tbk_$1****$3'
        );
      }
      return { ...log, message };
    },
  }),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
