import { ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@ApiTags('Example')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('ping')
  getHello(): string {
    return this.appService.getWelcome();
  }
}
