/**
 * Proxy endpoint for EDA webhook requests
 * Bypasses CORS restrictions by forwarding from backend
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();

/**
 * POST /api/proxy
 * Forwards event payload to EDA webhook endpoint
 */
router.post('/', async (req, res) => {
  try {
    const { url, payload, authToken, authType } = req.body;

    // Validate required fields
    if (!url || !payload) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Both url and payload are required'
      });
    }

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Handle Bearer token authentication
    if (authType === 'bearer' && authToken?.trim()) {
      let token = authToken.trim();
      // Auto-prefix "Bearer " if not present
      if (!token.toLowerCase().startsWith('bearer ')) {
        token = `Bearer ${token}`;
      }
      headers['Authorization'] = token;
    }

    const startTime = Date.now();

    // Forward request to EDA webhook
    const response = await axios.post(url, payload, {
      headers,
      timeout: 30000,
      validateStatus: () => true, // Don't throw on any status code
      // Allow self-signed certificates in development
      httpsAgent: process.env.NODE_ENV === 'development' ? new (require('https').Agent)({
        rejectUnauthorized: false
      }) : undefined,
    });

    const duration = Date.now() - startTime;

    // Return response to frontend
    return res.json({
      success: response.status >= 200 && response.status < 300,
      statusCode: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      duration,
    });

  } catch (error: unknown) {
    console.error('Proxy request failed:', error);

    if (axios.isAxiosError(error)) {
      return res.status(502).json({
        error: 'Proxy request failed',
        message: error.message,
        code: error.code,
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
