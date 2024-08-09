import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('v1', { exclude: ['health'] }); // exclude health path from prefix
  app.useGlobalPipes(new ValidationPipe());
  app.use(helmet());
  // app.enableCors();
  await app.listen(3000);
}
bootstrap();
