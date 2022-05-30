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
  PatientManagementService,
  StatusPost,
} from './patientManagement.service';

@ApiTags('Patient Management')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('admin')
export class PatientManagementController {
  constructor(
    @Inject('PatientManagement_SERVICE')
    private readonly adminService: PatientManagementService,
  ) {}

  //Quản lý bệnh nhân
  //Get danh sách bệnh nhân
  @Get('patient/get-all-patients')
  getAllPatients(
    @Query('limit') limit?: number,
    @Query('page') page = 1,
    @Query('email') emailFilter = '',
  ) {
    return this.adminService.getAllPatients(limit, page, emailFilter);
  }

  //Get list ảnh của từng bệnh nhân
  @Get('patient/get-all-image-of-patient/:idUser')
  getImageByPatientId(@Param('idUser') idUser: number) {
    return this.adminService.getImageByPatientId(idUser);
  }

  //Admin delete patient
  @Delete('patient/delete-patient/:idUser')
  deletePatient(@Param('idUser') idUser: number) {
    return this.adminService.deletePatient(idUser);
  }

  @Get('patient/patient-detail/:idPatient')
  getPatientById(@Param('idPatient') idPatient: number) {
    return this.adminService.getPatientById(idPatient);
  }
}
