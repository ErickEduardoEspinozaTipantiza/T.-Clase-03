import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventStatsSummary } from '../domain/event.types';
import { LoggerService } from '../../../common/logger/logger.service';
import { CreateEventEntity } from '../../../database/entities/create-event.entity';
import { UpdateEventEntity } from '../../../database/entities/update-event.entity';
import { DeleteEventEntity } from '../../../database/entities/delete-event.entity';
import { QueryEventEntity } from '../../../database/entities/query-event.entity';

@Injectable()
export class EventStatsService {
  private readonly logContext = EventStatsService.name;

  constructor(
    @InjectRepository(CreateEventEntity)
    private readonly createEventRepository: Repository<CreateEventEntity>,
    @InjectRepository(UpdateEventEntity)
    private readonly updateEventRepository: Repository<UpdateEventEntity>,
    @InjectRepository(DeleteEventEntity)
    private readonly deleteEventRepository: Repository<DeleteEventEntity>,
    @InjectRepository(QueryEventEntity)
    private readonly queryEventRepository: Repository<QueryEventEntity>,
    private readonly logger: LoggerService,
  ) {}

  async getEventStats(): Promise<EventStatsSummary> {
    this.logger.debug('Calculando estadísticas de eventos', this.logContext);

    const [createCount, updateCount, deleteCount, queryCount] =
      await Promise.all([
        this.createEventRepository.count(),
        this.updateEventRepository.count(),
        this.deleteEventRepository.count(),
        this.queryEventRepository.count(),
      ]);

    const stats: EventStatsSummary = {
      create: createCount,
      update: updateCount,
      delete: deleteCount,
      query: queryCount,
      total: createCount + updateCount + deleteCount + queryCount,
    };

    this.logger.log('Estadísticas calculadas', this.logContext, stats);

    return stats;
  }
}
