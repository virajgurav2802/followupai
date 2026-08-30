import type { Request, Response, NextFunction } from 'express';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Extend Express Request interface to include authenticated user
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

// Initialize Firebase Admin SDK once
const projectId = process.env.FIREBASE_PROJECT_ID || 'followupai-73abb';

if (!getApps().length) {
  try {
    initializeApp({
      projectId,
    });
    console.log(`[Firebase Admin] Initialized for project: ${projectId}`);
  } catch (error) {
    console.error('[Firebase Admin] Initialization warning:', error);
  }
}

/**
 * Authentication Middleware:
 * Extracts Bearer token, verifies via Firebase Admin SDK,
 * and attaches verified user identity to the request.
 */
export async function requireFirebaseAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized: Missing or invalid Authorization header. Expected Bearer token.',
    });
    return;
  }

  const token = authHeader.split('Bearer ')[1]?.trim();

  if (!token) {
    res.status(401).json({
      error: 'Unauthorized: Empty token provided.',
    });
    return;
  }

  try {
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    
    if (!decodedToken || !decodedToken.uid) {
      res.status(401).json({
        error: 'Unauthorized: Token verification yielded no valid UID.',
      });
      return;
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    next();
  } catch (err: any) {
    console.error('[Auth Error] Firebase ID token verification failed:', err.message);
    res.status(401).json({
      error: 'Unauthorized: Firebase ID token is invalid, expired, or revoked.',
    });
  }
}
