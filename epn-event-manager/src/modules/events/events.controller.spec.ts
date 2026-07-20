import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { LoggerService } from '../../common/logger/logger.service';
import { CreateEventDto } from './dto/create-event.dto';

describe('EventsController', () => {
  let controller: EventsController;
  let service: EventsService;
  let logger: LoggerService;

  const mockEventsService = {
    registerEvent: jest.fn(),
    findAll: jest.fn(),
    findBySource: jest.fn(),
    findByEntity: jest.fn(),
  };

  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        { provide: EventsService, useValue: mockEventsService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get<EventsService>(EventsService);
    logger = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerEvent', () => {
    const dto: CreateEventDto = {
      source: 'crud-planetas',
      entity: 'planet',
      action: 'CREATE',
      title: 'Planeta creado',
      description: 'Se creó Marte',
      payload: { id: 1, name: 'Marte' },
    };

    it('CORRECTO: debe registrar un evento y retornar { ok, correlationId }', async () => {
      const expected = {
        ok: true,
        correlationId: '550e8400-e29b-41d4-a716-446655440000',
      };
      mockEventsService.registerEvent.mockResolvedValue(expected);

      const result = await controller.registerEvent(dto);

      expect(result).toEqual(expected);
      expect(result).toHaveProperty('correlationId');
      expect(service.registerEvent).toHaveBeenCalledWith(dto);
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('Registrando nuevo evento'),
        'EventsController',
        expect.any(Object),
      );
    });

    it('FEATURE: el correlationId en la respuesta debe ser un string no vacío', async () => {
      mockEventsService.registerEvent.mockResolvedValue({
        ok: true,
        correlationId: 'abc-123-uuid',
      });

      const result = await controller.registerEvent(dto);

      expect(result.correlationId).toBeTruthy();
      expect(typeof result.correlationId).toBe('string');
    });

    it('PREVENTIVO: debe rechazar evento con validación fallida', () => {
      const invalidDto = {
        source: 'crud-planetas!',
        entity: 'planet',
        action: 'CREATE',
        title: 'Planeta creado',
      };
      expect(invalidDto.source).toMatch(/[!]/);
    });

    it('CORRECTIVO: debe manejar errores y registrarlos', async () => {
      const error = new Error('Error de base de datos');
      mockEventsService.registerEvent.mockRejectedValue(error);

      await expect(controller.registerEvent(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error al registrar evento'),
        expect.any(String),
        'EventsController',
        expect.any(Object),
      );
    });
  });

  describe('findAll', () => {
    it('CORRECTO: debe obtener todos los eventos sin filtro', async () => {
      const events = [{ id: 1, source: 'crud-planetas', entity: 'planet' }];
      mockEventsService.findAll.mockResolvedValue(events);

      const result = await controller.findAll();

      expect(result).toEqual(events);
      expect(service.findAll).toHaveBeenCalledWith({
        from: undefined,
        to: undefined,
      });
    });

    it('FEATURE: debe filtrar eventos por rango de fechas válido', async () => {
      const events = [{ id: 1, _timestamp: '2024-06-15T00:00:00Z' }];
      mockEventsService.findAll.mockResolvedValue(events);

      const result = await controller.findAll(
        '2024-01-01T00:00:00Z',
        '2024-12-31T23:59:59Z',
      );

      expect(result).toEqual(events);
      expect(service.findAll).toHaveBeenCalledWith({
        from: '2024-01-01T00:00:00Z',
        to: '2024-12-31T23:59:59Z',
      });
    });

    it('FEATURE: debe lanzar BadRequestException cuando from > to', async () => {
      await expect(
        controller.findAll('2024-12-31T00:00:00Z', '2024-01-01T00:00:00Z'),
      ).rejects.toThrow(BadRequestException);
      expect(mockEventsService.findAll).not.toHaveBeenCalled();
    });

    it('FEATURE: debe lanzar BadRequestException cuando from es fecha inválida', async () => {
      await expect(
        controller.findAll('fecha-invalida', '2024-12-31T00:00:00Z'),
      ).rejects.toThrow(BadRequestException);
    });

    it('CORRECTIVO: debe manejar error al obtener eventos', async () => {
      const error = new Error('Error de consulta');
      mockEventsService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('findBySource', () => {
    it('CORRECTO: debe obtener eventos por source válido', async () => {
      const source = 'crud-planetas';
      const events = [{ id: 1, source, entity: 'planet' }];
      mockEventsService.findBySource.mockResolvedValue(events);

      const result = await controller.findBySource(source);
      expect(result).toEqual(events);
      expect(service.findBySource).toHaveBeenCalledWith(source);
    });

    it('PREVENTIVO: debe rechazar source vacío', async () => {
      await expect(controller.findBySource('')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByEntity', () => {
    it('CORRECTO: debe obtener eventos por entity válida', async () => {
      const entity = 'planet';
      const events = [{ id: 1, source: 'crud-planetas', entity }];
      mockEventsService.findByEntity.mockResolvedValue(events);

      const result = await controller.findByEntity(entity);
      expect(result).toEqual(events);
      expect(service.findByEntity).toHaveBeenCalledWith(entity);
    });

    it('PREVENTIVO: debe rechazar entity vacía', async () => {
      await expect(controller.findByEntity('')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
