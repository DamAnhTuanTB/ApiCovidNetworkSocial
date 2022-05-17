import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSaveOrUnsavePostDto {
  @IsNotEmpty()
  postId: number;

  @IsNotEmpty()
  isSave: boolean;
}
