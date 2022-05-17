import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLikeOrUnlikeCommentDto {
  @IsNotEmpty()
  commentId: number;

  @IsNotEmpty()
  isLike: boolean;
}
