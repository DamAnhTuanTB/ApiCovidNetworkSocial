export enum StatusPost {
  SUCCESS = 'success',
  PENDING = 'pending',
  CANCEL = 'cancel',
}
import { Post, Post as PostEntity } from '../../typeorm/post.entity';
import { User, User as UserEntity } from '../../typeorm/user.entity';
import {
  CommentPost,
  CommentPost as CommentPostEntity,
} from '../../typeorm/comment_posts.entity';
import {
  LikePost,
  LikePost as LikePostEntity,
} from '../../typeorm/like_posts.entity';
import {
  LikeComment,
  LikeComment as LikeCommentEntity,
} from '../../typeorm/like_comments.entity';
import {
  SavePost,
  SavePost as SavePostEntity,
} from '../../typeorm/save_posts.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import {
  SuccessCreateCommentPost,
  SuccessCreatePost,
  SuccessDeletePost,
  SuccessGetListPaging,
  SuccessGetPostDetails,
  SuccessLikeOrUnlikePost,
  SuccessUpdatePassword,
  SuccessUpdatePost,
} from 'src/commons/constants/success-messages';
import {
  FailDeleteComment,
  FailDeletePatient,
  FailDeletePost,
  FailGetComment,
  FailGetPostDetails,
  FailGetPostDetailsBecauseOfNotSuccess,
  FailUpdatePost,
} from 'src/commons/constants/error-messages';
import { UpdatePasswordDto } from './dto/UpdatePassword.dto';
import { comparePassword, encodePassword } from 'src/commons/helpers/bcrypt';
import { OLD_PASSWORD_INCORRECT } from 'src/commons/constants/http-messages';
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CommentPostEntity)
    private readonly commentPostRepository: Repository<CommentPostEntity>,
    @InjectRepository(LikePostEntity)
    private readonly likePostRepository: Repository<LikePostEntity>,
    @InjectRepository(SavePostEntity)
    private readonly savePostRepository: Repository<SavePostEntity>,
    @InjectRepository(LikeCommentEntity)
    private readonly likeCommentRepository: Repository<LikeCommentEntity>,
  ) {}

  async updatePassword(id: number, updatePassword: UpdatePasswordDto) {
    const user = await this.userRepository.findOne({
      id,
    });
    if (comparePassword(updatePassword.old_password, user.password)) {
      await this.userRepository.update(
        {
          id,
        },
        { password: encodePassword(updatePassword.new_password) },
      );
      return {
        statusCode: HttpStatus.CREATED,
        message: SuccessUpdatePassword,
      };
    } else {
      throw new HttpException(OLD_PASSWORD_INCORRECT, HttpStatus.BAD_REQUEST);
    }
  }
}
