# Lancy AI Architecture & Capabilities

## 1. Provider-Independent AI Architecture
```
AIService
 ├── GeminiAIProvider
 └── MockAIProvider (Fallback)
```
The business layer depends on capability abstractions (`extractSkills`, `improveProject`, `improveProfile`, `improveProposal`, `chat`, `generateEmbedding`). Provider vendor SDKs are fully decoupled behind the `AIProvider` interface.

## 2. Human-in-the-Loop Safeguards
AI acts as an advisory assistant and candidate recommender only. AI never performs hiring, rejection, account suspension, or financial transactions automatically.
