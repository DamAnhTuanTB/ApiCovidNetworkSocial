import { PostModule } from './../post/post.module';
import { AuthModule } from './../auth/auth.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from '../user/user.module';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from 'src/typeorm';
import { PostManagementModule } from '../post_management/postManagement.module';
import { PatientManagementModule } from '../patient_management/patientManagement.module';
import { ExpertManagementModule } from '../expert_management/expertManagement.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PostModule,
    PostManagementModule,
    PatientManagementModule,
    ExpertManagementModule,
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
