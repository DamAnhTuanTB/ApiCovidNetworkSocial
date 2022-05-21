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
  Param,
  Query,
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

  @Get('profile/:id')
  getProfileOther(@Param('id') id: number) {
    return this.userService.getProfileOther(id);
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

  @Put('update-active')
  async updateActive(
    @User('id') id: number,
    @Query('isActive') isActive: number,
  ) {
    return this.userService.updateActive(id, isActive);
  }

  //Get list ảnh của mình
  @Get('get-all-image-of-patient')
  getImages(@User('id') id: number) {
    return this.userService.getImageByPatientId(id);
  }

  //Get list ảnh của từng bệnh nhân khác
  @Get('get-all-image-of-patient/:idUser')
  getImageByPatientId(@Param('idUser') idUser: number) {
    return this.userService.getImageByPatientId(idUser);
  }
}
