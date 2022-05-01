import { CreatePostDto } from './dto/CreatePost.dto';
import { HttpStatus } from '@nestjs/common';

import { Post, Post as PostEntity } from '../../typeorm/post.entity';
import { User as UserEntity } from '../../typeorm/user.entity';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FailDeletePost,
  FailUpdatePost,
  SuccessCreatePost,
  SuccessDeletePost,
  SuccessUpdatePost,
} from 'src/commons/constants/success-messages';
import { UpdatePostDto } from './dto/UpdatePost.dto';

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
    const postPost = await this.findByIdAndUserId(id, userId);
    if (!postPost) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: FailUpdatePost,
      };
    }
    await this.postRepository.update({ id }, updatePost);
    return {
      statusCode: HttpStatus.OK,
      message: SuccessUpdatePost,
    };
  }
}
