import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLikeOrUnlikePostDto {
  @IsNotEmpty()
  postId: number;

  @IsNotEmpty()
  isLike: boolean;
}
