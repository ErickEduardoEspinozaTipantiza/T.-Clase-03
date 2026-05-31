import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggerService } from './common/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Obtener el LoggerService
  const logger = app.get(LoggerService);
  
  // CORRECTIVO: Aplicar filtro global para manejo de excepciones
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  
  // PREVENTIVO: Agrega validación global para DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`🚀 Aplicación escuchando en puerto ${port}`, 'Bootstrap');
}
void bootstrap();
