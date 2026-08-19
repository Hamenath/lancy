# Lancy Phase 6: Real-Time Messaging & Notifications Analysis

## 1. Executive Summary
Phase 6 introduces a production-grade real-time messaging and notification system:
```
User Auth (Firebase ID Token) -> WebSocket Handshake & Authentication -> Join Private User & Conversation Rooms -> Persist Message in PostgreSQL -> Broadcast Real-time Events -> Push System & Message Notifications
```

## 2. Existing Chat Implementation & Gap Analysis
- **Current State**: `src/pages/Chat.tsx` listens directly to Firestore (`collection(db, "chats")`).
- **Gaps Identified**:
  1. Messages and notifications are decoupled from NestJS backend & PostgreSQL database.
  2. No server-side sender verification or message content sanitization.
  3. No unread message tracking cursors (`lastReadAt`) or notification badge counts.
  4. No domain notifications for key marketplace events (Proposals, Contracts, Milestones).

## 3. Required Data Model Additions (`schema.prisma`)
1. **`Conversation`**: `id`, `lastMessageAt`, `createdAt`, `updatedAt`.
2. **`ConversationParticipant`**: `id`, `conversationId`, `userId`, `joinedAt`, `lastReadAt`. Unique compound constraint `@@unique([conversationId, userId])`.
3. **`Message`**: `id`, `conversationId`, `senderId`, `content`, `messageType` (`TEXT`, `SYSTEM`), `createdAt`, `updatedAt`, `deletedAt`.
4. **`Notification`**: `id`, `userId`, `type`, `title`, `message`, `readAt`, `metadata`, `createdAt`.

## 4. Real-Time Architecture & Socket Rooms
- **Gateway**: `MessagingGateway` using `@nestjs/websockets` and `@nestjs/platform-socket.io`.
- **Handshake Auth**: Validates Firebase ID Token passed in `client.handshake.auth.token` or query string.
- **Rooms**:
  - `user:{userId}`: For user-specific real-time notifications and unread badge updates.
  - `conversation:{conversationId}`: For real-time chat broadcasts (`message:new`).
- **Persistence Guarantee**: Every message is validated, sanitized, and stored in PostgreSQL *before* WebSockets emit `message:new`.
