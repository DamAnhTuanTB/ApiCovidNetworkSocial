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
import { CreateExpertDto } from './dto/CreateExpertDto.dto';
import {
  ExpertManagementService,
  StatusPost,
} from './expertManagement.service';
import { User } from 'src/commons/decorators/user.decorator';
import { UpdateExpertDto } from './dto/UpdateExpert.dto';
import { UpdatePasswordDto } from './dto/UpdatePassword.dto';

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

  //Admin tạo chuyên gia
  @Post('expert/create-expert')
  createExpert(@User('id') id: number, @Body() createExpert: CreateExpertDto) {
    return this.adminService.createExpert(createExpert);
  }

  @Put('expert/update-expert/:idExpert')
  async updateProfile(
    @Param('idExpert') idExpert: number,
    @Body() updateExpert: UpdateExpertDto,
  ) {
    return this.adminService.updateExpert(idExpert, updateExpert);
  }

  //Admin delete expert
  @Delete('expert/delete-expert/:idExpert')
  deleteExpert(@Param('idExpert') idExpert: number) {
    return this.adminService.deleteExpert(idExpert);
  }

  @Put('expert/update-password-expert/:idExpert')
  async updatePassword(
    @Param('idExpert') idExpert: number,
    @Body() updatePassword: UpdatePasswordDto,
  ) {
    return this.adminService.updatePassword(idExpert, updatePassword);
  }

  @Get('expert/expert-detail/:idExpert')
  getExpertById(@Param('idExpert') idExpert: number) {
    return this.adminService.getExpertById(idExpert);
  }
}
