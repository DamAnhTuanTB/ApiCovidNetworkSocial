import { UserModule } from '../user/user.module';
import { UserService } from 'src/modules/user/user.service';
import { Post } from '../../typeorm/post.entity';
import { User } from '../../typeorm/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientManagementController } from './patientManagement.controller';
import { Module } from '@nestjs/common';
import { PatientManagementService } from './patientManagement.service';
import { CommentPost, LikeComment, LikePost, SavePost } from 'src/typeorm';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      User,
      CommentPost,
      LikePost,
      SavePost,
      LikeComment,
    ]),
  ],
  controllers: [PatientManagementController],
  providers: [
    {
      provide: 'PatientManagement_SERVICE',
      useClass: PatientManagementService,
    },
  ],
})
export class PatientManagementModule {}
