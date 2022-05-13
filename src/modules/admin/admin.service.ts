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
import { CreatePostDto } from './dto/CreatePost.dto';
import { UpdatePostDto } from './dto/UpdatePost.dto';
import {
  FailDeletePost,
  FailGetComment,
  FailGetPostDetails,
  FailGetPostDetailsBecauseOfNotSuccess,
  FailUpdatePost,
} from 'src/commons/constants/error-messages';
import { CreateLikeOrUnlikeCommentDto } from './dto/CreateLikeOrUnlikeComment.dto';
import { CreateSaveOrUnsavePostDto } from './dto/CreateSaveOrUnsavePost.dto';
import { CreateLikeOrUnlikePostDto } from './dto/CreateLikeOrUnlikePost.dto';
import { CreateCommentPostDto } from './dto/CreateCommentPost.dto';
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

  async getAllPostsByFilterWithoutAdminPosts(
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
        "`users`.`nick_name` like '%" +
          nickName +
          "%' and posts.title like '%" +
          title +
          "%' and posts.status = '" +
          typePost +
          "' and DATE(posts.create_at) = '" +
          createAt +
          "' and posts.userId != " +
          idLogin,
      )
      .leftJoin(LikePost, 'like_posts', 'posts.id = like_posts.postId')
      .leftJoin(CommentPost, 'comment_posts', 'posts.id = comment_posts.postId')
      .leftJoin(SavePost, 'save_posts', 'posts.id = save_posts.postId')
      .leftJoin(User, 'users', 'posts.userId = users.id')
      .groupBy('posts.id')
      .orderBy('create_at', typeSort == 'ASC' ? 'ASC' : 'DESC')
      .getRawMany();
  }

  async getAllPostsByFilterAdminPosts(
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
        "`users`.`nick_name` like '%" +
          nickName +
          "%' and posts.title like '%" +
          title +
          "' and DATE(posts.create_at) = '" +
          createAt +
          "' and posts.userId = " +
          idLogin,
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
    if (typePost == 'success_admin') {
      const listPost = await this.getAllPostsByFilterAdminPosts(
        idLogin,
        createAt,
        title,
        nickName,
        typePost,
        typeSort,
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
    } else {
      const listPost = await this.getAllPostsByFilterWithoutAdminPosts(
        idLogin,
        createAt,
        title,
        nickName,
        typePost,
        typeSort,
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
