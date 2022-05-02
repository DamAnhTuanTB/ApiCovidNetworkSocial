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
  FailUpdatePost,
} from 'src/commons/constants/error-messages';
import { CommentPost, LikePost, SavePost, User } from 'src/typeorm';

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

  async getListPostsOfUserLogin(userId: number): Promise<Post[]> {
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
      .where('posts.userId = :userId', {
        userId: userId,
      })
      .leftJoin(LikePost, 'like_posts', 'posts.id = like_posts.postId')
      .leftJoin(CommentPost, 'comment_posts', 'posts.id = comment_posts.postId')
      .leftJoin(SavePost, 'save_posts', 'posts.id = save_posts.postId')
      .leftJoin(User, 'users', 'posts.userId = users.id')
      .groupBy('posts.id')
      .getRawMany();
  }

  async getListPostOfUser(userId: number) {
    const listPost = await this.getListPostsOfUserLogin(userId);
    return {
      statusCode: HttpStatus.OK,
      message: SuccessGetListPostUser,
      data: listPost,
    };
  }
}
