# Lancy AI Providers & Environment Configuration

## 1. Environment Configuration Variables (`.env.example`)
```env
AI_PROVIDER=MOCK # GEMINI | MOCK
AI_MODEL=gemini-1.5-flash
AI_EMBEDDING_MODEL=text-embedding-004
AI_API_KEY=your_gemini_api_key_here
```

## 2. Fallback Behavior
If `AI_PROVIDER=GEMINI` is specified without a valid `AI_API_KEY`, or if an API call exceeds the 15-second timeout, `AiService` falls back seamlessly to `MockAIProvider` and Phase 9 keyword search.
