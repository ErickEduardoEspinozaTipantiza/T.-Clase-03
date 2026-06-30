import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventRegistrationService } from './services/event-registration.service';
import { EventQueryService } from './services/event-query.service';
import { EventStatsService } from './services/event-stats.service';
import { CreateEventEntity } from '../../database/entities/create-event.entity';
import { UpdateEventEntity } from '../../database/entities/update-event.entity';
import { DeleteEventEntity } from '../../database/entities/delete-event.entity';
import { QueryEventEntity } from '../../database/entities/query-event.entity';
import { LoggerModule } from '../../common/logger/logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CreateEventEntity,
      UpdateEventEntity,
      DeleteEventEntity,
      QueryEventEntity,
    ]),
    LoggerModule,
  ],
  controllers: [EventsController],
  providers: [
    EventsService,
    EventRegistrationService,
    EventQueryService,
    EventStatsService,
  ],
  exports: [EventsService],
})
export class EventsModule {}
