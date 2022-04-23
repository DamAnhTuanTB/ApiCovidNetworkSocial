import { CreateUserDto } from './dto/CreateUser';
import { User as UserEntity } from './../../typeorm/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocketGateway } from '../app/app.websocket';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly socketGateway: SocketGateway,
  ) {}

  createUser(createUserDto: CreateUserDto) {
    const newUser = this.userRepository.create(createUserDto);
    const dataMessage = {
      id: 999999,
      content: 'm vua tao user: ' + newUser.username,
      createdAt: 'Tue Apr 19 2022 17:14:21 GMT+0700 (Giờ Đông Dương)',
      sender: {
        id: 1,
        name: 'Tuan',
        avatar: '/post/avatar_my1.jpg',
      },
      isSend: false,
    };
    this.socketGateway.handleMessage(dataMessage);
    return this.userRepository.save(newUser);
  }
}
