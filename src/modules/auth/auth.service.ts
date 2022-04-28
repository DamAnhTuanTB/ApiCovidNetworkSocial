import { UserService } from './../user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { comparePassword } from 'src/commons/helpers/bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(emailOrTelephone: string, password: string) {
    const userDB = await this.userService.findUserByEmailOrTelephone(
      emailOrTelephone,
    );
    if (userDB) {
      const matched = comparePassword(password, userDB.password);
      if (matched) {
        return userDB;
      } else {
        return null;
      }
    } else {
      throw new UnauthorizedException();
    }
  }
  async login(user: any) {
    const payload = { email: user.email, id: user.id };
    return {
      token: this.jwtService.sign(payload),
    };
  }
}
