/**
 * Connection Form Component - URL and authentication inputs
 * Supports both manual entry and AAP OAuth integration
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
  Divider,
  Button,
} from '@patternfly/react-core';
import { ExclamationCircleIcon, CheckCircleIcon } from '@patternfly/react-icons';
import { useAppContext } from '../../context/AppContext';
import { EventStreamSelector } from './EventStreamSelector';

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
  const [showManualEntry, setShowManualEntry] = useState(false);

  const { aapSession } = state;
  const urlValid = isValidUrl(state.webhookUrl);
  const showUrlValidation = urlTouched && state.webhookUrl.length > 0;
  const urlValidated = showUrlValidation ? (urlValid ? 'success' : 'error') : 'default';

  return (
    <div className="app-stack app-stack--lg">
      {/* AAP OAuth Section */}
      {aapSession.authenticated && !showManualEntry ? (
        <>
          <EventStreamSelector />

          {state.selectedEventStream && (
            <FormGroup
              label="Event Stream URL"
              fieldId="event-stream-url-display"
            >
              <TextInput
                id="event-stream-url-display"
                value={state.webhookUrl}
                readOnly
                aria-label="Selected event stream URL"
              />
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>
                    Events will be sent to this URL
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            </FormGroup>
          )}

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
              placeholder="playground"
              aria-label="Authentication bearer token"
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem>
                  Token for authenticating with the event stream (defaults to "playground")
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>

          <Button
            variant="link"
            onClick={() => setShowManualEntry(true)}
            style={{ padding: 0 }}
          >
            Use manual URL entry instead
          </Button>
        </>
      ) : (
        <>
          {/* Manual URL Entry */}
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

      {/* Return to AAP mode button (if authenticated but in manual mode) */}
      {aapSession.authenticated && showManualEntry && (
        <>
          <Divider style={{ margin: '1.5rem 0' }} />
          <Button
            variant="link"
            onClick={() => setShowManualEntry(false)}
            style={{ padding: 0 }}
          >
            Return to AAP event stream selection
          </Button>
        </>
      )}
        </>
      )}
    </div>
  );
}
