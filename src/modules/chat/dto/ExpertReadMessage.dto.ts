import { IsNotEmpty } from 'class-validator';

export class ExpertReadMessage {
  @IsNotEmpty()
  expertId: number;
}
