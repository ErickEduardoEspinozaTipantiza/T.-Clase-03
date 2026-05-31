import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventEntity } from '../../database/entities/create-event.entity';

@Controller('health')
export class HealthController {
  constructor(
    @InjectRepository(CreateEventEntity)
    private readonly createRepo: Repository<CreateEventEntity>,
  ) {}

  @Get()
  async check() {
    try {
      // PREVENTIVO: Valida conexión real a la base de datos
      await this.createRepo.query('SELECT 1');
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Database connection failed',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
