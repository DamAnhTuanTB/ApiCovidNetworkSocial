import { IsOptional } from 'class-validator';

export class UpdatePasswordDto {
  @IsOptional()
  new_password?: string;
}
