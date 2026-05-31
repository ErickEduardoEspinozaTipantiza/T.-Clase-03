import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { CreateEventEntity } from '../../database/entities/create-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CreateEventEntity])],
  controllers: [HealthController],
})
export class HealthModule {}
