import { UserModule } from './../user/user.module';
import { UserService } from 'src/modules/user/user.service';
import { Post } from '../../typeorm/post.entity';
import { User } from '../../typeorm/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
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
  controllers: [AdminController],
  providers: [
    {
      provide: 'ADMIN_SERVICE',
      useClass: AdminService,
    },
  ],
})
export class AdminModule {}
