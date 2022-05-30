import { IsOptional } from 'class-validator';
export class UpdateCommentDto {
  @IsOptional()
  content_texts?: string;

  @IsOptional()
  content_images?: string;
}
