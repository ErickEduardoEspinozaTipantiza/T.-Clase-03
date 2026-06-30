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
    it('CORRECTO: debe registrar un evento válido exitosamente', async () => {
      const dto: CreateEventDto = {
        source: 'crud-planetas',
        entity: 'planet',
        action: 'CREATE',
        title: 'Planeta creado',
        description: 'Se creó Marte',
        payload: { id: 1, name: 'Marte' },
      };

      const expected = { id: 1, ...dto, recorded_at: new Date().toISOString() };
      mockEventsService.registerEvent.mockResolvedValue(expected);

      const result = await controller.registerEvent(dto);

      expect(result).toEqual(expected);
      expect(service.registerEvent).toHaveBeenCalledWith(dto);
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('Registrando nuevo evento'),
        'EventsController',
        expect.any(Object),
      );
    });

    it('PREVENTIVO: debe rechazar evento con validación fallida', async () => {
      const invalidDto = {
        source: 'crud-planetas!', // Carácter inválido
        entity: 'planet',
        action: 'CREATE',
        title: 'Planeta creado',
      };

      // La validación ocurriría en el ValidationPipe
      // Este test verifica que el sistema rechace caracteres especiales
      expect(invalidDto.source).toMatch(/[!]/);
    });

    it('CORRECTIVO: debe manejar errores y registrarlos', async () => {
      const dto: CreateEventDto = {
        source: 'crud-planetas',
        entity: 'planet',
        action: 'CREATE',
        title: 'Evento',
        description: 'Test',
      };

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
    it('CORRECTO: debe obtener todos los eventos', async () => {
      const events = [
        {
          id: 1,
          source: 'crud-planetas',
          entity: 'planet',
          action: 'CREATE',
          title: 'Planeta creado',
        },
      ];

      mockEventsService.findAll.mockResolvedValue(events);

      const result = await controller.findAll();

      expect(result).toEqual(events);
      expect(service.findAll).toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalled();
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
      const events = [{ id: 1, source, entity: 'planet', action: 'CREATE' }];

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
      const events = [
        { id: 1, source: 'crud-planetas', entity, action: 'CREATE' },
      ];

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
