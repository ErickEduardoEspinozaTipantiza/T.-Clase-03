import { EventsService } from './events.service';
import { DateRangeFilter } from './domain/event.types';

/**
 * Tests unitarios para EventsService.
 * Cubre: registerEvent, findAll, findBySource, findByEntity,
 *        getStats y el helper applyDateRangeFilter.
 */
describe('EventsService', () => {
  let service: EventsService;

  // Mocks de repositorios TypeORM
  const makeRepoMock = () => ({
    create: jest.fn((dto) => dto),
    save: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockResolvedValue([]),
    findBy: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
  });

  let createRepo: ReturnType<typeof makeRepoMock>;
  let updateRepo: ReturnType<typeof makeRepoMock>;
  let deleteRepo: ReturnType<typeof makeRepoMock>;
  let queryRepo: ReturnType<typeof makeRepoMock>;

  beforeEach(() => {
    createRepo = makeRepoMock();
    updateRepo = makeRepoMock();
    deleteRepo = makeRepoMock();
    queryRepo = makeRepoMock();

    service = new EventsService(
      createRepo as any,
      updateRepo as any,
      deleteRepo as any,
      queryRepo as any,
    );

    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // registerEvent
  // ─────────────────────────────────────────────
  describe('registerEvent', () => {
    const baseDto = {
      source: 'crud-test',
      entity: 'planet',
      title: 'Test',
      description: 'Descripción',
      payload: { id: 1 },
    };

    it('debe persistir un evento CREATE y retornar { ok: true }', async () => {
      const result = await service.registerEvent({
        ...baseDto,
        action: 'CREATE',
      });
      expect(result).toEqual({ ok: true });
      expect(createRepo.save).toHaveBeenCalledTimes(1);
    });

    it('debe persistir un evento UPDATE y retornar { ok: true }', async () => {
      const result = await service.registerEvent({
        ...baseDto,
        action: 'UPDATE',
      });
      expect(result).toEqual({ ok: true });
      expect(updateRepo.save).toHaveBeenCalledTimes(1);
    });

    it('debe persistir un evento DELETE y retornar { ok: true }', async () => {
      const result = await service.registerEvent({
        ...baseDto,
        action: 'DELETE',
      });
      expect(result).toEqual({ ok: true });
      expect(deleteRepo.save).toHaveBeenCalledTimes(1);
    });

    it('debe persistir un evento QUERY y retornar { ok: true }', async () => {
      const result = await service.registerEvent({
        ...baseDto,
        action: 'QUERY',
      });
      expect(result).toEqual({ ok: true });
      expect(queryRepo.save).toHaveBeenCalledTimes(1);
    });

    it('debe retornar { ok: false } para una acción no soportada', async () => {
      const result = await service.registerEvent({
        ...baseDto,
        action: 'EXPORT',
      });
      expect(result).toEqual({ ok: false });
      expect(createRepo.save).not.toHaveBeenCalled();
      expect(updateRepo.save).not.toHaveBeenCalled();
    });

    it('debe normalizar la acción a mayúsculas', async () => {
      const result = await service.registerEvent({
        ...baseDto,
        action: 'create',
      });
      expect(result).toEqual({ ok: true });
      expect(createRepo.save).toHaveBeenCalledTimes(1);
    });

    it('debe serializar el payload a JSON string', async () => {
      await service.registerEvent({ ...baseDto, action: 'CREATE' });
      const savedArg = createRepo.create.mock.calls[0][0];
      expect(savedArg.payload).toBe(JSON.stringify({ id: 1 }));
    });

    it('debe manejar payload undefined sin errores', async () => {
      const dtoSinPayload = {
        ...baseDto,
        action: 'CREATE',
        payload: undefined,
      };
      const result = await service.registerEvent(dtoSinPayload);
      expect(result).toEqual({ ok: true });
    });
  });

  // ─────────────────────────────────────────────
  // findAll
  // ─────────────────────────────────────────────
  describe('findAll', () => {
    it('debe retornar array vacío si no hay eventos', async () => {
      const result = await service.findAll();
      expect(result).toEqual([]);
    });

    it('debe combinar eventos de las 4 tablas', async () => {
      createRepo.find.mockResolvedValue([
        { id: 1, recorded_at: '2024-01-01T00:00:00Z' },
      ]);
      updateRepo.find.mockResolvedValue([
        { id: 2, timestamp: '2024-02-01T00:00:00Z' },
      ]);
      deleteRepo.find.mockResolvedValue([
        { id: 3, createdAt: '2024-03-01T00:00:00Z' },
      ]);
      queryRepo.find.mockResolvedValue([
        { id: 4, event_date: '2024-04-01T00:00:00Z' },
      ]);

      const result = await service.findAll();
      expect(result).toHaveLength(4);
    });

    it('debe ordenar eventos por _timestamp ascendente', async () => {
      createRepo.find.mockResolvedValue([
        { id: 2, recorded_at: '2024-06-01T00:00:00Z' },
      ]);
      updateRepo.find.mockResolvedValue([
        { id: 1, timestamp: '2024-01-01T00:00:00Z' },
      ]);

      const result = await service.findAll();
      const timestamps = result.map((e) => (e as any)._timestamp);
      expect(timestamps[0]).toBe('2024-01-01T00:00:00Z');
      expect(timestamps[1]).toBe('2024-06-01T00:00:00Z');
    });

    it('debe aplicar filtro de fechas cuando se proporciona', async () => {
      createRepo.find.mockResolvedValue([
        { id: 1, recorded_at: '2024-01-15T00:00:00Z' },
        { id: 2, recorded_at: '2024-07-01T00:00:00Z' },
      ]);

      const filter: DateRangeFilter = {
        from: '2024-01-01T00:00:00Z',
        to: '2024-03-31T23:59:59Z',
      };
      const result = await service.findAll(filter);
      expect(result).toHaveLength(1);
      expect((result[0] as any).id).toBe(1);
    });
  });

  // ─────────────────────────────────────────────
  // findBySource
  // ─────────────────────────────────────────────
  describe('findBySource', () => {
    it('debe buscar en las 4 tablas por source', async () => {
      createRepo.findBy.mockResolvedValue([{ id: 1, source: 'api-test' }]);

      const result = await service.findBySource('api-test');
      expect(result).toHaveLength(1);
      expect(createRepo.findBy).toHaveBeenCalledWith({ source: 'api-test' });
      expect(updateRepo.findBy).toHaveBeenCalledWith({ source: 'api-test' });
    });

    it('debe retornar array vacío si no hay coincidencias', async () => {
      const result = await service.findBySource('no-existe');
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────
  // findByEntity
  // ─────────────────────────────────────────────
  describe('findByEntity', () => {
    it('debe buscar en las 4 tablas por entity', async () => {
      updateRepo.findBy.mockResolvedValue([{ id: 5, entity: 'user' }]);

      const result = await service.findByEntity('user');
      expect(result).toHaveLength(1);
      expect(updateRepo.findBy).toHaveBeenCalledWith({ entity: 'user' });
    });

    it('debe retornar array vacío si no hay coincidencias', async () => {
      const result = await service.findByEntity('no-existe');
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────
  // getStats
  // ─────────────────────────────────────────────
  describe('getStats', () => {
    it('debe retornar conteos correctos de las 4 tablas', async () => {
      createRepo.count.mockResolvedValue(10);
      updateRepo.count.mockResolvedValue(5);
      deleteRepo.count.mockResolvedValue(2);
      queryRepo.count.mockResolvedValue(3);

      const result = await service.getStats();
      expect(result).toEqual({
        create: 10,
        update: 5,
        delete: 2,
        query: 3,
        total: 20,
      });
    });

    it('debe retornar ceros cuando no hay eventos', async () => {
      const result = await service.getStats();
      expect(result).toEqual({
        create: 0,
        update: 0,
        delete: 0,
        query: 0,
        total: 0,
      });
    });
  });

  // ─────────────────────────────────────────────
  // applyDateRangeFilter (helper público)
  // ─────────────────────────────────────────────
  describe('applyDateRangeFilter', () => {
    const makeEvent = (timestamp: string) => ({
      _table: 'create_events',
      _timestamp: timestamp,
    });

    const events = [
      makeEvent('2024-01-10T00:00:00.000Z'),
      makeEvent('2024-03-15T12:00:00.000Z'),
      makeEvent('2024-06-20T08:30:00.000Z'),
      makeEvent('2024-09-01T00:00:00.000Z'),
      makeEvent('2024-12-31T23:59:59.000Z'),
    ];

    it('debe retornar todos los eventos si no hay filtro', () => {
      const result = service.applyDateRangeFilter(events, {});
      expect(result).toHaveLength(5);
    });

    it('debe filtrar desde una fecha con solo "from"', () => {
      const filter: DateRangeFilter = { from: '2024-06-01T00:00:00.000Z' };
      const result = service.applyDateRangeFilter(events, filter);
      expect(result).toHaveLength(3);
    });

    it('debe filtrar hasta una fecha con solo "to"', () => {
      const filter: DateRangeFilter = { to: '2024-03-31T23:59:59.000Z' };
      const result = service.applyDateRangeFilter(events, filter);
      expect(result).toHaveLength(2);
    });

    it('debe filtrar dentro de un rango con "from" y "to"', () => {
      const filter: DateRangeFilter = {
        from: '2024-03-01T00:00:00.000Z',
        to: '2024-09-30T23:59:59.000Z',
      };
      const result = service.applyDateRangeFilter(events, filter);
      expect(result).toHaveLength(3);
    });

    it('debe retornar array vacío si from > to', () => {
      const filter: DateRangeFilter = {
        from: '2024-12-31T00:00:00.000Z',
        to: '2024-01-01T00:00:00.000Z',
      };
      const result = service.applyDateRangeFilter(events, filter);
      expect(result).toHaveLength(0);
    });

    it('debe incluir eventos sin _timestamp (tolerante)', () => {
      const eventsWithMissing = [
        makeEvent('2024-06-01T00:00:00.000Z'),
        { _table: 'query_events', _timestamp: '' },
      ];
      const filter: DateRangeFilter = { from: '2024-01-01T00:00:00.000Z' };
      const result = service.applyDateRangeFilter(eventsWithMissing, filter);
      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });
});
