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
import { LikeComment as LikeCommentEntity } from '../../typeorm/like_comments.entity';
import {
  SavePost,
  SavePost as SavePostEntity,
} from '../../typeorm/save_posts.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import {
  SuccessCreatePost,
  SuccessDeletePost,
  SuccessGetListPaging,
  SuccessUpdatePost,
} from 'src/commons/constants/success-messages';
import { CreatePostDto } from './dto/CreatePost.dto';
import { UpdatePostDto } from './dto/UpdatePost.dto';
import {
  FailDeletePost,
  FailUpdatePost,
} from 'src/commons/constants/error-messages';
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

  async getAllPostsByFilter(
    idLogin: number,
    createAt: string,
    title: string,
    nickName: string,
    typePost: string,
    typeSort: string,
  ): Promise<Post[]> {
    return await this.postRepository
      .createQueryBuilder('posts')
      .select(
        'posts.id, `users`.`id` as author_id, `users`.`nick_name`as author_nick_name, `users`.`avatar`as author_avatar, posts.create_at, posts.update_at, posts.content_texts, posts.content_images, posts.status, posts.title',
      )
      .addSelect('IFNULL(COUNT(distinct like_posts.id), 0)', 'totalLike')
      .addSelect('IFNULL(COUNT(distinct comment_posts.id), 0)', 'totalComment')
      .addSelect('IFNULL(COUNT(distinct save_posts.id), 0)', 'totalSave')
      .addSelect(
        'IF(SUM(IF(like_posts.userId = ' +
          idLogin +
          ', 1, 0)) >= 1, true, false) as isLike',
      )
      .addSelect(
        'IF(SUM(IF(save_posts.userId = ' +
          idLogin +
          ', 1, 0)) >= 1, true, false) as isSave',
      )
      .where(
        "(`users`.`nick_name` like '%" +
          nickName +
          "%' and posts.title like '%" +
          title +
          "%') and posts.status = '" +
          typePost +
          "' and DATE(posts.create_at) = '" +
          createAt +
          "'",
      )
      .leftJoin(LikePost, 'like_posts', 'posts.id = like_posts.postId')
      .leftJoin(CommentPost, 'comment_posts', 'posts.id = comment_posts.postId')
      .leftJoin(SavePost, 'save_posts', 'posts.id = save_posts.postId')
      .leftJoin(User, 'users', 'posts.userId = users.id')
      .groupBy('posts.id')
      .orderBy('create_at', typeSort == 'ASC' ? 'ASC' : 'DESC')
      .getRawMany();
  }

  async getAllPosts(
    idLogin: number,
    createAt: string,
    title: string,
    nickName: string,
    typePost: string,
    typeSort: string,
    limit: number,
    page: number,
  ) {
    const listPost = await this.getAllPostsByFilter(
      idLogin,
      createAt,
      title,
      nickName,
      typePost,
      typeSort,
    );
    return this.returnListPostByPagingResponse(listPost, limit, page);
  }

  async getAllPostsByFilterAndUserId(
    idLogin: number,
    idUser: number,
    createAt: string,
    title: string,
    typePost: string,
    typeSort: string,
  ): Promise<Post[]> {
    return await this.postRepository
      .createQueryBuilder('posts')
      .select(
        'posts.id, `users`.`id` as author_id, `users`.`nick_name`as author_nick_name, `users`.`avatar`as author_avatar, posts.create_at, posts.update_at, posts.content_texts, posts.content_images, posts.status, posts.title',
      )
      .addSelect('IFNULL(COUNT(distinct like_posts.id), 0)', 'totalLike')
      .addSelect('IFNULL(COUNT(distinct comment_posts.id), 0)', 'totalComment')
      .addSelect('IFNULL(COUNT(distinct save_posts.id), 0)', 'totalSave')
      .addSelect(
        'IF(SUM(IF(like_posts.userId = ' +
          idLogin +
          ', 1, 0)) >= 1, true, false) as isLike',
      )
      .addSelect(
        'IF(SUM(IF(save_posts.userId = ' +
          idLogin +
          ', 1, 0)) >= 1, true, false) as isSave',
      )
      .where(
        'posts.userId =' +
          idUser +
          " and posts.title like '%" +
          title +
          "%' and posts.status = '" +
          typePost +
          "' and DATE(posts.create_at) = '" +
          createAt +
          "'",
      )
      .leftJoin(LikePost, 'like_posts', 'posts.id = like_posts.postId')
      .leftJoin(CommentPost, 'comment_posts', 'posts.id = comment_posts.postId')
      .leftJoin(SavePost, 'save_posts', 'posts.id = save_posts.postId')
      .leftJoin(User, 'users', 'posts.userId = users.id')
      .groupBy('posts.id')
      .orderBy('create_at', typeSort == 'ASC' ? 'ASC' : 'DESC')
      .getRawMany();
  }

  async getAllPostsByUserId(
    idLogin: number,
    idUser: number,
    createAt: string,
    title: string,
    typePost: string,
    typeSort: string,
    limit: number,
    page: number,
  ) {
    const listPost = await this.getAllPostsByFilterAndUserId(
      idLogin,
      idUser,
      createAt,
      title,
      typePost,
      typeSort,
    );
    return this.returnListPostByPagingResponse(listPost, limit, page);
  }

  async createPost(id: number, createPost: CreatePostDto) {
    const user = await this.userRepository.findOne({ id });
    createPost.status = StatusPost.SUCCESS;
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

  async updatePost(userId: number, id: number, updatePost: UpdatePostDto) {
    const postUpdate = await this.findByIdAndUserId(id, userId);
    if (!postUpdate) {
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

  async updateStatusPost(idPost: number, status: StatusPost) {
    const postUpdate = await this.postRepository.findOne({ id: idPost });
    if (!postUpdate) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: FailUpdatePost,
      };
    }
    await this.postRepository.update({ id: idPost }, { status: status });

    return {
      statusCode: HttpStatus.OK,
      message: SuccessUpdatePost,
    };
  }
}
