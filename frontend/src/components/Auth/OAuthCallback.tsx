/**
 * OAuth Callback Handler
 * Processes OAuth redirect from AAP and exchanges code for token
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Spinner,
  Alert,
  Button,
} from '@patternfly/react-core';
import { exchangeAuthCode } from '../../services/aapAuth';
import { useAppContext } from '../../context/AppContext';

export function OAuthCallback() {
  const navigate = useNavigate();
  const { dispatch } = useAppContext();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Extract code and state from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');

        if (!code) {
          throw new Error('Authorization code not found in callback URL');
        }

        // Retrieve stored PKCE parameters
        const storedState = sessionStorage.getItem('pkce_state');
        const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
        const aapBaseUrl = localStorage.getItem('aap_base_url');

        if (!codeVerifier) {
          throw new Error('PKCE code verifier not found. Please try logging in again.');
        }

        if (!aapBaseUrl) {
          throw new Error('AAP base URL not found. Please try logging in again.');
        }

        // Validate state (CSRF protection)
        if (state !== storedState) {
          throw new Error('Invalid state parameter. Possible CSRF attack detected.');
        }

        // Exchange code for token
        const result = await exchangeAuthCode(code, codeVerifier, aapBaseUrl);

        if (result.success) {
          // Update app context with session info
          dispatch({
            type: 'SET_AAP_SESSION',
            payload: {
              authenticated: true,
              aapBaseUrl,
              user: result.user || null,
              expiresAt: result.expiresAt || null,
            },
          });

          // Clean up session storage
          sessionStorage.removeItem('pkce_code_verifier');
          sessionStorage.removeItem('pkce_state');

          setStatus('success');

          // Redirect to home after brief delay
          setTimeout(() => {
            navigate('/');
          }, 1500);
        } else {
          throw new Error('Token exchange failed');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Authentication failed');
      }
    };

    processCallback();
  }, [dispatch, navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      {status === 'processing' && (
        <>
          <Spinner size="xl" />
          <h2 style={{ marginTop: '1rem' }}>Completing authentication...</h2>
          <p style={{ color: '#6a6e73', marginTop: '0.5rem' }}>
            Please wait while we securely exchange your authorization code for an access token.
          </p>
        </>
      )}

      {status === 'success' && (
        <>
          <Alert
            variant="success"
            title="Login Successful"
            isInline
            style={{ marginBottom: '1rem' }}
          >
            You have successfully authenticated with AAP. Redirecting to application...
          </Alert>
          <Spinner size="lg" />
        </>
      )}

      {status === 'error' && (
        <div style={{ maxWidth: '600px', width: '100%' }}>
          <Alert
            variant="danger"
            title="Authentication Failed"
            isInline
            style={{ marginBottom: '1rem' }}
          >
            {errorMessage}
          </Alert>
          <Button variant="primary" onClick={() => navigate('/')}>
            Return to Application
          </Button>
        </div>
      )}
    </div>
  );
}
