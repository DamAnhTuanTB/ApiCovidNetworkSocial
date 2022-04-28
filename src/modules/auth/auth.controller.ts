import { LoginUserDto } from './dto/LoginUser.dto';
import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Body() loginUser: LoginUserDto) {
    return this.authService.login(req.user);
  }
}
