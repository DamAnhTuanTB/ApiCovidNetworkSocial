import { IsOptional } from 'class-validator';
export enum StatusPost {
  SUCCESS = 'success',
  PENDING = 'pending',
  CANCEL = 'cancel',
}
export class UpdateStatusPostDto {
  @IsOptional()
  status?: StatusPost;
}
