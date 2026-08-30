import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables from .env.server first, then fallback to .env
dotenv.config({ path: path.join(rootDir, '.env.server') });
dotenv.config({ path: path.join(rootDir, '.env') });

export const SERVER_CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'followupai-73abb',
  get GEMINI_API_KEY(): string {
    return (process.env.GEMINI_API_KEY || '').trim();
  },
  get isGeminiConfigured(): boolean {
    return Boolean(this.GEMINI_API_KEY);
  },
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
};
