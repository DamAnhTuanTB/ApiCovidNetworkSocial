import { UpdatePasswordDto } from './dto/UpdatePassword.dto';
import { CreateUserDto } from 'src/modules/user/dto/CreateUser.dto';
import {
  Body,
  Controller,
  Inject,
  Post,
  Put,
  UseGuards,
  Get,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from 'src/commons/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { UserService } from './user.service';

@ApiTags('Patient')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('patient')
export class UserController {
  constructor(
    @Inject('USER_SERVICE') private readonly userService: UserService,
  ) {}

  @Get('profile')
  getProfile(@User() user: CreateUserDto) {
    delete user.password;
    return user;
  }

  @Put('profile')
  async updateProfile(
    @User('id') id: number,
    @Body() updateProfile: UpdateUserDto,
  ) {
    return this.userService.updateProfile(id, updateProfile);
  }

  @Put('update-password')
  async updatePassword(
    @User('id') id: number,
    @Body() updatePassword: UpdatePasswordDto,
  ) {
    return this.userService.updatePassword(id, updatePassword);
  }
}
