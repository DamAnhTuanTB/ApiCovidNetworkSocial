import { UserModule } from '../user/user.module';
import { UserService } from 'src/modules/user/user.service';
import { Post } from '../../typeorm/post.entity';
import { User } from '../../typeorm/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './notification.controller';
import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  CommentPost,
  LikeComment,
  LikePost,
  SavePost,
  Notification,
} from 'src/typeorm';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      User,
      CommentPost,
      LikePost,
      SavePost,
      LikeComment,
      Notification,
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    {
      provide: 'Notification_SERVICE',
      useClass: NotificationService,
    },
  ],
})
export class NotificationModule {}
