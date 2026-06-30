import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MergedEventRecord } from '../domain/event.types';
import { LoggerService } from '../../../common/logger/logger.service';
import { CreateEventEntity } from '../../../database/entities/create-event.entity';
import { UpdateEventEntity } from '../../../database/entities/update-event.entity';
import { DeleteEventEntity } from '../../../database/entities/delete-event.entity';
import { QueryEventEntity } from '../../../database/entities/query-event.entity';
import {
  attachTableMetadata,
  sortEventsByTimestamp,
} from '../utils/event-timestamp.util';

@Injectable()
export class EventQueryService {
  private readonly logContext = EventQueryService.name;

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

  async findAllEvents(): Promise<MergedEventRecord[]> {
    this.logger.debug('Consultando todos los eventos', this.logContext);

    const [createEvents, updateEvents, deleteEvents, queryEvents] =
      await Promise.all([
        this.createEventRepository.find(),
        this.updateEventRepository.find(),
        this.deleteEventRepository.find(),
        this.queryEventRepository.find(),
      ]);

    const mergedEvents: MergedEventRecord[] = [
      ...createEvents.map((event) =>
        attachTableMetadata(event, 'create_events', 'recorded_at'),
      ),
      ...updateEvents.map((event) =>
        attachTableMetadata(event, 'update_events', 'timestamp'),
      ),
      ...deleteEvents.map((event) =>
        attachTableMetadata(event, 'delete_events', 'createdAt'),
      ),
      ...queryEvents.map((event) =>
        attachTableMetadata(event, 'query_events', 'event_date'),
      ),
    ];

    const sortedEvents = sortEventsByTimestamp(mergedEvents);

    this.logger.log(
      `Consulta completada: ${sortedEvents.length} eventos`,
      this.logContext,
    );

    return sortedEvents;
  }

  async findEventsBySource(source: string): Promise<object[]> {
    this.logger.debug('Consultando eventos por source', this.logContext, {
      source,
    });

    const [createEvents, updateEvents, deleteEvents, queryEvents] =
      await Promise.all([
        this.createEventRepository.findBy({ source }),
        this.updateEventRepository.findBy({ source }),
        this.deleteEventRepository.findBy({ source }),
        this.queryEventRepository.findBy({ source }),
      ]);

    return [...createEvents, ...updateEvents, ...deleteEvents, ...queryEvents];
  }

  async findEventsByEntity(entity: string): Promise<object[]> {
    this.logger.debug('Consultando eventos por entity', this.logContext, {
      entity,
    });

    const [createEvents, updateEvents, deleteEvents, queryEvents] =
      await Promise.all([
        this.createEventRepository.findBy({ entity }),
        this.updateEventRepository.findBy({ entity }),
        this.deleteEventRepository.findBy({ entity }),
        this.queryEventRepository.findBy({ entity }),
      ]);

    return [...createEvents, ...updateEvents, ...deleteEvents, ...queryEvents];
  }
}
