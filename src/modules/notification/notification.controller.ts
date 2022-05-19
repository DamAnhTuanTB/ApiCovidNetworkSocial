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
import { NotificationService, StatusPost } from './notification.service';

@ApiTags('Notification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('notification')
export class NotificationController {
  constructor(
    @Inject('Notification_SERVICE')
    private readonly notificationService: NotificationService,
  ) {}

  //Get danh sách thông báo
  @Get('/get-all-notifications')
  getNotifications(
    @User('id') idLogin: number,
    @Query('limit') limit?: number,
    @Query('page') page = 1,
  ) {
    return this.notificationService.getNotifications(limit, page, idLogin);
  }
}
