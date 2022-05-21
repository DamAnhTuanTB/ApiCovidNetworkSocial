export class MessageReceiveDto {
  id: string;
  content: string;
  createAt: string;
  sender: {
    id: number;
    name: string;
    avatar: string;
  };
  isSend: boolean;
}
