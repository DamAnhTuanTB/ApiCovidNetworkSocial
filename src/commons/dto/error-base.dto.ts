import { IsOptional, IsString } from 'class-validator';

export class ErrorBaseDto {
  @IsString()
  @IsOptional()
  message: string;

  @IsString()
  @IsOptional()
  statusCode: number;
}
