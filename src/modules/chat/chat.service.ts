import { QueryListDto } from './dto/QueryList.dto';
import { EndChatSessionDto } from './dto/EndChatSession.dto';
import { EvaluateChatSessionDto } from './dto/EvaluateChatSession.dto';
import { ChatSession } from './../../typeorm/chat_sessions.entity';
import { UserRole } from 'src/typeorm/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Repository } from 'typeorm';
import { Message } from 'src/typeorm/messages.entity';
import { User } from 'src/typeorm';
import { SendMessageDto } from './dto/SendMessage';

@WebSocketGateway(4444, {
  cors: {
    origin: '*',
  },
})
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private readonly chatSessionRepository: Repository<ChatSession>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  @WebSocketServer()
  server: Server;

  async randomExpertToChatWithPatient(patientId: number): Promise<any> {
    const experts = await this.userRepository.find({
      role: UserRole.EXPERT,
      is_active: true,
    });
    const numberRandom = Math.floor(Math.random() * experts.length);
    const patient = await this.userRepository.findOne({ id: patientId });
    const expert = await this.userRepository.findOne({
      id: experts[numberRandom].id,
    });

    const time = new Date().toISOString();

    return await this.chatSessionRepository.save({
      patient,
      expert,
      start_time: time,
      updated_at: time,
    });
  }

  async getDetailChatSessionPatient(id: number) {
    const chatSession = await this.chatSessionRepository
      .createQueryBuilder('chat_sessions')
      .leftJoinAndSelect('chat_sessions.patient', 'users')
      .where('chat_sessions.id = :id ', {
        id,
      })
      .getOne();
    return chatSession;
  }

  async getDetailChatSessionExpert(id: number) {
    const chatSession = await this.chatSessionRepository
      .createQueryBuilder('chat_sessions')
      .leftJoinAndSelect('chat_sessions.expert', 'users')
      .where('chat_sessions.id = :id ', {
        id,
      })
      .getOne();
    return chatSession;
  }

  async getListMessagesPatient(id: number) {
    const listMessages = await this.messageRepository
      .createQueryBuilder('messages')
      .leftJoinAndSelect('messages.chat_session', 'chat_sessions')
      .where('messages.chatSessionId = :id', { id })
      .getMany();
    return listMessages;
  }

  async getListMessagesExpert(id: number) {
    const listMessages = await this.messageRepository
      .createQueryBuilder('messages')
      .leftJoinAndSelect('messages.chat_session', 'chat_sessions')
      .where('messages.chatSessionId = :id', { id })
      .getMany();
    await this.chatSessionRepository.update({ id }, { is_new: 0 });
    return listMessages;
  }

  async getListChatSessionsOfExpert(id: number, query: QueryListDto) {
    const day = Number(query.date.substring(0, 2));
    const month = Number(query.date.substring(3, 5));
    const year = Number(query.date.substring(6, 10));

    let condition = `chat_sessions.expertId = ${id} and chat_sessions.start_time != chat_sessions.updated_at`;
    if (query.date !== 'undefined') {
      condition += ` and DAY(chat_sessions.start_time) = ${day} and MONTH(chat_sessions.start_time) = ${month} and YEAR(chat_sessions.start_time) = ${year}`;
    }
    if (Number(query.status) === 1) {
      condition += ` and chat_sessions.end_time IS NULL`;
    } else if (Number(query.status) === 2) {
      condition += ` and chat_sessions.end_time IS NOT NULL`;
    }

    const listChatSessions = await this.chatSessionRepository
      .createQueryBuilder('chat_sessions')
      .leftJoinAndSelect('chat_sessions.patient', 'users')
      .where(condition)
      // .andWhere('chat_sessions.start_time != chat_sessions.updated_at')
      .addOrderBy('chat_sessions.updated_at', 'DESC')
      .getMany();

    const _listChatSession = listChatSessions.map((chatSession) => ({
      id: chatSession.id,
      patientName: chatSession.patient.first_name,
      patientId: chatSession.patient.id,
      patientAvatar: chatSession.patient.avatar,
      updatedAt: chatSession.updated_at,
      isNew: chatSession.is_new,
      isEnd: !!chatSession.end_time,
      startedAt: chatSession.start_time,
    }));

    return {
      total: _listChatSession.length,
      data: _listChatSession.slice(
        (query.page - 1) * query.limit,
        (query.page - 1) * query.limit + query.limit,
      ),
    };
  }

  @SubscribeMessage('patient_send_message')
  async handleEventPatientSendMessage(
    @MessageBody() message: SendMessageDto,
  ): Promise<any> {
    console.log(message);
    const chat_session = await this.getDetailChatSessionPatient(
      message.chatSessionId,
    );
    await this.messageRepository.save({
      chat_session,
      content_texts: message.content,
      created_at: message.createdAt,
      role: UserRole.PATIENT,
    });

    await this.chatSessionRepository.update(
      {
        id: message.chatSessionId,
      },
      {
        is_new: 1,
        updated_at: message.createdAt,
      },
    );

    this.server.emit('expert_receiver_message', {
      id: message.chatSessionId,
      expectId: message.expertId,
    });
  }

  @SubscribeMessage('expert_send_message')
  async handleEventExpertSendMessage(
    @MessageBody() message: SendMessageDto,
  ): Promise<any> {
    const chat_session = await this.getDetailChatSessionExpert(
      message.chatSessionId,
    );
    await this.messageRepository.save({
      chat_session,
      content_texts: message.content,
      created_at: message.createdAt,
      role: UserRole.EXPERT,
    });
    this.server.emit('patient_receiver_message', {
      id: message.chatSessionId,
    });
  }

  @SubscribeMessage('evaluate_chat_session')
  async handleEvaluateChatSession(
    @MessageBody() data: EvaluateChatSessionDto,
  ): Promise<any> {
    await this.chatSessionRepository.update(
      { id: data.chatSessionId },
      {
        evaluate: data.evaluate,
      },
    );
    this.server.emit('receive_evaluate_chat_session', {
      chatSessionId: data.chatSessionId,
      evaluate: data.evaluate,
    });
  }

  @SubscribeMessage('end_chat_session')
  async handleEndChatSession(
    @MessageBody() data: EndChatSessionDto,
  ): Promise<any> {
    await this.chatSessionRepository.update(
      {
        id: data.chatSessionId,
      },
      {
        end_time: data.endTime,
      },
    );
    this.server.emit('receive_end_chat_session', {
      chatSessionId: data.chatSessionId,
      end_time: new Date().toISOString(),
      expectId: data.expectId,
    });
  }
}
