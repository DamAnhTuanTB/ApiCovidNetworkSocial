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
  Notification,
  Notification as NotificationEntity,
} from '../../typeorm/notification.entity';
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
import { CreateNotificationDto } from './dto/CreateNotificationDto.dto';
@Injectable()
export class NotificationService {
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

  async getNotifications(limit, page, idLogin: number) {
    const listPatients = await this.notificationRepository
      .createQueryBuilder('notifications')
      .select(
        'notifications.id, notifications.create_at, notifications.content_texts, notifications.userId, notifications.postId, notifications.senderId AS sender_id, users.avatar AS sender_avatar, users.nick_name AS sender_nick_name',
      )
      .leftJoin(User, 'users', 'notifications.senderId = users.id')
      .where(
        'notifications.senderId != ' +
          idLogin +
          ' and notifications.userId = ' +
          idLogin,
      )
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

  async createNotification(
    content_texts: string,
    userId: number,
    senderId: number,
    postId: number,
  ) {
    const createNotification = new CreateNotificationDto();
    createNotification.content_texts = content_texts;
    createNotification.userId = userId;
    createNotification.senderId = senderId;
    createNotification.postId = postId;
    await this.notificationRepository.save({ ...createNotification });
  }
}
