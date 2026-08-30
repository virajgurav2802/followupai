import { Router, type Response } from 'express';
import { requireFirebaseAuth, type AuthenticatedRequest } from './auth';
import { geminiProvider } from './geminiProvider';
import type { AIAnalysisRequest, RegenerateMessageRequest } from '../src/types';

export const aiRouter = Router();

// Protect all AI routes with Firebase ID token verification
aiRouter.use(requireFirebaseAuth);

/**
 * POST /api/ai/analyze
 * Analyzes sales conversation and returns structured sales intelligence.
 */
aiRouter.post('/analyze', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { conversation, prospectName, company, email } = req.body as AIAnalysisRequest;

  // 1. Validate required fields
  if (!prospectName || typeof prospectName !== 'string' || !prospectName.trim()) {
    res.status(400).json({ error: 'Validation Error: Prospect name is required.' });
    return;
  }

  if (!company || typeof company !== 'string' || !company.trim()) {
    res.status(400).json({ error: 'Validation Error: Company name is required.' });
    return;
  }

  // 2. Validate conversation length (10 to 20,000 characters)
  if (!conversation || typeof conversation !== 'string') {
    res.status(400).json({ error: 'Validation Error: Sales conversation context is required.' });
    return;
  }

  const trimmedConversation = conversation.trim();

  if (trimmedConversation.length < 10) {
    res.status(400).json({
      error: 'Validation Error: Conversation must be at least 10 characters long.',
    });
    return;
  }

  if (trimmedConversation.length > 20000) {
    res.status(400).json({
      error: 'Validation Error: Conversation exceeds maximum allowed length of 20,000 characters.',
    });
    return;
  }

  // 3. Call AI provider
  try {
    const analysis = await geminiProvider.analyzeConversation(
      trimmedConversation,
      prospectName.trim(),
      company.trim(),
      email?.trim()
    );

    res.status(200).json(analysis);
  } catch (error: any) {
    const msg = error.message || '';

    // Precise server-side error classification
    if (msg.includes('SERVER_CONFIG_ERROR')) {
      console.error('[AI Error /api/ai/analyze] SERVER_CONFIG_ERROR: GEMINI_API_KEY is not configured on the server.');
      res.status(503).json({ error: 'AI service configuration is unavailable on the server.' });
    } else if (msg.includes('AI_AUTH_ERROR')) {
      console.error('[AI Error /api/ai/analyze] AI_AUTH_ERROR: Gemini API key authentication failed or rejected.');
      res.status(503).json({ error: 'AI service authentication is unavailable on the server.' });
    } else if (msg.includes('AI_RATE_LIMIT')) {
      console.error('[AI Error /api/ai/analyze] AI_RATE_LIMIT: Gemini API rate limit or quota exceeded.');
      res.status(429).json({ error: 'AI processing rate limit reached. Please wait a moment and try again.' });
    } else if (msg.includes('AI_TIMEOUT')) {
      console.error('[AI Error /api/ai/analyze] AI_TIMEOUT: Gemini API request timed out.');
      res.status(504).json({ error: 'AI analysis timed out. Please try again.' });
    } else if (msg.includes('AI_NETWORK_ERROR')) {
      console.error('[AI Error /api/ai/analyze] AI_NETWORK_ERROR: Network connection failed while reaching Gemini API.');
      res.status(503).json({ error: 'AI network error occurred. Your lead has been saved.' });
    } else if (msg.includes('AI_MALFORMED_RESPONSE')) {
      console.error('[AI Error /api/ai/analyze] AI_MALFORMED_RESPONSE: Unexpected or malformed output structure from AI.');
      res.status(422).json({ error: 'AI provider returned an unexpected response structure.' });
    } else {
      console.error(`[AI Error /api/ai/analyze] AI_PROVIDER_ERROR: ${msg}`);
      res.status(503).json({
        error: 'AI analysis is temporarily unavailable. Your lead has been saved.',
      });
    }
  }
});

/**
 * POST /api/ai/regenerate-message
 * Generates an alternative follow-up draft based on authenticated context.
 */
aiRouter.post('/regenerate-message', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const {
    prospectName,
    company,
    conversation,
    intent,
    recommendedAction,
    existingMessage,
    email,
  } = req.body as RegenerateMessageRequest;

  if (!prospectName || !company || !conversation) {
    res.status(400).json({
      error: 'Validation Error: Prospect name, company, and conversation context are required to regenerate.',
    });
    return;
  }

  try {
    const regenerated = await geminiProvider.regenerateDraftMessage(
      prospectName.trim(),
      company.trim(),
      conversation.trim(),
      intent,
      recommendedAction,
      existingMessage,
      email
    );

    res.status(200).json({ draftMessage: regenerated });
  } catch (error: any) {
    const msg = error.message || '';

    if (msg.includes('SERVER_CONFIG_ERROR')) {
      console.error('[AI Error /api/ai/regenerate-message] SERVER_CONFIG_ERROR: GEMINI_API_KEY missing.');
      res.status(503).json({ error: 'AI service configuration is unavailable on the server.' });
    } else if (msg.includes('AI_AUTH_ERROR')) {
      console.error('[AI Error /api/ai/regenerate-message] AI_AUTH_ERROR: Authentication rejected by Gemini.');
      res.status(503).json({ error: 'AI service authentication is unavailable.' });
    } else if (msg.includes('AI_RATE_LIMIT')) {
      console.error('[AI Error /api/ai/regenerate-message] AI_RATE_LIMIT: Rate limit reached.');
      res.status(429).json({ error: 'Rate limit reached. Please wait a moment.' });
    } else if (msg.includes('AI_TIMEOUT')) {
      console.error('[AI Error /api/ai/regenerate-message] AI_TIMEOUT: Regeneration timed out.');
      res.status(504).json({ error: 'Message regeneration timed out. Please try again.' });
    } else if (msg.includes('AI_NETWORK_ERROR')) {
      console.error('[AI Error /api/ai/regenerate-message] AI_NETWORK_ERROR: Network connection failed.');
      res.status(503).json({ error: 'Unable to connect to AI service at this time.' });
    } else {
      console.error(`[AI Error /api/ai/regenerate-message] AI_PROVIDER_ERROR: ${msg}`);
      res.status(503).json({ error: 'Unable to regenerate follow-up draft at this time.' });
    }
  }
});
