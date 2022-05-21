export enum StatusPost {
  SUCCESS = 'success',
  PENDING = 'pending',
  CANCEL = 'cancel',
}
import { Post, Post as PostEntity } from '../../typeorm/post.entity';
import { User, User as UserEntity, UserRole } from '../../typeorm/user.entity';
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
import { ChatSession as ChatSessionEntity } from '../../typeorm/chat_sessions.entity';
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
  SuccessRegister,
  SuccessUpdatePassword,
  SuccessUpdatePost,
  SuccessUpdateProfile,
} from 'src/commons/constants/success-messages';
import {
  FailDeleteComment,
  FailDeleteExpert,
  FailDeletePatient,
  FailDeletePost,
  FailGetComment,
  FailGetPostDetails,
  FailGetPostDetailsBecauseOfNotSuccess,
  FailUpdatePost,
} from 'src/commons/constants/error-messages';
import { ChatSession, Message } from 'src/typeorm';
import { CreateExpertDto } from './dto/CreateExpertDto.dto';
import { EMAIL_EXISTS } from 'src/commons/constants/http-messages';
import { encodePassword } from 'src/commons/helpers/bcrypt';
import { UpdateExpertDto } from './dto/UpdateExpert.dto';
import { UpdatePasswordDto } from './dto/UpdatePassword.dto';
@Injectable()
export class ExpertManagementService {
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
    @InjectRepository(ChatSessionEntity)
    private readonly chatSessionRepository: Repository<ChatSessionEntity>,
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

  async getAllExperts(limit, page) {
    const listPatients = await this.userRepository
      .createQueryBuilder('users')
      .select(
        'users.id as id, users.nick_name, users.email, users.first_name, users.last_name, users.date_of_birth, users.avatar, users.telephone',
      )
      .where("users.role = 'expert'")
      .groupBy('id')
      .orderBy('users.create_at', 'DESC')
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

  async findUserByEmail(email: string) {
    return await this.userRepository.findOne({ email });
  }

  async createExpert(createExpert: CreateExpertDto) {
    createExpert.role = UserRole.EXPERT;
    const user = await this.findUserByEmail(createExpert.email);
    if (user) {
      throw new HttpException(EMAIL_EXISTS, HttpStatus.BAD_REQUEST);
    }
    const password = encodePassword(createExpert.password);

    await this.userRepository.save({ ...createExpert, password });
    return {
      statusCode: HttpStatus.CREATED,
      message: SuccessRegister,
    };
  }

  async updateExpert(idExpert: number, updateExpert: UpdateExpertDto) {
    await this.userRepository.update({ id: idExpert }, updateExpert);
    return {
      statusCode: HttpStatus.OK,
      message: SuccessUpdateProfile,
    };
  }

  async deleteExpert(idUser: number) {
    const patientDelete = await this.userRepository.findOne({ id: idUser });
    if (!patientDelete) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: FailDeleteExpert,
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

  async updatePassword(idExpert: number, updatePassword: UpdatePasswordDto) {
    await this.userRepository.update(
      {
        id: idExpert,
      },
      { password: encodePassword(updatePassword.new_password) },
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: SuccessUpdatePassword,
    };
  }

  async getExpertById(id: number) {
    const userDb = await this.userRepository.findOne({ id });
    delete userDb.password;
    return userDb;
  }
}
