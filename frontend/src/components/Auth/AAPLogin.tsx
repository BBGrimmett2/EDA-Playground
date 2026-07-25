/**
 * AAP Login Component
 * Form for initiating OAuth login with AAP
 */

import { useState, useEffect } from 'react';
import {
  FormGroup,
  TextInput,
  Button,
  Alert,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { initiateOAuthFlow } from '../../services/aapAuth';

// Backend URL for API calls
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.MODE === 'production' ? '' : 'http://localhost:3001');

export function AAPLogin() {
  const [aapUrl, setAapUrl] = useState(import.meta.env.VITE_AAP_BASE_URL || '');
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  // Fetch AAP base URL from backend config (for Kubernetes deployments)
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/config`);
        const config = await response.json();
        if (config.aapBaseUrl && !aapUrl) {
          setAapUrl(config.aapBaseUrl);
        }
      } catch (err) {
        // Config endpoint not available or failed, ignore
        console.debug('Config fetch failed:', err);
      }
    };

    fetchConfig();
  }, []);

  // Validate URL format
  const isValidUrl = (url: string): boolean => {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  };

  const validated = aapUrl ? (isValidUrl(aapUrl) ? 'success' : 'error') : 'default';

  const handleLogin = async () => {
    if (!isValidUrl(aapUrl)) {
      setError('Please enter a valid AAP URL (e.g., https://aap.example.com)');
      return;
    }

    setError(null);
    setValidating(true);

    try {
      // Initiate OAuth flow - will redirect to AAP
      await initiateOAuthFlow(aapUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate login');
      setValidating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && validated === 'success') {
      e.preventDefault();
      handleLogin();
    }
  };

  return (
    <>
      {error && (
        <Alert
          variant="danger"
          title="Login Error"
          isInline
          style={{ marginBottom: '1rem' }}
        >
          {error}
        </Alert>
      )}

      <FormGroup
        label="AAP Instance URL"
        isRequired
        fieldId="aap-url"
      >
        <TextInput
          id="aap-url"
          type="url"
          value={aapUrl}
          onChange={(_event, value) => setAapUrl(value)}
          onKeyDown={handleKeyDown}
          placeholder="https://aap.example.com"
          validated={validated}
          isDisabled={validating}
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem variant={validated}>
              {validated === 'error'
                ? 'Please enter a valid HTTPS URL'
                : 'The base URL of your AAP instance'}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>

      <Button
        variant="primary"
        onClick={handleLogin}
        isDisabled={validated !== 'success' || validating}
        isLoading={validating}
        icon={<ExternalLinkAltIcon />}
        iconPosition="right"
        isBlock
        style={{ marginTop: '1.5rem' }}
      >
        {validating ? 'Redirecting...' : 'Login with AAP'}
      </Button>
    </>
  );
}
