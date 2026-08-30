// 1. Single authoritative environment initialization must occur first
import './env';
import { SERVER_CONFIG } from './env';

import express from 'express';
import cors from 'cors';
import { aiRouter } from './aiServer';

const app = express();
const PORT = SERVER_CONFIG.PORT;

// Middlewares: Support dynamic development frontend origins safely
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, mobile apps, direct server requests)
      if (!origin) return callback(null, true);
      // Allow localhost or 127.0.0.1 on any port (handles Vite moving 5173 -> 5174 -> 5178 etc.)
      const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (isLocalhost) {
        return callback(null, true);
      }
      return callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));

// Health check endpoint (GET /api/health)
// Safely reports whether Gemini is configured without revealing secrets
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'FollowUpAI Intelligence Backend',
    geminiConfigured: SERVER_CONFIG.isGeminiConfigured,
    timestamp: new Date().toISOString(),
  });
});

// AI endpoints (POST /api/ai/analyze, POST /api/ai/regenerate-message)
app.use('/api/ai', aiRouter);

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({
    error: 'Internal server error occurred.',
  });
});

// Start listening and keep the Node process alive
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[FollowUpAI Server] Running on http://localhost:${PORT}`);
  console.log(`[FollowUpAI Server] Health endpoint ready at http://localhost:${PORT}/api/health`);

  // Startup validation: check if GEMINI_API_KEY is configured
  if (!SERVER_CONFIG.isGeminiConfigured) {
    console.error('[Gemini] ERROR: GEMINI_API_KEY is missing from .env.server');
  } else {
    console.log('[Gemini] Service configured and ready.');
  }
});

// Explicitly reference the server handle so the event loop remains active
server.ref();

// Graceful termination handling
server.on('error', (err: any) => {
  console.error('[FollowUpAI Server Error]:', err);
});

process.on('SIGTERM', () => {
  console.log('[FollowUpAI Server] Received SIGTERM. Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[FollowUpAI Server] Received SIGINT. Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

export { app, server };
export default app;
