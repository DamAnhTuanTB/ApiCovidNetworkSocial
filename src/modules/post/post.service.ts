import { CreatePostDto } from './dto/CreatePost.dto';
import { HttpStatus, Inject } from '@nestjs/common';

import { Post, Post as PostEntity } from '../../typeorm/post.entity';
import { User as UserEntity } from '../../typeorm/user.entity';
import { CommentPost as CommentPostEntity } from '../../typeorm/comment_posts.entity';
import { LikePost as LikePostEntity } from '../../typeorm/like_posts.entity';
import { LikeComment as LikeCommentEntity } from '../../typeorm/like_comments.entity';
import { SavePost as SavePostEntity } from '../../typeorm/save_posts.entity';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import {
  SuccessCreatePost,
  SuccessDeletePost,
  SuccessGetListPaging,
  SuccessGetPostDetails,
  SuccessUpdatePost,
  SuccessCreateCommentPost,
  SuccessLikeOrUnlikePost,
} from 'src/commons/constants/success-messages';
import {
  Notification,
  Notification as NotificationEntity,
} from '../../typeorm/notification.entity';
import { UpdatePostDto } from './dto/UpdatePost.dto';
import { StatusPost, UpdateStatusPostDto } from './dto/UpdateStatusPost.dto';
import {
  FailDeletePost,
  FailGetComment,
  FailGetPostDetails,
  FailGetPostDetailsBecauseOfNotSuccess,
  FailTypeLimitOrPage,
  FailTypePost,
  FailUpdatePost,
} from 'src/commons/constants/error-messages';
import {
  CommentPost,
  LikeComment,
  LikePost,
  SavePost,
  User,
} from 'src/typeorm';
import { CreateCommentPostDto } from './dto/CreateCommentPost.dto';
import { CreateLikeOrUnlikePostDto } from './dto/CreateLikeOrUnlikePost.dto';
import { CreateLikeOrUnlikeCommentDto } from './dto/CreateLikeOrUnlikeComment.dto';
import { CreateSaveOrUnsavePostDto } from './dto/CreateSaveOrUnsavePost.dto';
import { NotificationService } from '../notification/notification.service';
import { CreateNotificationDto } from '../notification/dto/CreateNotificationDto.dto';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway(4444, {
  cors: {
    origin: '*',
  },
})
@Injectable()
export class PostService {
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
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
  ) {}

  @WebSocketServer()
  server: Server;

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

  async getListPostsSuccessOfUser(
    idGetListPost: number,
    idGetLikeSave: number,
    typeStatus: string,
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
          idGetLikeSave +
          ', 1, 0)) >= 1, true, false) as isLike',
      )
      .addSelect(
        'IF(SUM(IF(save_posts.userId = ' +
          idGetLikeSave +
          ', 1, 0)) >= 1, true, false) as isSave',
      )
      .addSelect("IF(users.role = 'admin', true, false) as isAdmin")
      .where('posts.userId = :userId and posts.status = :typeStatus', {
        userId: idGetListPost,
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
  ): Promise<Post[]> {
    return await this.postRepository
      .createQueryBuilder('posts')
      .select(
        'posts.id, `users`.`id` as author_id, `users`.`nick_name`as author_nick_name, `users`.`avatar`as author_avatar, posts.create_at, posts.update_at, posts.content_texts, posts.content_images, posts.status, posts.title',
      )
      .addSelect("IF(users.role = 'admin', true, false) as isAdmin")
      .where('posts.userId = :userId and posts.status = :typeStatus', {
        userId: userId,
        typeStatus: typeStatus,
      })
      .leftJoin(User, 'users', 'posts.userId = users.id')
      .groupBy('posts.id')
      .orderBy('posts.create_at', 'DESC')
      .getRawMany();
  }

  async getListPostsOfUserLoginSave(userId: number): Promise<Post[]> {
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
          userId +
          ', 1, 0)) >= 1, true, false) as isLike',
      )
      .addSelect(
        'IF(SUM(IF(save_posts.userId = ' +
          userId +
          ', 1, 0)) >= 1, true, false) as isSave',
      )
      .addSelect("IF(users.role = 'admin', true, false) as isAdmin")
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

  async getListPostOfUser(
    idGetListPost: number,
    idGetLikeSave: number,
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
        idGetListPost,
        type,
      );
      if (typeof limit == 'undefined') {
        return {
          statusCode: HttpStatus.OK,
          message: SuccessGetListPaging,
          total: listPost.length,
          data: listPost,
        };
      }
      return this.returnListPostByPagingResponse(listPost, limit, page);
    } else if (type == 'save') {
      const listPost = await this.getListPostsOfUserLoginSave(idGetListPost);
      if (typeof limit == 'undefined') {
        return {
          statusCode: HttpStatus.OK,
          message: SuccessGetListPaging,
          total: listPost.length,
          data: listPost,
        };
      }
      return this.returnListPostByPagingResponse(listPost, limit, page);
    } else {
      const listPost = await this.getListPostsSuccessOfUser(
        idGetListPost,
        idGetLikeSave,
        type,
      );
      if (typeof limit == 'undefined') {
        return {
          statusCode: HttpStatus.OK,
          message: SuccessGetListPaging,
          total: listPost.length,
          data: listPost,
        };
      }
      return this.returnListPostByPagingResponse(listPost, limit, page);
    }
  }

  async getALlPostsByFilter(
    userId: number,
    freeText: string,
    sortBy: string,
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
          userId +
          ', 1, 0)) >= 1, true, false) as isLike',
      )
      .addSelect(
        'IF(SUM(IF(save_posts.userId = ' +
          userId +
          ', 1, 0)) >= 1, true, false) as isSave',
      )
      .addSelect("IF(users.role = 'admin', true, false) as isAdmin")
      .where(
        "(`users`.`nick_name` like '%" +
          freeText +
          "%' or posts.title like '%" +
          freeText +
          "%') and posts.status = 'success'",
      )
      .leftJoin(LikePost, 'like_posts', 'posts.id = like_posts.postId')
      .leftJoin(CommentPost, 'comment_posts', 'posts.id = comment_posts.postId')
      .leftJoin(SavePost, 'save_posts', 'posts.id = save_posts.postId')
      .leftJoin(User, 'users', 'posts.userId = users.id')
      .groupBy('posts.id')
      .orderBy(sortBy, 'DESC')
      .getRawMany();
  }

  async getALlPosts(
    idLogin: number,
    freeText: string,
    sortBy: string,
    limit: number,
    page: number,
  ) {
    const listPost = await this.getALlPostsByFilter(idLogin, freeText, sortBy);
    if (typeof limit == 'undefined') {
      return {
        statusCode: HttpStatus.OK,
        message: SuccessGetListPaging,
        total: listPost.length,
        data: listPost,
      };
    }
    return this.returnListPostByPagingResponse(listPost, limit, page);
  }

  async getPostDetail(idLogin: number, idPost: number) {
    const postDetail = await this.postRepository
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
      .addSelect("IF(users.role = 'admin', true, false) as isAdmin")
      .where("posts.id = :idPost and posts.status = 'success'", {
        idPost: idPost,
      })
      .leftJoin(LikePost, 'like_posts', 'posts.id = like_posts.postId')
      .leftJoin(CommentPost, 'comment_posts', 'posts.id = comment_posts.postId')
      .leftJoin(SavePost, 'save_posts', 'posts.id = save_posts.postId')
      .leftJoin(User, 'users', 'posts.userId = users.id')
      .groupBy('posts.id')
      .orderBy('posts.create_at', 'DESC')
      .limit(1)
      .getRawMany();

    const checkPostDetail = await this.postRepository.findOne({ id: idPost });

    if (checkPostDetail) {
      if (postDetail.length == 0) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: FailGetPostDetailsBecauseOfNotSuccess,
          errorCode: 444,
        };
      }
      return {
        statusCode: HttpStatus.OK,
        message: SuccessGetPostDetails,
        data: postDetail,
      };
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: FailGetPostDetails,
      };
    }
  }

  async getAllCommentOfPost(
    idLogin: number,
    idPost: number,
    limit: number,
    page: number,
  ) {
    const listCommentPost = await this.commentPostRepository
      .createQueryBuilder('comment_posts')
      .select(
        'comment_posts.id, u.id as commentator_id, u.nick_name as commentator_nick_name, u.avatar as commentator_avatar, comment_posts.content_texts, comment_posts.content_images, comment_posts.create_at',
      )
      .addSelect('IFNULL(COUNT(distinct like_comments.id), 0)', 'totalLike')
      .addSelect(
        'IF(SUM(IF(like_comments.userId = ' +
          idLogin +
          ', 1, 0)) >= 1, true, false) as isLike',
      )
      .addSelect("IF(u.role = 'admin', true, false) as isAdmin")
      .where('comment_posts.postId = :idPost', {
        idPost: idPost,
      })
      .leftJoin(User, 'u', 'comment_posts.userId = u.id')
      .leftJoin(
        LikeComment,
        'like_comments',
        'comment_posts.id = like_comments.commentId',
      )
      .groupBy('comment_posts.id')
      .orderBy('comment_posts.create_at', 'DESC')
      .getRawMany();
    if (typeof limit == 'undefined') {
      return {
        statusCode: HttpStatus.OK,
        message: SuccessGetListPaging,
        total: listCommentPost.length,
        data: listCommentPost,
      };
    }
    return this.returnListPostByPagingResponse(
      await listCommentPost,
      limit,
      page,
    );
  }

  async createNotification(content_texts: string, sender: User, post: Post) {
    const createNotification = new CreateNotificationDto();
    createNotification.content_texts = content_texts;
    const user = await this.userRepository
      .createQueryBuilder('users')
      .select('users.id as id')
      .innerJoin(Post, 'posts', 'posts.userId = users.id')
      .where('posts.id = ' + post.id)
      .getRawOne();
    await this.notificationRepository.save({
      ...createNotification,
      user,
      sender,
      post,
    });
  }

  async createCommentPost(
    idLogin: number,
    createCommentPost: CreateCommentPostDto,
  ) {
    const user = await this.userRepository.findOne({ id: idLogin });
    const post = await this.postRepository.findOne({
      id: createCommentPost.postId,
    });
    const commentPost = await this.commentPostRepository.save({
      ...createCommentPost,
      user,
      post,
    });
    //Tạo thông báo
    this.createNotification('đã bình luận', user, post);

    this.server.emit('event_patient_comment_post', {
      userIdFrom: idLogin,
      userIdTo: createCommentPost.authorId,
      postId: createCommentPost.postId,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: SuccessCreateCommentPost,
    };
  }

  async likeOrUnlikePost(
    idLogin: number,
    createLikeOrUnlikePostDto: CreateLikeOrUnlikePostDto,
  ) {
    const user = await this.userRepository.findOne({ id: idLogin });
    const post = await this.postRepository.findOne({
      id: createLikeOrUnlikePostDto.postId,
    });
    const rawLikePost = await this.likePostRepository.findOne({
      user: user,
      post: post,
    });

    if (!rawLikePost && createLikeOrUnlikePostDto.isLike) {
      await this.likePostRepository.save({
        user,
        post,
      });
      //Tạo thông báo
      this.createNotification('đã thích', user, post);
      this.server.emit('event_patient_like_post', {
        userIdFrom: idLogin,
        userIdTo: createLikeOrUnlikePostDto.authorId,
        postId: createLikeOrUnlikePostDto.postId,
      });
    } else if (rawLikePost && createLikeOrUnlikePostDto.isLike == false) {
      await this.likePostRepository.delete({ id: (await rawLikePost).id });
    }

    return {
      statusCode: HttpStatus.OK,
      message: SuccessLikeOrUnlikePost,
    };
  }

  async saveOrUnsavePost(
    idLogin: number,
    createSaveOrUnsavePostDto: CreateSaveOrUnsavePostDto,
  ) {
    const user = await this.userRepository.findOne({ id: idLogin });
    const post = await this.postRepository.findOne({
      id: createSaveOrUnsavePostDto.postId,
    });
    const rawLikePost = await this.savePostRepository.findOne({
      user: user,
      post: post,
    });

    if (!rawLikePost && createSaveOrUnsavePostDto.isSave) {
      await this.savePostRepository.save({
        user,
        post,
      });
      //Tạo thông báo
      this.createNotification('đã lưu', user, post);
      this.server.emit('event_patient_save_post', {
        userIdFrom: idLogin,
        userIdTo: createSaveOrUnsavePostDto.authorId,
        postId: createSaveOrUnsavePostDto.postId,
      });
    } else if (rawLikePost && createSaveOrUnsavePostDto.isSave == false) {
      await this.savePostRepository.delete({ id: (await rawLikePost).id });
    }

    return {
      statusCode: HttpStatus.OK,
      message: SuccessLikeOrUnlikePost,
    };
  }

  async likeOrUnlikeComment(
    idLogin: number,
    createLikeOrUnlikeCommentDto: CreateLikeOrUnlikeCommentDto,
  ) {
    const user = await this.userRepository.findOne({ id: idLogin });
    const comment = await this.commentPostRepository.findOne({
      id: createLikeOrUnlikeCommentDto.commentId,
    });
    if (!comment) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: FailGetComment,
      };
    }

    const rawLikeComment = await this.likeCommentRepository.findOne({
      user: user,
      comment: comment,
    });

    if (!rawLikeComment && createLikeOrUnlikeCommentDto.isLike) {
      await this.likeCommentRepository.save({
        user,
        comment,
      });
    } else if (rawLikeComment && createLikeOrUnlikeCommentDto.isLike == false) {
      await this.likeCommentRepository.delete({
        id: (await rawLikeComment).id,
      });
    }

    return {
      statusCode: HttpStatus.OK,
      message: SuccessLikeOrUnlikePost,
    };
  }
}
