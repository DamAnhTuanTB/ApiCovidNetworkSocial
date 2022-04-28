import { UpdateUserDto } from './dto/UpdateUser.dto';
import {
  SuccessRegister,
  SuccessUpdatePassword,
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
}
