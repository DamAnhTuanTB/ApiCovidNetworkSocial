import { IsNotEmpty, IsOptional } from 'class-validator';
export enum StatusPost {
  SUCCESS = 'success',
  PENDING = 'pending',
  CANCEL = 'cancel',
}
export class UpdateStatusPostDto {
  @IsNotEmpty()
  status: StatusPost;

  @IsNotEmpty()
  authorId: number;
}
