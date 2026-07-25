/**
 * Connection Form Component - URL and authentication inputs
 */

import { useState } from 'react';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextInput,
  InputGroup,
  InputGroupItem,
} from '@patternfly/react-core';
import { ExclamationCircleIcon, CheckCircleIcon } from '@patternfly/react-icons';
import { useAppContext } from '../../context/AppContext';

function isValidUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function ConnectionForm() {
  const { state, dispatch } = useAppContext();
  const [urlTouched, setUrlTouched] = useState(false);

  const urlValid = isValidUrl(state.webhookUrl);
  const showUrlValidation = urlTouched && state.webhookUrl.length > 0;
  const urlValidated = showUrlValidation ? (urlValid ? 'success' : 'error') : 'default';

  return (
    <div className="app-stack app-stack--lg">
      <FormGroup
        label="Event Stream URL"
        isRequired
        fieldId="webhook-url"
      >
        <InputGroup>
          <InputGroupItem isFill>
            <TextInput
              isRequired
              type="url"
              id="webhook-url"
              name="webhook-url"
              value={state.webhookUrl}
              onChange={(_event, value) => dispatch({ type: 'UPDATE_URL', payload: value })}
              onBlur={() => setUrlTouched(true)}
              placeholder="https://aap.example.com/api/eda/v1/external_event_stream/<uuid>/post/"
              validated={urlValidated}
              aria-label="Event stream webhook URL"
            />
          </InputGroupItem>
          {showUrlValidation && (
            <InputGroupItem>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 var(--app-space-md)',
                color: urlValid
                  ? 'var(--pf-v6-global--success-color--100)'
                  : 'var(--pf-v6-global--danger-color--100)'
              }}>
                {urlValid ? <CheckCircleIcon /> : <ExclamationCircleIcon />}
              </span>
            </InputGroupItem>
          )}
        </InputGroup>
        <FormHelperText>
          <HelperText>
            <HelperTextItem variant={urlValidated === 'error' ? 'error' : 'default'}>
              {urlValidated === 'error'
                ? 'Please enter a valid HTTP or HTTPS URL'
                : 'EDA external event stream webhook endpoint URL'}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>

      <FormGroup
        label="Authentication Token"
        fieldId="auth-token"
      >
        <TextInput
          type="password"
          id="auth-token"
          name="auth-token"
          value={state.authToken}
          onChange={(_event, value) => dispatch({ type: 'UPDATE_AUTH_TOKEN', payload: value })}
          placeholder="Enter your authentication token..."
          aria-label="Authentication bearer token"
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem>Bearer token for authenticating with the event stream (optional)</HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>
    </div>
  );
}
