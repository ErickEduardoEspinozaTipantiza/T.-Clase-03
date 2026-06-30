import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
  ValidationPipe,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { LoggerService } from '../../common/logger/logger.service';

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
    } catch (error) {
      this.logger.error(
        'Error al registrar evento',
        error.stack,
        'EventsController',
        {
          source: dto.source,
          error: error.message,
        },
      );
      throw new InternalServerErrorException('No se pudo registrar el evento');
    }
  }

  @Get()
  async findAll() {
    try {
      this.logger.log('Obteniendo todos los eventos', 'EventsController');
      const result = await this.eventsService.findAll();
      this.logger.log(
        `Se obtuvieron ${result.length} eventos`,
        'EventsController',
      );
      return result;
    } catch (error) {
      this.logger.error(
        'Error al obtener eventos',
        error.stack,
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
    } catch (error) {
      this.logger.warn(
        'Error al buscar eventos por source',
        'EventsController',
        {
          source,
          error: error.message,
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
    } catch (error) {
      this.logger.warn(
        'Error al buscar eventos por entity',
        'EventsController',
        {
          entity,
          error: error.message,
        },
      );
      throw new BadRequestException(
        `No se pudieron obtener eventos para entity: ${entity}`,
      );
    }
  }
}
