import { LoginUserDto } from './dto/LoginUser.dto';
import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  ValidationPipe,
  UsePipes,
  Inject,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { CreateUserDto } from '../user/dto/CreateUser.dto';
import { UserService } from '../user/user.service';
import { User } from 'src/commons/decorators/user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@User() user: CreateUserDto, @Body() loginUser: LoginUserDto) {
    return this.authService.login(user);
  }

  @Post('create')
  @UsePipes(ValidationPipe)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }
}
