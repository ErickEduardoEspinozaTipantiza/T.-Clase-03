import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from '../dto/create-event.dto';
import {
  EventAction,
  isSupportedEventAction,
  normalizeEventAction,
} from '../domain/event-action.enum';
import { EventRegistrationResult } from '../domain/event.types';
import { LoggerService } from '../../../common/logger/logger.service';
import { CreateEventEntity } from '../../../database/entities/create-event.entity';
import { UpdateEventEntity } from '../../../database/entities/update-event.entity';
import { DeleteEventEntity } from '../../../database/entities/delete-event.entity';
import { QueryEventEntity } from '../../../database/entities/query-event.entity';
import {
  buildCommonEventFields,
  getCurrentIsoTimestamp,
  serializeEventPayload,
} from '../utils/event-payload.util';

@Injectable()
export class EventRegistrationService {
  private readonly logContext = EventRegistrationService.name;

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

  async registerEvent(dto: CreateEventDto): Promise<EventRegistrationResult> {
    const normalizedAction = normalizeEventAction(dto.action);
    const serializedPayload = serializeEventPayload(dto.payload);
    const recordedAt = getCurrentIsoTimestamp();

    if (!isSupportedEventAction(normalizedAction)) {
      this.logger.warn('Acción de evento no soportada', this.logContext, {
        action: normalizedAction,
        source: dto.source,
        entity: dto.entity,
      });
      return { ok: false };
    }

    this.logger.debug('Persistiendo evento', this.logContext, {
      action: normalizedAction,
      source: dto.source,
      entity: dto.entity,
    });

    await this.persistEventByAction(
      normalizedAction,
      dto,
      serializedPayload,
      recordedAt,
    );

    this.logger.log('Evento persistido correctamente', this.logContext, {
      action: normalizedAction,
      source: dto.source,
    });

    return { ok: true };
  }

  private async persistEventByAction(
    action: EventAction,
    dto: CreateEventDto,
    serializedPayload: string,
    recordedAt: string,
  ): Promise<void> {
    const commonFields = buildCommonEventFields(dto, serializedPayload);

    const persistenceHandlers: Record<EventAction, () => Promise<void>> = {
      [EventAction.CREATE]: () =>
        this.saveCreateEvent(commonFields, recordedAt),
      [EventAction.UPDATE]: () =>
        this.saveUpdateEvent(commonFields, recordedAt),
      [EventAction.DELETE]: () =>
        this.saveDeleteEvent(commonFields, recordedAt),
      [EventAction.QUERY]: () => this.saveQueryEvent(commonFields, recordedAt),
    };

    await persistenceHandlers[action]();
  }

  private async saveCreateEvent(
    commonFields: ReturnType<typeof buildCommonEventFields>,
    recordedAt: string,
  ): Promise<void> {
    const createEvent = this.createEventRepository.create({
      ...commonFields,
      recorded_at: recordedAt,
    });
    await this.createEventRepository.save(createEvent);
  }

  private async saveUpdateEvent(
    commonFields: ReturnType<typeof buildCommonEventFields>,
    recordedAt: string,
  ): Promise<void> {
    const updateEvent = this.updateEventRepository.create({
      ...commonFields,
      timestamp: recordedAt,
    });
    await this.updateEventRepository.save(updateEvent);
  }

  private async saveDeleteEvent(
    commonFields: ReturnType<typeof buildCommonEventFields>,
    recordedAt: string,
  ): Promise<void> {
    const deleteEvent = this.deleteEventRepository.create({
      ...commonFields,
      createdAt: recordedAt,
    });
    await this.deleteEventRepository.save(deleteEvent);
  }

  private async saveQueryEvent(
    commonFields: ReturnType<typeof buildCommonEventFields>,
    recordedAt: string,
  ): Promise<void> {
    const queryEvent = this.queryEventRepository.create({
      ...commonFields,
      event_date: recordedAt,
    });
    await this.queryEventRepository.save(queryEvent);
  }
}
