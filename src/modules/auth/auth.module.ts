import { PostService } from './../post/post.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { UserModule } from './../user/user.module';
import { UserService } from './../user/user.service';
import { AuthController } from './auth.controller';
import { PostModule } from './../post/post.module';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/local.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  User,
  Post,
  CommentPost,
  LikePost,
  SavePost,
  LikeComment,
} from 'src/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Post,
      CommentPost,
      LikePost,
      SavePost,
      LikeComment,
    ]),
    UserModule,
    PassportModule,
    PostModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    PostService,
    LocalStrategy,
    JwtStrategy,
  ],
})
export class AuthModule {}
