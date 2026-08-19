# Lancy Troubleshooting Guide

## Common Issues & Solutions

### 1. Database Lock Error during `prisma generate`
**Symptom**: `EPERM: operation not permitted` on `query_engine-windows.dll.node`.  
**Solution**: Stop running NestJS backend processes on port 4000 before running `npx prisma generate`.

### 2. CORS Errors in Frontend Console
**Symptom**: `Access to fetch at 'http://localhost:4000' from origin 'http://localhost:5173' has been blocked by CORS policy`.  
**Solution**: Ensure `CORS_ORIGINS` in `backend/.env` includes your frontend origin (e.g. `http://localhost:5173`).

### 3. AI Assistant Operating in Offline/Mock Mode
**Symptom**: AI responses state "Lancy AI Assistant is operating in offline mode".  
**Solution**: Verify `AI_PROVIDER=GEMINI` and set a valid `AI_API_KEY` in `backend/.env`.

### 4. Real-Time Chat WebSocket Connection Failed
**Symptom**: Messages do not update dynamically.  
**Solution**: Ensure port 4000 is open and accessible by Socket.IO client connections.
