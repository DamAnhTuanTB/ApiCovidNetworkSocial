import { UserModule } from '../user/user.module';
import { UserService } from 'src/modules/user/user.service';
import { Post } from '../../typeorm/post.entity';
import { User } from '../../typeorm/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostManagementController } from './postManagement.controller';
import { Module } from '@nestjs/common';
import { PostManagementService } from './postManagement.service';
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
  controllers: [PostManagementController],
  providers: [
    {
      provide: 'PostManagement_SERVICE',
      useClass: PostManagementService,
    },
  ],
})
export class PostManagementModule {}
