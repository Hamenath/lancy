# Lancy Phase 12: AI Marketplace Intelligence Analysis

## 1. Executive Summary
Phase 12 introduces a production-ready, provider-independent AI layer into Lancy. AI capabilities enhance freelancer matching, project skill extraction, profile optimization, proposal drafting assistance, and marketplace search while adhering to strict human-in-the-loop and privacy mandates.

```
Marketplace Request -> AIService (Provider-Independent Interface) -> Mock / Gemini Provider -> Structured Output Schema Validation -> Grounded Response / Deterministic Fallback -> UI Recommendation
```

## 2. Core Security & Architectural Principles
1. **Human-in-the-Loop Authority**: AI provides recommendations and drafts ONLY. AI never executes hiring, rejection, account suspension, or payment decisions.
2. **Provider Independence**: `AIService` depends on the `AIProvider` interface. Switching between Google Gemini, OpenAI, or local providers requires only an environment configuration update (`AI_PROVIDER=gemini|openai|mock`).
3. **Fact Grounding & Hallucination Prevention**: Proposal and profile assistance use verified user entity context only. Fabricating non-existent work experience, Google clients, or 10-year timelines is forbidden.
4. **Deterministic Fallbacks**: If AI API keys are unconfigured or timeouts occur (15s timeout limit), system falls back seamlessly to Phase 9 keyword/relevance search and standard Prisma queries.

## 3. Data Model Specifications (`schema.prisma`)
- **`AiUsageLog`**: `id`, `actorId`, `provider`, `model`, `operation`, `inputTokens`, `outputTokens`, `estimatedCostMinor`, `latencyMs`, `status`, `createdAt`.
- **`Embedding`**: `id`, `entityType` (`FREELANCER`, `PROJECT`), `entityId`, `vector`, `contentHash`, `model`, `createdAt`.
