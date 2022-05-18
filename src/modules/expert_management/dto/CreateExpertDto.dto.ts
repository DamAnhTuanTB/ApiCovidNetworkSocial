import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { UserRole } from 'src/typeorm/user.entity';

export class CreateExpertDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  nick_name?: string;

  @IsNotEmpty()
  first_name: string;

  @IsNotEmpty()
  last_name: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole.EXPERT;

  @IsOptional()
  date_of_birth?: string;

  @IsOptional()
  avatar?: string;

  @IsOptional()
  telephone?: string;
}
