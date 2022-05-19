import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { UserRole } from 'src/typeorm/user.entity';

export class CreateNotificationDto {
  @IsNotEmpty()
  content_texts: string;

  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  senderId: number;

  @IsNotEmpty()
  postId: number;
}
