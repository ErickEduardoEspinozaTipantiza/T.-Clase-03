import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventStatsService } from './event-stats.service';
import { LoggerService } from '../../../common/logger/logger.service';
import { CreateEventEntity } from '../../../database/entities/create-event.entity';
import { UpdateEventEntity } from '../../../database/entities/update-event.entity';
import { DeleteEventEntity } from '../../../database/entities/delete-event.entity';
import { QueryEventEntity } from '../../../database/entities/query-event.entity';

describe('EventStatsService', () => {
  let service: EventStatsService;

  const createRepo = { count: jest.fn() };
  const updateRepo = { count: jest.fn() };
  const deleteRepo = { count: jest.fn() };
  const queryRepo = { count: jest.fn() };

  const mockLogger = {
    log: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventStatsService,
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

    service = module.get<EventStatsService>(EventStatsService);
    jest.clearAllMocks();
  });

  it('debe calcular el total incluyendo query_events', async () => {
    createRepo.count.mockResolvedValue(2);
    updateRepo.count.mockResolvedValue(1);
    deleteRepo.count.mockResolvedValue(1);
    queryRepo.count.mockResolvedValue(3);

    const stats = await service.getEventStats();

    expect(stats).toEqual({
      create: 2,
      update: 1,
      delete: 1,
      query: 3,
      total: 7,
    });
    expect(mockLogger.log).toHaveBeenCalledWith(
      'Estadísticas calculadas',
      EventStatsService.name,
      stats,
    );
  });
});
