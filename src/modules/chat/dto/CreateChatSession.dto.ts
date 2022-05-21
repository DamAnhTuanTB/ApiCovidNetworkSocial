import { IsNotEmpty } from 'class-validator';

export class CreateChatSessionDto {
  @IsNotEmpty()
  expertId: number;

  @IsNotEmpty()
  startTime: string;
}
