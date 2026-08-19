# Lancy Project Domain Specification & API Guide

## 1. Project Entity Specification
```prisma
model Project {
  id              String          @id @default(uuid())
  title           String
  description     String
  budget          Float           @default(0)
  currency        String          @default("USD")
  category        String?
  projectType     String          @default("FIXED_PRICE") // FIXED_PRICE | HOURLY
  experienceLevel String          @default("INTERMEDIATE") // BEGINNER | INTERMEDIATE | EXPERT
  skills          String          @default("")
  deadline        DateTime?
  imageUrl        String?
  status          String          @default("OPEN") // DRAFT | OPEN | PAUSED | IN_PROGRESS | COMPLETED | CANCELLED | CLOSED
  clientId        String
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}
```

## 2. API Endpoints
- `POST /api/v1/projects` - Create project (`CLIENT`/`ADMIN`; `clientId` derived from auth user).
- `GET /api/v1/projects` - Paginated project discovery with status, category, projectType, experienceLevel, search filters.
- `GET /api/v1/projects/:id` - Detailed project info.
- `PATCH /api/v1/projects/:id` - Update project details (Owner/Admin only).
- `POST /api/v1/projects/:id/publish` - Change status from `DRAFT` to `OPEN`.
- `DELETE /api/v1/projects/:id` - Cancel project (Owner/Admin only).
