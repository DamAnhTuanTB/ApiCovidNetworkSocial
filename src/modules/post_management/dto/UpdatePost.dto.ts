import { IsOptional } from 'class-validator';
export class UpdatePostDto {
  @IsOptional()
  content_texts?: string;

  @IsOptional()
  content_images?: string;

  @IsOptional()
  title?: string;
}
