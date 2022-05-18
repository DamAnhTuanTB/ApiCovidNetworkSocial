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
@Injectable()
export class PatientManagementService {
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

  returnListPostByPagingResponse(
    listPost: Array<Post>,
    limit: number,
    page: number,
  ) {
    const total = listPost.length;
    const listPostPaging = listPost.slice(limit * page - limit, limit * page);
    return {
      statusCode: HttpStatus.OK,
      message: SuccessGetListPaging,
      total: total,
      data: listPostPaging,
    };
  }

  async getAllPatients(limit, page) {
    const listPatients = await this.userRepository
      .createQueryBuilder('users')
      .select(
        'id, nick_name, email, first_name, last_name, date_of_birth, avatar, telephone',
      )
      .where("role = 'patient'")
      .orderBy('create_at', 'DESC')
      .getRawMany();
    if (typeof limit == 'undefined') {
      return {
        statusCode: HttpStatus.OK,
        message: SuccessGetListPaging,
        total: listPatients.length,
        data: listPatients,
      };
    }
    return this.returnListPostByPagingResponse(listPatients, limit, page);
  }

  async getImageByPatientId(idUser) {
    const listPatients = await this.userRepository
      .createQueryBuilder('users')
      .select(
        "Group_CONCAT(distinct posts.content_images separator ';') AS posts_images,  Group_CONCAT(distinct comment_posts.content_images separator ';') AS comment_images",
      )
      .leftJoin(Post, 'posts', 'users.id = posts.userId')
      .leftJoin(CommentPost, 'comment_posts', 'users.id = comment_posts.userId')
      .where('users.id = ' + idUser)
      .getRawMany();

    return {
      statusCode: HttpStatus.OK,
      message: SuccessGetListPaging,
      data: listPatients,
    };
  }

  async deletePatient(idUser: number) {
    const patientDelete = await this.userRepository.findOne({ id: idUser });
    if (!patientDelete) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: FailDeletePatient,
      };
    }
    await this.userRepository.delete({
      id: idUser,
    });
    return {
      statusCode: HttpStatus.OK,
      message: SuccessDeletePost,
    };
  }

  async getPatientById(id: number) {
    const userDb = await this.userRepository.findOne({ id });
    delete userDb.password;
    return userDb;
  }
}
