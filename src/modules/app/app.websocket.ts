import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway(1234, {
  cors: {
    origin: '*',
  },
})
export class SocketGateway {
  @WebSocketServer()
  server: Server;

  handleMessage(dataMessage: unknown): void {
    this.server.emit('chat-received', dataMessage);
  }

  handleNotify(dataNotify: unknown): void {
    this.server.emit('notify', dataNotify);
  }
}
