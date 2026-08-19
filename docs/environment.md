# Lancy Environment Variables Specification

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | No | `4000` | Backend API port. |
| `NODE_ENV` | No | `development` | Server environment (`development` / `production`). |
| `DATABASE_URL` | Yes | `file:./dev.db` | SQLite or PostgreSQL connection string. |
| `AI_PROVIDER` | No | `MOCK` | Active AI provider (`GEMINI` or `MOCK`). |
| `AI_API_KEY` | Conditional | - | Google Gemini API key if `AI_PROVIDER=GEMINI`. |
| `CORS_ORIGINS` | No | `http://localhost:5173` | Allowed CORS origins (comma-separated). |
| `PAYMENT_PROVIDER` | No | `STRIPE_MOCK` | Payment gateway connector mode. |
