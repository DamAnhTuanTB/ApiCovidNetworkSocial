import { IsNotEmpty } from 'class-validator';

export class EndChatSessionDto {
  @IsNotEmpty()
  chatSessionId: number;

  @IsNotEmpty()
  endTime: string;

  @IsNotEmpty()
  expectId: number;
}
