/**
 * AAP OAuth and Event Stream Routes
 * Handles OAuth authentication flow and event stream operations
 */

import { Router, Request, Response } from 'express';
import {
  exchangeCodeForToken,
  fetchEventStreams,
  validateToken,
} from '../services/aapClient';
import {
  requireAAPAuth,
  setSessionCookie,
  clearSessionCookie,
  parseSessionCookie,
} from '../middleware/aapAuth';
import { AAPSession } from '../types/aap';

const router = Router();

/**
 * POST /api/aap/auth/token
 * Exchange OAuth authorization code for access token
 */
router.post('/auth/token', async (req: Request, res: Response) => {
  try {
    const { code, codeVerifier, aapBaseUrl } = req.body;

    if (!code || !codeVerifier || !aapBaseUrl) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required fields: code, codeVerifier, aapBaseUrl',
      });
      return;
    }

    // Exchange code for token
    const tokenResponse = await exchangeCodeForToken(
      code,
      codeVerifier,
      aapBaseUrl
    );

    // Calculate token expiry time
    const expiresAt = Date.now() + tokenResponse.expires_in * 1000;

    // Get user info (optional - may fail if AAP doesn't support /api/v2/me/)
    let user: { username: string; email?: string } | undefined;
    try {
      const aapUser = await validateToken(tokenResponse.access_token, aapBaseUrl);
      if (aapUser) {
        user = {
          username: aapUser.username,
          email: aapUser.email,
        };
      }
    } catch (error) {
      console.warn('Failed to fetch user info from AAP:', error);
      // Continue without user info
    }

    // Create session
    const session: AAPSession = {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresAt,
      aapBaseUrl,
      user,
    };

    // Set httpOnly cookie
    setSessionCookie(res, session);

    res.json({
      success: true,
      expiresAt,
      user,
    });
  } catch (error) {
    console.error('OAuth token exchange error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Failed to exchange authorization code',
    });
  }
});

/**
 * POST /api/aap/auth/logout
 * Clear AAP session cookie
 */
router.post('/auth/logout', (_req: Request, res: Response) => {
  clearSessionCookie(res);

  res.json({
    success: true,
  });
});

/**
 * GET /api/aap/auth/status
 * Check if user has a valid AAP session
 */
router.get('/auth/status', (req: Request, res: Response) => {
  const cookieValue = req.cookies?.aap_session;

  if (!cookieValue) {
    res.json({
      authenticated: false,
    });
    return;
  }

  const session = parseSessionCookie(cookieValue);

  if (!session) {
    // Invalid or expired session
    clearSessionCookie(res);
    res.json({
      authenticated: false,
    });
    return;
  }

  res.json({
    authenticated: true,
    expiresAt: session.expiresAt,
    aapBaseUrl: session.aapBaseUrl,
    user: session.user,
  });
});

/**
 * GET /api/aap/event-streams
 * List event streams from AAP (requires authentication)
 * Filters for streams with "EDA-Playground" prefix
 */
router.get('/event-streams', requireAAPAuth(), async (req: Request, res: Response) => {
  try {
    const session = req.aapSession!;
    const filterPrefix = 'EDA-Playground'; // Only show playground event streams

    const eventStreams = await fetchEventStreams(
      session.accessToken,
      session.aapBaseUrl,
      filterPrefix
    );

    res.json({
      eventStreams,
      count: eventStreams.length,
    });
  } catch (error) {
    console.error('Event streams fetch error:', error);

    if (error instanceof Error && error.message.includes('invalid or expired')) {
      // Token expired - clear cookie and return 401
      clearSessionCookie(res);
      res.status(401).json({
        error: 'Unauthorized',
        message: 'AAP session expired. Please log in again.',
      });
      return;
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Failed to fetch event streams',
    });
  }
});

export default router;
