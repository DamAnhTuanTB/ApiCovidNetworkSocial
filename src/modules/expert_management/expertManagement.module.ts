import { UserModule } from '../user/user.module';
import { UserService } from 'src/modules/user/user.service';
import { Post } from '../../typeorm/post.entity';
import { User } from '../../typeorm/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpertManagementController } from './expertManagement.controller';
import { Module } from '@nestjs/common';
import { ExpertManagementService } from './expertManagement.service';
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
  controllers: [ExpertManagementController],
  providers: [
    {
      provide: 'ExpertManagement_SERVICE',
      useClass: ExpertManagementService,
    },
  ],
})
export class ExpertManagementModule {}
