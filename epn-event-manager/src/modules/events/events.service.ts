import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateEventEntity } from '../../database/entities/create-event.entity';
import { UpdateEventEntity } from '../../database/entities/update-event.entity';
import { DeleteEventEntity } from '../../database/entities/delete-event.entity';
import { QueryEventEntity } from '../../database/entities/query-event.entity';
import { DateRangeFilter, EventRegistrationResult } from './domain/event.types';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(CreateEventEntity)
    private readonly createRepo: Repository<CreateEventEntity>,
    @InjectRepository(UpdateEventEntity)
    private readonly updateRepo: Repository<UpdateEventEntity>,
    @InjectRepository(DeleteEventEntity)
    private readonly deleteRepo: Repository<DeleteEventEntity>,
    @InjectRepository(QueryEventEntity)
    private readonly queryRepo: Repository<QueryEventEntity>,
  ) {}

  /**
   * Registra un nuevo evento en la tabla correspondiente según su acción.
   * Retorna `{ ok, correlationId }` para trazabilidad de la petición.
   */
  async registerEvent(dto: CreateEventDto): Promise<EventRegistrationResult> {
    const correlationId = randomUUID();
    const action = (dto.action ?? '').toUpperCase();
    const payloadStr = JSON.stringify(dto.payload ?? {});
    // ADAPTATIVO: Fecha guardada en UTC (ISO 8601) para compatibilidad entre sistemas
    const isoDate = new Date().toISOString();

    if (action === 'CREATE') {
      const ev = this.createRepo.create({
        source: dto.source,
        entity: dto.entity,
        action: dto.action,
        title: dto.title,
        description: dto.description,
        payload: payloadStr,
        recorded_at: isoDate,
      });
      await this.createRepo.save(ev);
      return { ok: true, correlationId };
    }

    if (action === 'UPDATE') {
      const ev = this.updateRepo.create({
        source: dto.source,
        entity: dto.entity,
        action: dto.action,
        title: dto.title,
        description: dto.description,
        payload: payloadStr,
        timestamp: isoDate,
      });
      await this.updateRepo.save(ev);
      return { ok: true, correlationId };
    }

    if (action === 'DELETE') {
      // CORREGIDO (mantenimiento correctivo): se construye el objeto y se persiste
      const ev = this.deleteRepo.create({
        source: dto.source,
        entity: dto.entity,
        action: dto.action,
        title: dto.title,
        description: dto.description,
        payload: payloadStr,
        createdAt: isoDate,
      });
      await this.deleteRepo.save(ev);
      return { ok: true, correlationId };
    }

    if (action === 'QUERY') {
      const ev = this.queryRepo.create({
        source: dto.source,
        entity: dto.entity,
        action: dto.action,
        title: dto.title,
        description: dto.description,
        payload: payloadStr,
        event_date: isoDate,
      });
      await this.queryRepo.save(ev);
      return { ok: true, correlationId };
    }

    return { ok: false, correlationId };
  }

  /**
   * Retorna todos los eventos combinados de las 4 tablas.
   * Acepta un filtro opcional de rango de fechas (ISO 8601).
   * Si `from > to`, retorna un array vacío.
   */
  async findAll(filter?: DateRangeFilter): Promise<object[]> {
    const creates = await this.createRepo.find();
    const updates = await this.updateRepo.find();
    const deletes = await this.deleteRepo.find();
    const queries = await this.queryRepo.find();

    const merged = [
      ...creates.map((e) => ({
        ...e,
        _table: 'create_events',
        _timestamp: (e as unknown as Record<string, string>).recorded_at,
      })),
      ...updates.map((e) => ({
        ...e,
        _table: 'update_events',
        _timestamp: (e as unknown as Record<string, string>).timestamp,
      })),
      ...deletes.map((e) => ({
        ...e,
        _table: 'delete_events',
        _timestamp: (e as unknown as Record<string, string>).createdAt,
      })),
      ...queries.map((e) => ({
        ...e,
        _table: 'query_events',
        _timestamp: (e as unknown as Record<string, string>).event_date,
      })),
    ];

    // PERFECTIVO: Ordena por timestamp ISO normalizado (ascendente)
    merged.sort((a, b) => {
      const ta = (a as unknown as Record<string, string>)._timestamp ?? '';
      const tb = (b as unknown as Record<string, string>)._timestamp ?? '';
      return ta.localeCompare(tb);
    });

    if (filter?.from || filter?.to) {
      return this.applyDateRangeFilter(merged, filter);
    }

    return merged;
  }

  /**
   * Aplica el filtro de rango de fechas sobre los eventos ya combinados.
   * Si from > to, retorna array vacío.
   */
  applyDateRangeFilter(events: object[], filter: DateRangeFilter): object[] {
    const fromDate = filter.from ? new Date(filter.from) : null;
    const toDate = filter.to ? new Date(filter.to) : null;

    if (fromDate && toDate && fromDate > toDate) {
      return [];
    }

    return events.filter((e) => {
      const ts = (e as unknown as Record<string, string>)._timestamp;
      if (!ts) return true;
      const eventDate = new Date(ts);
      if (fromDate && eventDate < fromDate) return false;
      if (toDate && eventDate > toDate) return false;
      return true;
    });
  }

  async findBySource(source: string): Promise<object[]> {
    const creates = await this.createRepo.findBy({ source });
    const updates = await this.updateRepo.findBy({ source });
    const deletes = await this.deleteRepo.findBy({ source });
    const queries = await this.queryRepo.findBy({ source });
    return [...creates, ...updates, ...deletes, ...queries];
  }

  async findByEntity(entity: string): Promise<object[]> {
    const creates = await this.createRepo.findBy({ entity });
    const updates = await this.updateRepo.findBy({ entity });
    const deletes = await this.deleteRepo.findBy({ entity });
    const queries = await this.queryRepo.findBy({ entity });
    return [...creates, ...updates, ...deletes, ...queries];
  }

  async getStats(): Promise<object> {
    const createCount = await this.createRepo.count();
    const updateCount = await this.updateRepo.count();
    const deleteCount = await this.deleteRepo.count();
    // PERFECTIVO: Ahora incluye query_events en el total (antes faltaba)
    const queryCount = await this.queryRepo.count();
    return {
      create: createCount,
      update: updateCount,
      delete: deleteCount,
      query: queryCount,
      total: createCount + updateCount + deleteCount + queryCount,
    };
  }
}
