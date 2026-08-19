# Lancy AI Usage & Cost Controls

## 1. AiUsageLog Table
```prisma
model AiUsageLog {
  id                 String   @id @default(uuid())
  actorId            String?
  provider           String   // GEMINI | OPENAI | MOCK
  model              String
  operation          String   // SKILL_EXTRACTION | MATCHING | PROPOSAL_ASSIST | PROFILE_IMPROVE | ASSISTANT
  inputTokens        Int      @default(0)
  outputTokens       Int      @default(0)
  estimatedCostMinor Int      @default(0)
  latencyMs          Int      @default(0)
  status             String   @default("SUCCESS")
  createdAt          DateTime @default(now())
}
```

Every AI interaction logs input/output tokens, latency, and estimated cost for platform monitoring.
