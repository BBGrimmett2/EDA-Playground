/**
 * AAP Authentication Middleware
 * Validates AAP session cookies and provides authentication middleware
 */

import { Request, Response, NextFunction } from 'express';
import { AAPSession } from '../types/aap';

const COOKIE_NAME = 'aap_session';

// Extend Express Request type to include aapSession
declare global {
  namespace Express {
    interface Request {
      aapSession?: AAPSession;
    }
  }
}

/**
 * Parse and decode AAP session from cookie
 * Cookie contains base64-encoded JSON with session data
 */
export function parseSessionCookie(cookieValue: string): AAPSession | null {
  try {
    const decoded = Buffer.from(cookieValue, 'base64').toString('utf-8');
    const session = JSON.parse(decoded) as AAPSession;

    // Validate session structure
    if (
      !session.accessToken ||
      !session.expiresAt ||
      !session.aapBaseUrl
    ) {
      return null;
    }

    // Check if session has expired
    if (Date.now() >= session.expiresAt) {
      return null;
    }

    return session;
  } catch (error) {
    console.error('Failed to parse session cookie:', error);
    return null;
  }
}

/**
 * Encode AAP session to base64 cookie value
 */
export function encodeSessionCookie(session: AAPSession): string {
  const json = JSON.stringify(session);
  return Buffer.from(json, 'utf-8').toString('base64');
}

/**
 * Middleware to require AAP authentication
 * Returns 401 if no valid session exists
 */
export function requireAAPAuth() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const cookieValue = req.cookies?.[COOKIE_NAME];

    if (!cookieValue) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'AAP authentication required',
      });
      return;
    }

    const session = parseSessionCookie(cookieValue);

    if (!session) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired AAP session',
      });
      return;
    }

    // Attach session to request
    req.aapSession = session;
    next();
  };
}

/**
 * Optional authentication middleware
 * Attaches session if present but doesn't require it
 */
export function optionalAAPAuth() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const cookieValue = req.cookies?.[COOKIE_NAME];

    if (cookieValue) {
      const session = parseSessionCookie(cookieValue);
      if (session) {
        req.aapSession = session;
      }
    }

    next();
  };
}

/**
 * Set AAP session cookie in response
 */
export function setSessionCookie(res: Response, session: AAPSession): void {
  const cookieDomain = process.env.COOKIE_DOMAIN || 'localhost';
  const cookieSecure = process.env.COOKIE_SECURE === 'true';

  const cookieValue = encodeSessionCookie(session);

  res.cookie(COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: 'lax',
    domain: cookieDomain,
    maxAge: session.expiresAt - Date.now(), // Cookie expires when session expires
    path: '/',
  });
}

/**
 * Clear AAP session cookie
 */
export function clearSessionCookie(res: Response): void {
  const cookieDomain = process.env.COOKIE_DOMAIN || 'localhost';

  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    domain: cookieDomain,
    path: '/',
  });
}
