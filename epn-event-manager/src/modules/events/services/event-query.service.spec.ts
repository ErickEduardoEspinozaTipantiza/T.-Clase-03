import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventQueryService } from './event-query.service';
import { LoggerService } from '../../../common/logger/logger.service';
import { CreateEventEntity } from '../../../database/entities/create-event.entity';
import { UpdateEventEntity } from '../../../database/entities/update-event.entity';
import { DeleteEventEntity } from '../../../database/entities/delete-event.entity';
import { QueryEventEntity } from '../../../database/entities/query-event.entity';

describe('EventQueryService', () => {
  let service: EventQueryService;

  const createRepo = { find: jest.fn(), findBy: jest.fn() };
  const updateRepo = { find: jest.fn(), findBy: jest.fn() };
  const deleteRepo = { find: jest.fn(), findBy: jest.fn() };
  const queryRepo = { find: jest.fn(), findBy: jest.fn() };

  const mockLogger = {
    log: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventQueryService,
        {
          provide: getRepositoryToken(CreateEventEntity),
          useValue: createRepo,
        },
        {
          provide: getRepositoryToken(UpdateEventEntity),
          useValue: updateRepo,
        },
        {
          provide: getRepositoryToken(DeleteEventEntity),
          useValue: deleteRepo,
        },
        { provide: getRepositoryToken(QueryEventEntity), useValue: queryRepo },
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<EventQueryService>(EventQueryService);
    jest.clearAllMocks();
  });

  describe('findAllEvents', () => {
    it('debe fusionar y ordenar eventos por timestamp ISO', async () => {
      createRepo.find.mockResolvedValue([
        { id: 2, recorded_at: '2026-06-02T10:00:00.000Z' },
      ]);
      updateRepo.find.mockResolvedValue([
        { id: 1, timestamp: '2026-06-01T10:00:00.000Z' },
      ]);
      deleteRepo.find.mockResolvedValue([]);
      queryRepo.find.mockResolvedValue([
        { id: 3, event_date: '2026-06-03T10:00:00.000Z' },
      ]);

      const result = await service.findAllEvents();

      expect(result).toHaveLength(3);
      expect(result[0]._timestamp).toBe('2026-06-01T10:00:00.000Z');
      expect(result[2]._timestamp).toBe('2026-06-03T10:00:00.000Z');
      expect(result[0]._table).toBe('update_events');
      expect(mockLogger.log).toHaveBeenCalled();
    });

    it('debe incluir eventos DELETE con campo createdAt', async () => {
      createRepo.find.mockResolvedValue([]);
      updateRepo.find.mockResolvedValue([]);
      deleteRepo.find.mockResolvedValue([
        { id: 4, createdAt: '2026-06-04T10:00:00.000Z' },
      ]);
      queryRepo.find.mockResolvedValue([]);

      const result = await service.findAllEvents();

      expect(result).toHaveLength(1);
      expect(result[0]._table).toBe('delete_events');
      expect(result[0]._timestamp).toBe('2026-06-04T10:00:00.000Z');
    });
  });

  describe('findEventsBySource', () => {
    it('debe consultar las cuatro tablas por source', async () => {
      createRepo.findBy.mockResolvedValue([{ id: 1, source: 'crud-a' }]);
      updateRepo.findBy.mockResolvedValue([]);
      deleteRepo.findBy.mockResolvedValue([]);
      queryRepo.findBy.mockResolvedValue([]);

      const result = await service.findEventsBySource('crud-a');

      expect(result).toHaveLength(1);
      expect(createRepo.findBy).toHaveBeenCalledWith({ source: 'crud-a' });
    });
  });

  describe('findEventsByEntity', () => {
    it('debe consultar las cuatro tablas por entity', async () => {
      createRepo.findBy.mockResolvedValue([]);
      updateRepo.findBy.mockResolvedValue([{ id: 2, entity: 'planet' }]);
      deleteRepo.findBy.mockResolvedValue([]);
      queryRepo.findBy.mockResolvedValue([]);

      const result = await service.findEventsByEntity('planet');

      expect(result).toHaveLength(1);
      expect(updateRepo.findBy).toHaveBeenCalledWith({ entity: 'planet' });
    });
  });
});
