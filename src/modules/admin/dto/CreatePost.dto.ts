import { IsNotEmpty, IsOptional } from 'class-validator';
export enum StatusPost {
  SUCCESS = 'success',
  PENDING = 'pending',
  CANCEL = 'cancel',
}

export class CreatePostDto {
  @IsOptional()
  status?: StatusPost;

  @IsNotEmpty()
  content_texts: string;

  @IsOptional()
  content_images?: string;

  @IsNotEmpty()
  title: string;
}
