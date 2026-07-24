/**
 * Connection Form Component - URL and authentication inputs
 */

import { FormGroup, FormHelperText, HelperText, HelperTextItem, TextInput } from '@patternfly/react-core';
import { useAppContext } from '../../context/AppContext';

export function ConnectionForm() {
  const { state, dispatch } = useAppContext();

  return (
    <>
      <FormGroup
        label="Event Stream URL"
        isRequired
        fieldId="webhook-url"
      >
        <TextInput
          isRequired
          type="url"
          id="webhook-url"
          name="webhook-url"
          value={state.webhookUrl}
          onChange={(_event, value) => dispatch({ type: 'UPDATE_URL', payload: value })}
          placeholder="https://aap.example.com/eda-event-streams/api/eda/v1/external_event_stream/<uuid>/post/"
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem>EDA external event stream webhook endpoint URL</HelperTextItem>
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
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem>Bearer token for authenticating with the event stream (optional)</HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>
    </>
  );
}
