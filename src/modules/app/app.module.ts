import { AuthModule } from './../auth/auth.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from '../user/user.module';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from 'src/typeorm';

@Module({
  imports: [
    AuthModule,
    UserModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'covid_network_social_db',
      entities,
      synchronize: true,
      autoLoadEntities: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
