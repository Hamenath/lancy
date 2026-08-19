import { apiFetch, API_BASE_URL } from "./apiConfig";
import { io, Socket } from "socket.io-client";

export interface ChatParticipant {
  id: string;
  name: string;
  photo?: string;
  role?: string;
}

export interface ChatConversation {
  id: string;
  lastMessageAt: string;
  updatedAt: string;
  otherParticipant: ChatParticipant | null;
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    photo?: string;
  };
}

let socket: Socket | null = null;

export const chatService = {
  connectSocket(token: string): Socket {
    if (socket && socket.connected) {
      return socket;
    }
    const wsUrl = API_BASE_URL.replace('/api/v1', '');
    socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    return socket;
  },

  disconnectSocket() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  async getOrCreateConversation(recipientId: string): Promise<ChatConversation | null> {
    return apiFetch<ChatConversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ recipientId }),
    });
  },

  async getMyConversations(): Promise<ChatConversation[]> {
    const res = await apiFetch<ChatConversation[]>('/conversations');
    return res || [];
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const res = await apiFetch<ChatMessage[]>(`/conversations/${conversationId}/messages`);
    return res || [];
  },

  async sendMessage(conversationId: string, content: string): Promise<ChatMessage | null> {
    return apiFetch<ChatMessage>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  async markAsRead(conversationId: string): Promise<void> {
    await apiFetch(`/conversations/${conversationId}/read`, {
      method: 'POST',
    });
  },

  async getUnreadCount(): Promise<number> {
    const res = await apiFetch<{ unreadCount: number }>('/conversations/unread-count');
    return res?.unreadCount || 0;
  },
};
