import { PostModule } from './../post/post.module';
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
    PostModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '04112000',
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
