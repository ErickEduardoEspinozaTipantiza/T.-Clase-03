import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventRegistrationService } from './event-registration.service';
import { LoggerService } from '../../../common/logger/logger.service';
import { CreateEventEntity } from '../../../database/entities/create-event.entity';
import { UpdateEventEntity } from '../../../database/entities/update-event.entity';
import { DeleteEventEntity } from '../../../database/entities/delete-event.entity';
import { QueryEventEntity } from '../../../database/entities/query-event.entity';
import { CreateEventDto } from '../dto/create-event.dto';

describe('EventRegistrationService', () => {
  let service: EventRegistrationService;

  const mockRepository = {
    create: jest.fn((entity) => entity),
    save: jest.fn(),
  };

  const mockLogger = {
    log: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  };

  const baseDto: CreateEventDto = {
    source: 'crud-planetas',
    entity: 'planet',
    action: 'CREATE',
    title: 'Planeta creado',
    description: 'Se creó Marte',
    payload: { id: 1 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventRegistrationService,
        {
          provide: getRepositoryToken(CreateEventEntity),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(UpdateEventEntity),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(DeleteEventEntity),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(QueryEventEntity),
          useValue: mockRepository,
        },
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<EventRegistrationService>(EventRegistrationService);
    jest.clearAllMocks();
  });

  it.each(['CREATE', 'UPDATE', 'DELETE', 'QUERY'])(
    'debe persistir un evento %s exitosamente',
    async (action) => {
      const dto = { ...baseDto, action };
      mockRepository.save.mockResolvedValue({ id: 1 });

      const result = await service.registerEvent(dto);

      expect(result).toEqual({ ok: true });
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalled();
    },
  );

  it('debe normalizar la acción a mayúsculas', async () => {
    const dto = { ...baseDto, action: 'create' };
    mockRepository.save.mockResolvedValue({ id: 1 });

    const result = await service.registerEvent(dto);

    expect(result).toEqual({ ok: true });
    expect(mockRepository.save).toHaveBeenCalled();
  });

  it('debe rechazar acciones no soportadas', async () => {
    const dto = { ...baseDto, action: 'INVALID' };

    const result = await service.registerEvent(dto);

    expect(result).toEqual({ ok: false });
    expect(mockRepository.save).not.toHaveBeenCalled();
    expect(mockLogger.warn).toHaveBeenCalledWith(
      'Acción de evento no soportada',
      EventRegistrationService.name,
      expect.objectContaining({ action: 'INVALID' }),
    );
  });

  it('debe serializar payload vacío cuando no se envía', async () => {
    const dto = { ...baseDto, payload: undefined };
    mockRepository.save.mockResolvedValue({ id: 1 });

    await service.registerEvent(dto);

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ payload: '{}' }),
    );
  });
});
