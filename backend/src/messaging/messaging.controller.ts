import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagingService, SendMessageDto } from './messaging.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('conversations')
@Controller('api/v1/conversations')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get or create direct conversation between current user and target user' })
  async getOrCreateConversation(
    @CurrentUser() user: AuthenticatedUser,
    @Body('recipientId') recipientId: string,
  ) {
    return this.messagingService.getOrCreateConversation(user.id, recipientId);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get conversations for current user with previews & unread counts' })
  async getMyConversations(@CurrentUser() user: AuthenticatedUser) {
    return this.messagingService.getMyConversations(user.id);
  }

  @Get('unread-count')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get total unread message count for current user' })
  async getUnreadCount(@CurrentUser() user: AuthenticatedUser) {
    return this.messagingService.getUnreadCount(user.id);
  }

  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get conversation details by ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.messagingService.getConversationDetails(id, user.id);
  }

  @Get(':id/messages')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated message history for conversation' })
  async getMessages(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit?: number,
  ) {
    return this.messagingService.getMessages(id, user.id, Number(limit) || 50);
  }

  @Post(':id/messages')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a message in a conversation (Sender derived from auth token)' })
  async sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagingService.sendMessage(id, user.id, dto);
  }

  @Post(':id/read')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark conversation messages as read' })
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.messagingService.markAsRead(id, user.id);
  }
}
