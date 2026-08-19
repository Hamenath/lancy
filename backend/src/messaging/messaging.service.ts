import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException, 
  BadRequestException 
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

export interface SendMessageDto {
  content: string;
}

@Injectable()
export class MessagingService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async getOrCreateConversation(userId: string, recipientId: string) {
    if (userId === recipientId) {
      throw new BadRequestException('Cannot start a conversation with yourself');
    }

    const recipient = await this.prisma.user.findUnique({ where: { id: recipientId } });
    if (!recipient) {
      throw new NotFoundException(`User with ID ${recipientId} not found`);
    }

    // Find existing direct conversation with both participants
    const existing = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: recipientId } } },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, photo: true, role: true },
            },
          },
        },
      },
    });

    if (existing) {
      return existing;
    }

    // Create conversation and participants
    return this.prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId },
            { userId: recipientId },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, photo: true, role: true },
            },
          },
        },
      },
    });
  }

  async getMyConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, photo: true, role: true },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { id: true, content: true, createdAt: true, senderId: true },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    return Promise.all(
      conversations.map(async (conv) => {
        const currentPart = conv.participants.find((p) => p.userId === userId);
        const otherPart = conv.participants.find((p) => p.userId !== userId);
        const lastReadAt = currentPart?.lastReadAt || new Date(0);

        const unreadCount = await this.prisma.message.count({
          where: {
            conversationId: conv.id,
            createdAt: { gt: lastReadAt },
            senderId: { not: userId },
          },
        });

        return {
          id: conv.id,
          lastMessageAt: conv.lastMessageAt,
          updatedAt: conv.updatedAt,
          otherParticipant: otherPart?.user || null,
          lastMessage: conv.messages[0] || null,
          unreadCount,
        };
      })
    );
  }

  async getConversationDetails(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, photo: true, role: true },
            },
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
    }

    const isParticipant = conversation.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    return conversation;
  }

  async getMessages(conversationId: string, userId: string, limit = 50) {
    await this.getConversationDetails(conversationId, userId);

    return this.prisma.message.findMany({
      where: { conversationId },
      take: limit,
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, name: true, photo: true },
        },
      },
    });
  }

  async sendMessage(conversationId: string, senderId: string, dto: SendMessageDto) {
    if (!dto.content || dto.content.trim().length === 0) {
      throw new BadRequestException('Message content cannot be empty');
    }

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
    }

    const isParticipant = conversation.participants.some((p) => p.userId === senderId);
    if (!isParticipant) {
      throw new ForbiddenException('You are not authorized to send messages in this conversation');
    }

    const sender = await this.prisma.user.findUnique({ where: { id: senderId } });

    // 1. Create Message
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: dto.content.trim(),
        messageType: 'TEXT',
      },
      include: {
        sender: {
          select: { id: true, name: true, photo: true },
        },
      },
    });

    // 2. Update Conversation lastMessageAt
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // 3. Create Notification for other participant
    const recipientPart = conversation.participants.find((p) => p.userId !== senderId);
    if (recipientPart) {
      await this.notificationsService.createNotification({
        userId: recipientPart.userId,
        type: 'MESSAGE_RECEIVED',
        title: `New message from ${sender?.name || 'User'}`,
        message: dto.content.substring(0, 100),
        metadata: { conversationId, senderId },
      });
    }

    return message;
  }

  async markAsRead(conversationId: string, userId: string) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    await this.prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      data: { lastReadAt: new Date() },
    });

    return { success: true };
  }

  async getUnreadCount(userId: string) {
    const participants = await this.prisma.conversationParticipant.findMany({
      where: { userId },
    });

    let totalUnread = 0;
    for (const part of participants) {
      const count = await this.prisma.message.count({
        where: {
          conversationId: part.conversationId,
          createdAt: { gt: part.lastReadAt },
          senderId: { not: userId },
        },
      });
      totalUnread += count;
    }

    return { unreadCount: totalUnread };
  }
}
