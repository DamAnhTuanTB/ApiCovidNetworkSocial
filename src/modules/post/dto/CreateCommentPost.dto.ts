import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCommentPostDto {
  @IsNotEmpty()
  postId: number;

  @IsNotEmpty()
  authorId: number;

  @IsNotEmpty()
  content_texts: string;

  @IsOptional()
  content_images?: string;
}
