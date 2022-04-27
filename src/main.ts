import { AppModule } from './modules/app/app.module';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('covid-network-social');
  const options = new DocumentBuilder()
    .setTitle('Api Covid Network Social Specification')
    .setDescription('Team: Đàm Anh Tuấn, Lê Minh Tuấn, Phạm Văn Ngọc')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/covid-network-social', app, document);
  await app.listen(8888);
}
bootstrap();
