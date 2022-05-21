import {
  Body,
  Controller,
  Inject,
  Post,
  Put,
  UseGuards,
  Get,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from 'src/commons/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { AdminService } from './admin.service';
import { UpdatePasswordDto } from './dto/UpdatePassword.dto';

@ApiTags('Admin Management')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(
    @Inject('Admin_SERVICE')
    private readonly adminService: AdminService,
  ) {}

  @Put('update-password')
  async updatePassword(
    @User('id') id: number,
    @Body() updatePassword: UpdatePasswordDto,
  ) {
    return this.adminService.updatePassword(id, updatePassword);
  }
}
