import { IsNotEmpty } from 'class-validator';

export class EvaluateChatSessionDto {
  @IsNotEmpty()
  evaluate: number;

  @IsNotEmpty()
  chatSessionId: number;
}
