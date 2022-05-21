import { IsOptional } from 'class-validator';

export class QueryListDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
