import { AppModule } from './modules/app/app.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('covid-network-social');
  await app.listen(8080);
}
bootstrap();
