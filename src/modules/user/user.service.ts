import { UpdateUserDto } from './dto/UpdateUser.dto';
import {
  SuccessGetListPaging,
  SuccessRegister,
  SuccessUpdateActiveUser,
  SuccessUpdatePassword,
  SuccessUpdatePost,
  SuccessUpdateProfile,
} from './../../commons/constants/success-messages';
import { HttpStatus } from '@nestjs/common';
import {
  EMAIL_EXISTS,
  OLD_PASSWORD_INCORRECT,
} from './../../commons/constants/http-messages';
import { CreateUserDto } from './dto/CreateUser.dto';
import { User as UserEntity } from '../../typeorm/user.entity';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { comparePassword, encodePassword } from 'src/commons/helpers/bcrypt';
import { UpdatePasswordDto } from './dto/UpdatePassword.dto';
import { FailUpdateActiveStatusUser } from 'src/commons/constants/error-messages';
import { CommentPost, Post } from 'src/typeorm';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getProfileOther(id: number) {
    const userDb = await this.userRepository.findOne({ id });
    delete userDb.password;
    return userDb;
  }

  async findUserByEmail(email: string) {
    return await this.userRepository.findOne({ email });
  }

  async findUserByEmailOrTelephone(emailOrTelephone) {
    const findUserByEmail = await this.userRepository.findOne({
      email: emailOrTelephone,
    });
    if (!findUserByEmail) {
      return await this.userRepository.findOne({
        telephone: emailOrTelephone,
      });
    }
    return findUserByEmail;
  }

  async createUser(createUserDto: CreateUserDto) {
    const user = await this.findUserByEmail(createUserDto.email);
    if (user) {
      throw new HttpException(EMAIL_EXISTS, HttpStatus.BAD_REQUEST);
    }
    const password = encodePassword(createUserDto.password);
    await this.userRepository.save({ ...createUserDto, password });
    return {
      statusCode: HttpStatus.CREATED,
      message: SuccessRegister,
    };
  }

  async updateProfile(id: number, updateUser: UpdateUserDto) {
    await this.userRepository.update({ id }, updateUser);
    return {
      statusCode: HttpStatus.OK,
      message: SuccessUpdateProfile,
    };
  }

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

  async updateActive(idLogin: number, isActive) {
    const userUpdate = await this.userRepository.findOne({ id: idLogin });
    if (!userUpdate) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: FailUpdateActiveStatusUser,
      };
    }
    await this.userRepository.update({ id: idLogin }, { is_active: isActive });
    return {
      statusCode: HttpStatus.OK,
      message: SuccessUpdateActiveUser,
    };
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
}
