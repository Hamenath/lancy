import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  OnGatewayConnection, 
  OnGatewayDisconnect, 
  ConnectedSocket, 
  MessageBody 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../database/prisma.service';
import { MessagingService } from './messaging.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private prisma: PrismaService,
    private messagingService: MessagingService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        socket.disconnect();
        return;
      }

      // Resolve user from database by firebaseUid / email / id
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { firebaseUid: String(token) },
            { email: String(token) },
            { id: String(token) },
          ],
        },
      });

      if (!user || user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
        socket.disconnect();
        return;
      }

      socket.data.user = user;
      // Join user's private notification room
      socket.join(`user:${user.id}`);
      console.log(`Socket client connected: ${socket.id} (User: ${user.name})`);
    } catch (err) {
      console.error('Socket connection auth error:', err);
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    console.log(`Socket client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('conversation:join')
  async handleJoinConversation(
    @ConnectedSocket() socket: Socket,
    @MessageBody('conversationId') conversationId: string,
  ) {
    const user = socket.data.user;
    if (!user || !conversationId) return;

    try {
      await this.messagingService.getConversationDetails(conversationId, user.id);
      socket.join(`conversation:${conversationId}`);
      return { status: 'joined', conversationId };
    } catch (err) {
      return { status: 'error', message: err.message };
    }
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: { conversationId: string; content: string },
  ) {
    const user = socket.data.user;
    if (!user || !payload.conversationId || !payload.content) return;

    try {
      const message = await this.messagingService.sendMessage(
        payload.conversationId,
        user.id,
        { content: payload.content }
      );

      // Broadcast to room: conversation:{id}
      this.server.to(`conversation:${payload.conversationId}`).emit('message:new', message);

      // Broadcast notification event to user room
      const conv = await this.messagingService.getConversationDetails(payload.conversationId, user.id);
      const recipient = conv.participants.find((p) => p.userId !== user.id);
      if (recipient) {
        this.server.to(`user:${recipient.userId}`).emit('notification:new', {
          type: 'MESSAGE_RECEIVED',
          title: `New message from ${user.name}`,
          message: payload.content.substring(0, 100),
          conversationId: payload.conversationId,
        });
      }

      return { status: 'ok', message };
    } catch (err) {
      return { status: 'error', message: err.message };
    }
  }
}
