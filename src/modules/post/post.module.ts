import { UserModule } from './../user/user.module';
import { UserService } from 'src/modules/user/user.service';
import { Post } from '../../typeorm/post.entity';
import { User } from '../../typeorm/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from './post.controller';
import { Module } from '@nestjs/common';
import { PostService } from './post.service';
@Module({
  imports: [TypeOrmModule.forFeature([Post, User])],
  controllers: [PostController],
  providers: [
    {
      provide: 'POST_SERVICE',
      useClass: PostService,
    },
  ],
})
export class PostModule {}
