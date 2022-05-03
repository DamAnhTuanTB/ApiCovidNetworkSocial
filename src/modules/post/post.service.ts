import { CreatePostDto } from './dto/CreatePost.dto';
import { HttpStatus } from '@nestjs/common';

import { Post, Post as PostEntity } from '../../typeorm/post.entity';
import { User as UserEntity } from '../../typeorm/user.entity';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SuccessCreatePost,
  SuccessDeletePost,
  SuccessGetListPostUser,
  SuccessUpdatePost,
} from 'src/commons/constants/success-messages';
import { UpdatePostDto } from './dto/UpdatePost.dto';
import { StatusPost, UpdateStatusPostDto } from './dto/UpdateStatusPost.dto';
import {
  FailDeletePost,
  FailTypeLimitOrPage,
  FailTypePost,
  FailUpdatePost,
} from 'src/commons/constants/error-messages';
import { CommentPost, LikePost, SavePost, User } from 'src/typeorm';
import { type } from 'os';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createPost(id: number, createPost: CreatePostDto) {
    const user = await this.userRepository.findOne({ id });
    const postDb = await this.postRepository.save({
      ...createPost,
      user,
    });
    return {
      statusCode: HttpStatus.CREATED,
      message: SuccessCreatePost,
    };
  }

  async findByIdAndUserId(
    idPost: number,
    userId: number,
  ): Promise<Post | undefined> {
    return await this.postRepository
      .createQueryBuilder('posts')
      .where('posts.id = :idPost and posts.userId = :userId', {
        idPost: idPost,
        userId: userId,
      })
      .getOne();
  }

  async deletePost(id: number, userId: number) {
    const postDelete = await this.findByIdAndUserId(id, userId);
    if (!postDelete) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: FailDeletePost,
      };
    }
    await this.postRepository.delete({
      id,
    });
    return {
      statusCode: HttpStatus.OK,
      message: SuccessDeletePost,
    };
  }

  async updatePost(userId: number, id: number, updatePost: UpdatePostDto) {
    const postUpdate = await this.findByIdAndUserId(id, userId);
    if (!postUpdate) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: FailUpdatePost,
      };
    }
    await this.postRepository.update({ id }, updatePost);
    //Change status of post
    const updateStatusPost = new UpdateStatusPostDto();
    updateStatusPost.status = StatusPost.PENDING;
    await this.postRepository.update({ id }, updateStatusPost);

    return {
      statusCode: HttpStatus.OK,
      message: SuccessUpdatePost,
    };
  }

  async getListPostsOfUserLogin(
    userId: number,
    typeStatus: string,
    limit: number,
    page: number,
  ): Promise<Post[]> {
    return await this.postRepository
      .createQueryBuilder('posts')
      .select(
        'posts.id, `users`.`id` as author_id, `users`.`nick_name`as author_nick_name, `users`.`avatar`as author_avatar, posts.create_at, posts.update_at, posts.content_texts, posts.content_images, posts.status, posts.title',
      )
      .addSelect('IFNULL(COUNT(like_posts.id), 0)', 'totalLike')
      .addSelect('IFNULL(COUNT(comment_posts.id), 0)', 'totalComment')
      .addSelect('IFNULL(COUNT(save_posts.id), 0)', 'totalSave')
      .addSelect(
        'IF(SUM(IF(like_posts.userId = ' +
          userId +
          ', 1, 0)) >= 1, true, false) as isLike',
      )
      .addSelect(
        'IF(SUM(IF(save_posts.userId = ' +
          userId +
          ', 1, 0)) >= 1, true, false) as isSave',
      )
      .where('posts.userId = :userId and posts.status = :typeStatus', {
        userId: userId,
        typeStatus: typeStatus,
      })
      .leftJoin(LikePost, 'like_posts', 'posts.id = like_posts.postId')
      .leftJoin(CommentPost, 'comment_posts', 'posts.id = comment_posts.postId')
      .leftJoin(SavePost, 'save_posts', 'posts.id = save_posts.postId')
      .leftJoin(User, 'users', 'posts.userId = users.id')
      .groupBy('posts.id')
      .orderBy('posts.create_at', 'DESC')
      .getRawMany();
  }

  async getListPostsOfUserLoginPendingOrCancel(
    userId: number,
    typeStatus: string,
    limit: number,
    page: number,
  ): Promise<Post[]> {
    return await this.postRepository
      .createQueryBuilder('posts')
      .select(
        'posts.id, `users`.`id` as author_id, `users`.`nick_name`as author_nick_name, `users`.`avatar`as author_avatar, posts.create_at, posts.update_at, posts.content_texts, posts.content_images, posts.status, posts.title',
      )
      .where('posts.userId = :userId and posts.status = :typeStatus', {
        userId: userId,
        typeStatus: typeStatus,
      })
      .leftJoin(User, 'users', 'posts.userId = users.id')
      .groupBy('posts.id')
      .orderBy('posts.create_at', 'DESC')
      .getRawMany();
  }

  async getListPostsOfUserLoginSave(
    userId: number,
    typeStatus: string,
    limit: number,
    page: number,
  ): Promise<Post[]> {
    return await this.postRepository
      .createQueryBuilder('posts')
      .select(
        'posts.id, `users`.`id` as author_id, `users`.`nick_name`as author_nick_name, `users`.`avatar`as author_avatar, posts.create_at, posts.update_at, posts.content_texts, posts.content_images, posts.status, posts.title',
      )
      .addSelect('IFNULL(COUNT(like_posts.id), 0)', 'totalLike')
      .addSelect('IFNULL(COUNT(comment_posts.id), 0)', 'totalComment')
      .addSelect('IFNULL(COUNT(save_posts.id), 0)', 'totalSave')
      .addSelect(
        'IF(SUM(IF(like_posts.userId = ' +
          userId +
          ', 1, 0)) >= 1, true, false) as isLike',
      )
      .addSelect(
        'IF(SUM(IF(save_posts.userId = ' +
          userId +
          ', 1, 0)) >= 1, true, false) as isSave',
      )
      .where("posts.userId = :userId and posts.status = 'success'", {
        userId: userId,
      })
      .leftJoin(LikePost, 'like_posts', 'posts.id = like_posts.postId')
      .leftJoin(CommentPost, 'comment_posts', 'posts.id = comment_posts.postId')
      .leftJoin(SavePost, 'save_posts', 'posts.id = save_posts.postId')
      .leftJoin(User, 'users', 'posts.userId = users.id')
      .groupBy('posts.id')
      .having('isSave = 1')
      .orderBy('posts.create_at', 'DESC')
      .getRawMany();
  }

  returnListPostByUserLoginResponse(
    listPost: Array<Post>,
    limit: number,
    page: number,
  ) {
    const total = listPost.length;
    const listPostPaging = listPost.slice(limit * page - limit, limit * page);
    return {
      statusCode: HttpStatus.OK,
      message: SuccessGetListPostUser,
      total: total,
      data: listPostPaging,
    };
  }

  async getListPostOfUser(
    userId: number,
    type: string,
    limit: number,
    page: number,
  ) {
    const listTypeToGet = ['success', 'pending', 'cancel', 'save'];
    if (!listTypeToGet.includes(type)) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: FailTypePost,
      };
    }

    if (type == 'pending' || type == 'cancel') {
      const listPost = await this.getListPostsOfUserLoginPendingOrCancel(
        userId,
        type,
        limit,
        page,
      );
      return this.returnListPostByUserLoginResponse(listPost, limit, page);
    } else if (type == 'save') {
      const listPost = await this.getListPostsOfUserLoginSave(
        userId,
        type,
        limit,
        page,
      );
      return this.returnListPostByUserLoginResponse(listPost, limit, page);
    } else {
      const listPost = await this.getListPostsOfUserLogin(
        userId,
        type,
        limit,
        page,
      );
      return this.returnListPostByUserLoginResponse(listPost, limit, page);
    }
  }
}
