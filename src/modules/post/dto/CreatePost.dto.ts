import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  content_texts: string;

  @IsOptional()
  content_images?: string;

  @IsNotEmpty()
  title: string;
}
