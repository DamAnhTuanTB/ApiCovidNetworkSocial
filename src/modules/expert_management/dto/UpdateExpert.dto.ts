import { IsOptional } from 'class-validator';

export class UpdateExpertDto {
  @IsOptional()
  email?: string;

  @IsOptional()
  nick_name?: string;

  @IsOptional()
  first_name?: string;

  @IsOptional()
  last_name?: string;

  @IsOptional()
  date_of_birth?: string;

  @IsOptional()
  avatar?: string;

  @IsOptional()
  telephone?: string;
}
