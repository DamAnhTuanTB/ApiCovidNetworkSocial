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
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import {
  ExpertManagementService,
  StatusPost,
} from './expertManagement.service';

@ApiTags('Expert Management')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('admin')
export class ExpertManagementController {
  constructor(
    @Inject('ExpertManagement_SERVICE')
    private readonly adminService: ExpertManagementService,
  ) {}

  //Quản lý chuyên gia
  //Get danh sách bệnh nhân
  @Get('expert/get-all-experts')
  getAllPatients(@Query('limit') limit?: number, @Query('page') page = 1) {
    return this.adminService.getAllExperts(limit, page);
  }
}
