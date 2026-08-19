# Lancy Contract Domain Specification & API Guide

## 1. Contract Entity Specification
```prisma
model Contract {
  id              String      @id @default(uuid())
  projectId       String      @unique
  proposalId      String      @unique
  clientId        String
  freelancerId    String
  title           String
  description     String
  agreedAmount    Float
  currency        String      @default("USD")
  startDate       DateTime    @default(now())
  expectedEndDate DateTime?
  status          String      @default("ACTIVE") // DRAFT | ACTIVE | PAUSED | COMPLETED | CANCELLED
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}
```

## 2. API Endpoints & Access Control
- `GET /api/v1/contracts/me` - List contracts for current authenticated client/freelancer.
- `GET /api/v1/contracts/:id` - Detailed contract view with project, milestone list, and participant profiles (Participant/Admin authorization).
- `GET /api/v1/contracts` - List all contracts (Admin only).
