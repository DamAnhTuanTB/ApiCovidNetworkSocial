import { IsOptional } from 'class-validator';

export class UpdatePasswordDto {
  @IsOptional()
  old_password?: string;

  @IsOptional()
  new_password?: string;
}
