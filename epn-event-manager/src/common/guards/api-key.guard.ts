import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private logger: LoggerService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers[process.env.API_KEY_HEADER?.toLowerCase() || 'x-fis-epn-key'];
    const expectedKey = process.env.API_KEY_SECRET;

    if (!apiKey) {
      this.logger.warn('Intento de acceso sin API-Key', 'ApiKeyGuard', {
        endpoint: request.url,
        method: request.method,
        ip: request.ip,
      });
      throw new UnauthorizedException('API-Key requerida');
    }

    if (apiKey !== expectedKey) {
      this.logger.warn('Intento de acceso con API-Key inválida', 'ApiKeyGuard', {
        endpoint: request.url,
        method: request.method,
        ip: request.ip,
        providedKey: apiKey.toString().slice(0, 10) + '***',
      });
      throw new UnauthorizedException('API-Key inválida');
    }

    this.logger.log('Acceso autorizado', 'ApiKeyGuard', {
      endpoint: request.url,
      method: request.method,
    });

    return true;
  }
}
