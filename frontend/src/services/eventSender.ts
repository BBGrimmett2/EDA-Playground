/**
 * Event Sender Service for EDA Webhooks
 */

import axios from 'axios';
import type { ApiResponse, AuthType } from '../types/integration';

/**
 * Send event payload to EDA webhook
 */
export async function sendEventToEDA(
  url: string,
  payload: Record<string, any>,
  authToken: string,
  authType: AuthType
): Promise<ApiResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Handle Bearer token authentication
  if (authType === 'bearer' && authToken.trim()) {
    let token = authToken.trim();
    // Auto-prefix "Bearer " if not present
    if (!token.toLowerCase().startsWith('bearer ')) {
      token = `Bearer ${token}`;
    }
    headers['Authorization'] = token;
  }

  const startTime = Date.now();

  try {
    const response = await axios.post(url, payload, {
      headers,
      timeout: 30000,
      validateStatus: () => true, // Don't throw on any status code
    });

    const duration = Date.now() - startTime;

    return {
      success: response.status >= 200 && response.status < 300,
      statusCode: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      duration,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Network error or timeout
      throw new Error(
        `Request failed: ${error.message}${
          error.code ? ` (${error.code})` : ''
        }`
      );
    }

    throw error;
  }
}
