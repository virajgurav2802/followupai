import { auth } from './firebase';
import type {
  AIAnalysisRequest,
  StructuredAIResponse,
  RegenerateMessageRequest,
  RegenerateMessageResponse,
} from '../types';

class AIService {
  private activeAnalysisPromise: Promise<StructuredAIResponse> | null = null;
  private activeRegenPromise: Promise<RegenerateMessageResponse> | null = null;

  /**
   * Helper to retrieve the current user's fresh Firebase ID Token.
   */
  private async getIdToken(): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('AUTH_REQUIRED: You must be signed in to perform sales intelligence analysis.');
    }
    return user.getIdToken();
  }

  /**
   * Calls POST /api/ai/analyze to analyze a sales conversation.
   * Enforces duplicate request prevention and 30-second client timeout.
   */
  async analyzeConversation(request: AIAnalysisRequest): Promise<StructuredAIResponse> {
    // Prevent duplicate simultaneous analysis requests
    if (this.activeAnalysisPromise) {
      return this.activeAnalysisPromise;
    }

    this.activeAnalysisPromise = (async () => {
      const token = await this.getIdToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      try {
        const response = await fetch('/api/ai/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(request),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorMsg = 'AI analysis failed.';
          try {
            const errData = await response.json();
            if (errData.error) errorMsg = errData.error;
          } catch {
            errorMsg = `Server returned status ${response.status}`;
          }

          if (response.status === 401) {
            throw new Error('Authentication expired. Please sign in again.');
          }
          if (response.status === 429) {
            throw new Error('AI analysis rate limit reached. Please wait a few seconds.');
          }
          if (response.status === 502 || response.status === 504) {
            throw new Error('AI backend server is not running or unreachable (502 Bad Gateway). Please run "npm run dev" or "npm run server".');
          }
          if (response.status === 503) {
            throw new Error('AI analysis service is temporarily unavailable.');
          }

          throw new Error(errorMsg);
        }

        const data: StructuredAIResponse = await response.json();
        return data;
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          throw new Error('AI analysis timed out. The conversation has been saved safely.');
        }
        throw err;
      } finally {
        this.activeAnalysisPromise = null;
      }
    })();

    return this.activeAnalysisPromise;
  }

  /**
   * Calls POST /api/ai/regenerate-message to create an alternative follow-up draft.
   */
  async regenerateMessage(request: RegenerateMessageRequest): Promise<RegenerateMessageResponse> {
    if (this.activeRegenPromise) {
      return this.activeRegenPromise;
    }

    this.activeRegenPromise = (async () => {
      const token = await this.getIdToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      try {
        const response = await fetch('/api/ai/regenerate-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(request),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorMsg = 'Unable to regenerate draft.';
          try {
            const errData = await response.json();
            if (errData.error) errorMsg = errData.error;
          } catch {
            errorMsg = `Server returned status ${response.status}`;
          }
          if (response.status === 502 || response.status === 504) {
            throw new Error('AI backend server is not running or unreachable (502 Bad Gateway). Please run "npm run dev" or "npm run server".');
          }
          throw new Error(errorMsg);
        }

        return await response.json();
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          throw new Error('Message regeneration timed out.');
        }
        throw err;
      } finally {
        this.activeRegenPromise = null;
      }
    })();

    return this.activeRegenPromise;
  }
}

export const aiService = new AIService();
