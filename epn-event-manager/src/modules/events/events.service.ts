import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import {
  EventRegistrationResult,
  EventStatsSummary,
  MergedEventRecord,
} from './domain/event.types';
import { EventRegistrationService } from './services/event-registration.service';
import { EventQueryService } from './services/event-query.service';
import { EventStatsService } from './services/event-stats.service';

/**
 * Fachada de aplicación que delega la lógica de negocio a servicios especializados.
 */
@Injectable()
export class EventsService {
  constructor(
    private readonly eventRegistrationService: EventRegistrationService,
    private readonly eventQueryService: EventQueryService,
    private readonly eventStatsService: EventStatsService,
  ) {}

  registerEvent(dto: CreateEventDto): Promise<EventRegistrationResult> {
    return this.eventRegistrationService.registerEvent(dto);
  }

  findAll(): Promise<MergedEventRecord[]> {
    return this.eventQueryService.findAllEvents();
  }

  findBySource(source: string): Promise<object[]> {
    return this.eventQueryService.findEventsBySource(source);
  }

  findByEntity(entity: string): Promise<object[]> {
    return this.eventQueryService.findEventsByEntity(entity);
  }

  getStats(): Promise<EventStatsSummary> {
    return this.eventStatsService.getEventStats();
  }
}
