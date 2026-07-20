import { EventsService } from './events.service';
import { DateRangeFilter } from './domain/event.types';

/**
 * Tests unitarios para EventsService.
 * Cubre: registerEvent (correlationId + acciones), findAll, findBySource,
 *        findByEntity, getStats y applyDateRangeFilter.
 */
describe('EventsService', () => {
  let service: EventsService;

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
  // registerEvent — correlationId
  // ─────────────────────────────────────────────
  describe('registerEvent — correlationId', () => {
    const baseDto = {
      source: 'crud-test',
      entity: 'planet',
      title: 'Test',
      description: 'Descripción',
      payload: { id: 1 },
    };

    it('debe retornar un correlationId UUID v4 válido en evento CREATE', async () => {
      const result = await service.registerEvent({
        ...baseDto,
        action: 'CREATE',
      });
      expect(result.ok).toBe(true);
      expect(result.correlationId).toBeDefined();
      // UUID v4 pattern: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      expect(result.correlationId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('debe retornar un correlationId UUID v4 válido en evento UPDATE', async () => {
      const result = await service.registerEvent({
        ...baseDto,
        action: 'UPDATE',
      });
      expect(result.ok).toBe(true);
      expect(result.correlationId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('debe retornar un correlationId UUID v4 válido en evento DELETE', async () => {
      const result = await service.registerEvent({
        ...baseDto,
        action: 'DELETE',
      });
      expect(result.ok).toBe(true);
      expect(result.correlationId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('debe retornar un correlationId UUID v4 válido en evento QUERY', async () => {
      const result = await service.registerEvent({
        ...baseDto,
        action: 'QUERY',
      });
      expect(result.ok).toBe(true);
      expect(result.correlationId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('debe retornar correlationId incluso cuando la acción no es soportada', async () => {
      const result = await service.registerEvent({
        ...baseDto,
        action: 'EXPORT',
      });
      expect(result.ok).toBe(false);
      expect(result.correlationId).toBeDefined();
      expect(result.correlationId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('debe generar un correlationId único por cada llamada', async () => {
      const result1 = await service.registerEvent({
        ...baseDto,
        action: 'CREATE',
      });
      const result2 = await service.registerEvent({
        ...baseDto,
        action: 'CREATE',
      });
      expect(result1.correlationId).not.toBe(result2.correlationId);
    });

    it('debe persistir CREATE y retornar { ok: true }', async () => {
      const result = await service.registerEvent({
        ...baseDto,
        action: 'CREATE',
      });
      expect(result).toMatchObject({ ok: true });
      expect(createRepo.save).toHaveBeenCalledTimes(1);
    });

    it('debe persistir UPDATE y retornar { ok: true }', async () => {
      const result = await service.registerEvent({
        ...baseDto,
        action: 'UPDATE',
      });
      expect(result).toMatchObject({ ok: true });
      expect(updateRepo.save).toHaveBeenCalledTimes(1);
    });

    it('debe persistir DELETE y retornar { ok: true }', async () => {
      const result = await service.registerEvent({
        ...baseDto,
        action: 'DELETE',
      });
      expect(result).toMatchObject({ ok: true });
      expect(deleteRepo.save).toHaveBeenCalledTimes(1);
    });

    it('debe persistir QUERY y retornar { ok: true }', async () => {
      const result = await service.registerEvent({
        ...baseDto,
        action: 'QUERY',
      });
      expect(result).toMatchObject({ ok: true });
      expect(queryRepo.save).toHaveBeenCalledTimes(1);
    });

    it('debe normalizar la acción a mayúsculas', async () => {
      const result = await service.registerEvent({
        ...baseDto,
        action: 'create',
      });
      expect(result).toMatchObject({ ok: true });
      expect(createRepo.save).toHaveBeenCalledTimes(1);
    });

    it('debe manejar payload undefined sin errores', async () => {
      const dtoSinPayload = {
        ...baseDto,
        action: 'CREATE',
        payload: undefined,
      };
      const result = await service.registerEvent(dtoSinPayload);
      expect(result).toMatchObject({ ok: true });
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
    });
  });

  // ─────────────────────────────────────────────
  // getStats
  // ─────────────────────────────────────────────
  describe('getStats', () => {
    it('debe retornar conteos correctos', async () => {
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
  });

  // ─────────────────────────────────────────────
  // applyDateRangeFilter
  // ─────────────────────────────────────────────
  describe('applyDateRangeFilter', () => {
    const makeEvent = (timestamp: string) => ({
      _table: 'create_events',
      _timestamp: timestamp,
    });

    const events = [
      makeEvent('2024-01-10T00:00:00.000Z'),
      makeEvent('2024-06-20T08:30:00.000Z'),
      makeEvent('2024-12-31T23:59:59.000Z'),
    ];

    it('debe retornar todos los eventos si no hay filtro', () => {
      const result = service.applyDateRangeFilter(events, {});
      expect(result).toHaveLength(3);
    });

    it('debe filtrar con "from" y "to"', () => {
      const filter: DateRangeFilter = {
        from: '2024-02-01T00:00:00.000Z',
        to: '2024-11-30T23:59:59.000Z',
      };
      const result = service.applyDateRangeFilter(events, filter);
      expect(result).toHaveLength(1);
    });

    it('debe retornar array vacío si from > to', () => {
      const filter: DateRangeFilter = {
        from: '2024-12-31T00:00:00.000Z',
        to: '2024-01-01T00:00:00.000Z',
      };
      const result = service.applyDateRangeFilter(events, filter);
      expect(result).toHaveLength(0);
    });
  });
});
