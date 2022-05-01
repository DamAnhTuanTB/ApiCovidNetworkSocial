import { IsOptional } from 'class-validator';
export enum StatusPost {
  SUCCESS = 'success',
  PENDING = 'pending',
  CANCEL = 'cancel',
}
export class UpdatePostDto {
  @IsOptional()
  content_texts?: string;

  @IsOptional()
  content_images?: string;

  @IsOptional()
  status?: StatusPost;

  @IsOptional()
  title?: string;
}
