# Lancy AI Security & Prompt Injection Defense

## 1. Fact Grounding
Proposal drafting and profile improvement consume verified database entity fields only. Generating non-existent client histories or fake work experience is prevented by system prompts and schema validation.

## 2. Authorization Defense
LLM prompts do NOT handle authorization. Backend session authentication (`FirebaseAuthGuard`) enforces data boundaries before context is retrieved for AI processing.
