import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import * as path from 'path';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    // Crear directorio de logs si no existe
    const logsDir = path.join(process.cwd(), 'logs');

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL ?? 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss Z' }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(
          ({ timestamp, level, message, context, ...meta }) => {
            return JSON.stringify({
              timestamp,
              level: String(level).toUpperCase(),
              message,

              context:
                typeof context === 'object'
                  ? JSON.stringify(context)
                  : String(context ?? ''),
              ...meta,
            });
          },
        ),
      ),
      defaultMeta: { service: 'epn-event-manager' },
      transports: [
        // Logs en consola
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(
              ({ timestamp, level, message, context, ...meta }) => {
                const contextStr = context
                  ? `[${typeof context === 'object' ? JSON.stringify(context) : String(context)}]`
                  : '';
                const metaStr =
                  Object.keys(meta).length > 0
                    ? JSON.stringify(meta, null, 2)
                    : '';
                return `${String(timestamp)} ${String(level)} ${contextStr} ${String(message)} ${metaStr}`;
              },
            ),
          ),
        }),
        // Logs de ERROR en archivo
        new winston.transports.File({
          filename: path.join(logsDir, 'error.log'),
          level: 'error',
          format: winston.format.json(),
        }),
        // Todos los logs en archivo
        new winston.transports.File({
          filename: path.join(logsDir, 'combined.log'),
          format: winston.format.json(),
        }),
      ],
    });
  }

  log(message: string, context?: string, metadata?: Record<string, unknown>) {
    this.logger.info(message, { context, ...metadata });
  }

  error(
    message: string,
    trace?: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ) {
    this.logger.error(message, { trace, context, ...metadata });
  }

  warn(message: string, context?: string, metadata?: Record<string, unknown>) {
    this.logger.warn(message, { context, ...metadata });
  }

  debug(message: string, context?: string, metadata?: Record<string, unknown>) {
    this.logger.debug(message, { context, ...metadata });
  }
}
