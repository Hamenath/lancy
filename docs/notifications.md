# Lancy System Notifications Specification & API Guide

## 1. Notification Types & Marketplace Triggers
- `MESSAGE_RECEIVED`: Triggered when a participant sends a chat message.
- `PROPOSAL_RECEIVED`: Triggered when a freelancer submits a project proposal.
- `PROPOSAL_ACCEPTED`: Triggered when a client accepts a proposal.
- `PROPOSAL_REJECTED`: Triggered when a client rejects a proposal.
- `CONTRACT_CREATED`: Triggered when a contract is generated upon proposal acceptance.
- `MILESTONE_SUBMITTED`: Triggered when a freelancer submits milestone work.
- `MILESTONE_APPROVED`: Triggered when a client approves a milestone.
- `CHANGES_REQUESTED`: Triggered when a client requests milestone revision.

## 2. API Endpoints
- `GET /api/v1/notifications` - List user notifications.
- `GET /api/v1/notifications/unread-count` - Get unread count.
- `POST /api/v1/notifications/:id/read` - Mark single notification read.
- `POST /api/v1/notifications/read-all` - Mark all notifications read.
