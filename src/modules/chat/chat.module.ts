import { ChatService } from './chat.service';
import { ChatSession } from '../../typeorm/chat_sessions.entity';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Message } from 'src/typeorm/messages.entity';
import { User } from 'src/typeorm';
import { ChatController } from './chat.controller';
@Module({
  imports: [TypeOrmModule.forFeature([ChatSession, Message, User])],
  providers: [
    {
      provide: 'CHAT_SERVICE',
      useClass: ChatService,
    },
  ],
  controllers: [ChatController],
})
export class ChatModule {}
