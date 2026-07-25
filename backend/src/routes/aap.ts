/**
 * AAP OAuth and Event Stream Routes
 * Handles OAuth authentication flow and event stream operations
 */

import { Router, Request, Response } from 'express';
import {
  exchangeCodeForToken,
  fetchEventStreams,
  validateToken,
  fetchOrganizations,
  createEventStreamCredential,
  createEventStream,
  deleteEventStreamCredential,
} from '../services/aapClient';
import {
  requireAAPAuth,
  setSessionCookie,
  clearSessionCookie,
  parseSessionCookie,
} from '../middleware/aapAuth';
import { AAPSession, CreateEventStreamRequest } from '../types/aap';

const router = Router();

/**
 * GET /api/aap/auth/config
 * Returns OAuth configuration needed by frontend
 * These are public configuration values (not secrets)
 */
router.get('/auth/config', (_req: Request, res: Response) => {
  const clientId = process.env.AAP_CLIENT_ID;
  const redirectUri = process.env.AAP_REDIRECT_URI;
  const baseUrl = process.env.AAP_BASE_URL;

  if (!clientId || !redirectUri) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'OAuth configuration is not properly set. Check AAP_CLIENT_ID and AAP_REDIRECT_URI environment variables.',
    });
    return;
  }

  res.json({
    clientId,
    redirectUri,
    baseUrl: baseUrl || null,
  });
});

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

/**
 * GET /api/aap/organizations
 * List organizations from AAP (requires authentication)
 */
router.get('/organizations', requireAAPAuth(), async (req: Request, res: Response) => {
  try {
    const session = req.aapSession!;

    const organizations = await fetchOrganizations(
      session.accessToken,
      session.aapBaseUrl
    );

    res.json({
      organizations,
      count: organizations.length,
    });
  } catch (error) {
    console.error('Organizations fetch error:', error);

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
      message: error instanceof Error ? error.message : 'Failed to fetch organizations',
    });
  }
});

/**
 * POST /api/aap/event-streams
 * Create a new event stream with credential (requires authentication)
 * Two-step process: creates credential first, then event stream
 */
router.post('/event-streams', requireAAPAuth(), async (req: Request, res: Response) => {
  try {
    const session = req.aapSession!;
    const { name, testMode, token, organizationId }: CreateEventStreamRequest = req.body;

    // Validate request
    if (!name || typeof testMode !== 'boolean' || !token || !organizationId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required fields: name, testMode, token, organizationId',
      });
      return;
    }

    // Validate name starts with "EDA-Playground"
    if (!name.startsWith('EDA-Playground')) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Event stream name must start with "EDA-Playground"',
      });
      return;
    }

    let credential;
    let eventStream;

    try {
      // Step 1: Create credential
      credential = await createEventStreamCredential(
        session.accessToken,
        session.aapBaseUrl,
        name, // Use same name as event stream
        token,
        organizationId
      );

      // Step 2: Create event stream using credential
      eventStream = await createEventStream(
        session.accessToken,
        session.aapBaseUrl,
        name,
        testMode,
        credential.id,
        organizationId
      );

      res.status(201).json({
        success: true,
        eventStream,
      });
    } catch (error) {
      // If event stream creation fails after credential created, clean up
      if (credential && !eventStream) {
        console.log(`Attempting to delete orphaned credential ${credential.id}`);
        await deleteEventStreamCredential(
          session.accessToken,
          session.aapBaseUrl,
          credential.id
        );
      }

      // Check if error is due to duplicate name
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({
          error: 'Conflict',
          message: error.message,
          aapLink: `${session.aapBaseUrl}/decisions/event-streams/`,
        });
        return;
      }

      throw error;
    }
  } catch (error) {
    console.error('Event stream creation error:', error);

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
      message: error instanceof Error ? error.message : 'Failed to create event stream',
    });
  }
});

export default router;
