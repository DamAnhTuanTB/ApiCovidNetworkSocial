import { SuccessRegister } from './../../commons/constants/success-messages';
import { HttpStatus } from '@nestjs/common';
import { EMAIL_EXISTS } from './../../commons/constants/http-messages';
import { CreateUserDto } from './dto/CreateUser.dto';
import { User as UserEntity } from './../../typeorm/user.entity';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { encodePassword } from 'src/commons/helpers/bcrypt';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

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
}
