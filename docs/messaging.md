# Lancy Real-Time Messaging Architecture & API Guide

## 1. WebSocket Gateway & Handshake Authentication
- **Gateway**: `MessagingGateway` on `http://localhost:4000`.
- **Authentication**: Handshake connection checks `socket.handshake.auth.token` or `socket.handshake.query.token` (Firebase ID Token).
- **Socket Rooms**:
  - `user:{userId}` - Private user room for notifications and unread badge events.
  - `conversation:{conversationId}` - Conversation room for real-time `message:new` broadcasts.

## 2. WebSocket Events
- **Client Emits `conversation:join`**: `{ "conversationId": "..." }` (Verifies participant status).
- **Client Emits `message:send`**: `{ "conversationId": "...", "content": "..." }`.
- **Server Emits `message:new`**: Broadcasts persisted message to `conversation:{id}`.
- **Server Emits `notification:new`**: Pushes notification to `user:{recipientId}`.

## 3. REST API Endpoints
- `POST /api/v1/conversations` - Create or retrieve direct conversation.
- `GET /api/v1/conversations` - List conversations with preview and unread counts.
- `GET /api/v1/conversations/:id/messages` - Paginated message history.
- `POST /api/v1/conversations/:id/messages` - Send & persist message.
- `POST /api/v1/conversations/:id/read` - Mark conversation read.
- `GET /api/v1/conversations/unread-count` - Total unread message count.
