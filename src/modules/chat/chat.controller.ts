import { ChatService } from './chat.service';
import {
  Controller,
  Inject,
  UseGuards,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { User } from 'src/commons/decorators/user.decorator';
import { QueryListDto } from './dto/QueryList.dto';

@ApiTags('Chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(
    @Inject('CHAT_SERVICE') private readonly chatService: ChatService,
  ) {}

  @Get('get-profile-expert-to-chat')
  getProfileExpert(@User('id') id: number) {
    return this.chatService.randomExpertToChatWithPatient(id);
  }

  @Get('get-detail-chat-session/:id')
  getDetailChatSession(@Param('id') id: number) {
    return this.chatService.getDetailChatSessionPatient(id);
  }

  @Get('get-list-messages-patient/:id')
  getListMessagesPatient(@Param('id') id: number) {
    return this.chatService.getListMessagesPatient(id);
  }

  @Get('get-list-messages-expert/:id')
  getListMessagesExpert(@Param('id') id: number) {
    return this.chatService.getListMessagesExpert(id);
  }

  @Get('admin/get-list-messages-expert/:id')
  getListMessagesExpertAdmin(@Param('id') id: number) {
    return this.chatService.getListMessagesExpertAdmin(id);
  }

  @Get('get-list-chat-sessions-of-expert/:id')
  getListChatSessionsOfExpert(
    @Param('id') id: number,
    @Query() query: QueryListDto,
  ) {
    return this.chatService.getListChatSessionsOfExpert(id, query);
  }
}
