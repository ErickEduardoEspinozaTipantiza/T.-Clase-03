import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { EventRegistrationService } from './services/event-registration.service';
import { EventQueryService } from './services/event-query.service';
import { EventStatsService } from './services/event-stats.service';

describe('EventsService', () => {
  let service: EventsService;

  const mockRegistrationService = {
    registerEvent: jest.fn(),
  };
  const mockQueryService = {
    findAllEvents: jest.fn(),
    findEventsBySource: jest.fn(),
    findEventsByEntity: jest.fn(),
  };
  const mockStatsService = {
    getEventStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: EventRegistrationService,
          useValue: mockRegistrationService,
        },
        { provide: EventQueryService, useValue: mockQueryService },
        { provide: EventStatsService, useValue: mockStatsService },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    jest.clearAllMocks();
  });

  it('debe delegar registerEvent al servicio de registro', async () => {
    mockRegistrationService.registerEvent.mockResolvedValue({ ok: true });
    const dto = {
      source: 'crud-a',
      entity: 'item',
      action: 'CREATE',
      title: 'Test',
    };

    await service.registerEvent(dto);

    expect(mockRegistrationService.registerEvent).toHaveBeenCalledWith(dto);
  });

  it('debe delegar findAll al servicio de consultas', async () => {
    mockQueryService.findAllEvents.mockResolvedValue([]);

    await service.findAll();

    expect(mockQueryService.findAllEvents).toHaveBeenCalled();
  });

  it('debe delegar findBySource al servicio de consultas', async () => {
    mockQueryService.findEventsBySource.mockResolvedValue([]);

    await service.findBySource('crud-a');

    expect(mockQueryService.findEventsBySource).toHaveBeenCalledWith('crud-a');
  });

  it('debe delegar getStats al servicio de estadísticas', async () => {
    mockStatsService.getEventStats.mockResolvedValue({ total: 0 });

    await service.getStats();

    expect(mockStatsService.getEventStats).toHaveBeenCalled();
  });
});
