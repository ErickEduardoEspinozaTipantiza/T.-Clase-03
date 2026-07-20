import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
  ValidationPipe,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { LoggerService } from '../../common/logger/logger.service';

/** Extrae el mensaje de un error de forma segura sin usar `any`. */
function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/** Extrae el stack trace de un error de forma segura. */
function toErrorStack(err: unknown): string {
  return err instanceof Error ? (err.stack ?? '') : '';
}

@Controller('events')
@UseGuards(ApiKeyGuard)
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly logger: LoggerService,
  ) {}

  @Post()
  async registerEvent(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: CreateEventDto,
  ) {
    try {
      this.logger.log('Registrando nuevo evento', 'EventsController', {
        source: dto.source,
        entity: dto.entity,
        action: dto.action,
      });

      const result = await this.eventsService.registerEvent(dto);

      this.logger.log('Evento registrado exitosamente', 'EventsController', {
        action: dto.action,
        source: dto.source,
      });

      return result;
    } catch (err) {
      this.logger.error(
        'Error al registrar evento',
        toErrorStack(err),
        'EventsController',
        {
          source: dto.source,
          error: toErrorMessage(err),
        },
      );
      throw new InternalServerErrorException('No se pudo registrar el evento');
    }
  }

  /**
   * Obtiene todos los eventos con filtro opcional por rango de fechas.
   * @param from  Fecha de inicio en formato ISO 8601 (ej. 2024-01-01T00:00:00Z)
   * @param to    Fecha de fin en formato ISO 8601 (ej. 2024-12-31T23:59:59Z)
   * @throws BadRequestException si from > to o si las fechas son inválidas
   */
  @Get()
  async findAll(@Query('from') from?: string, @Query('to') to?: string) {
    try {
      // Validación: si ambos parámetros están presentes, from debe ser <= to
      if (from && to) {
        const fromDate = new Date(from);
        const toDate = new Date(to);

        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
          throw new BadRequestException(
            'Los parámetros "from" y "to" deben ser fechas ISO 8601 válidas',
          );
        }

        if (fromDate > toDate) {
          throw new BadRequestException(
            'El parámetro "from" no puede ser mayor que "to"',
          );
        }
      }

      this.logger.log('Obteniendo todos los eventos', 'EventsController', {
        from,
        to,
      });

      const result = await this.eventsService.findAll({ from, to });

      this.logger.log(
        `Se obtuvieron ${result.length} eventos`,
        'EventsController',
        { from, to },
      );

      return result;
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      this.logger.error(
        'Error al obtener eventos',
        toErrorStack(err),
        'EventsController',
      );
      throw new InternalServerErrorException(
        'No se pudieron obtener los eventos',
      );
    }
  }

  @Get('source/:source')
  async findBySource(@Param('source') source: string) {
    try {
      if (!source || source.trim() === '') {
        throw new BadRequestException('source no puede estar vacío');
      }

      this.logger.log('Buscando eventos por source', 'EventsController', {
        source,
      });
      const result = await this.eventsService.findBySource(source);
      this.logger.log(
        `Se encontraron ${result.length} eventos para source=${source}`,
        'EventsController',
      );
      return result;
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      this.logger.warn(
        'Error al buscar eventos por source',
        'EventsController',
        {
          source,
          error: toErrorMessage(err),
        },
      );
      throw new BadRequestException(
        `No se pudieron obtener eventos para source: ${source}`,
      );
    }
  }

  @Get('entity/:entity')
  async findByEntity(@Param('entity') entity: string) {
    try {
      if (!entity || entity.trim() === '') {
        throw new BadRequestException('entity no puede estar vacío');
      }

      this.logger.log('Buscando eventos por entity', 'EventsController', {
        entity,
      });
      const result = await this.eventsService.findByEntity(entity);
      this.logger.log(
        `Se encontraron ${result.length} eventos para entity=${entity}`,
        'EventsController',
      );
      return result;
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      this.logger.warn(
        'Error al buscar eventos por entity',
        'EventsController',
        {
          entity,
          error: toErrorMessage(err),
        },
      );
      throw new BadRequestException(
        `No se pudieron obtener eventos para entity: ${entity}`,
      );
    }
  }
}
