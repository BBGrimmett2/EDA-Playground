/**
 * Action Buttons Component
 */

import {
  Button,
  Flex,
  FlexItem,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import { PaperPlaneIcon, UndoIcon } from '@patternfly/react-icons';
import { useAppContext } from '../../context/AppContext';
import { sendEventToEDA } from '../../services/eventSender';

export function ActionButtons() {
  const { state, dispatch } = useAppContext();

  // Validate JSON before allowing send
  let jsonValid = false;
  try {
    if (state.payload) {
      JSON.parse(state.payload);
      jsonValid = true;
    }
  } catch {
    jsonValid = false;
  }

  const canSend = state.selectedIntegration && state.payload && state.webhookUrl && jsonValid && !state.sending;

  // Generate helpful message when button is disabled
  const getDisabledReason = (): string | null => {
    if (state.sending) return 'Sending in progress...';
    if (!state.selectedIntegration) return 'Select an integration first';
    if (!state.payload) return 'Payload is required';
    if (!jsonValid) return 'Fix JSON syntax errors';
    if (!state.webhookUrl) return 'Enter event stream URL';
    return null;
  };

  const handleSend = async () => {
    if (!canSend) return;

    try {
      // Validate JSON
      const payload = JSON.parse(state.payload);

      dispatch({ type: 'SEND_REQUEST_START' });

      const response = await sendEventToEDA(
        state.webhookUrl,
        payload,
        state.authToken,
        state.authType
      );

      dispatch({ type: 'SEND_REQUEST_SUCCESS', payload: response });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch({ type: 'SEND_REQUEST_FAILURE', payload: errorMessage });
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the form? This will clear your current configuration.')) {
      dispatch({ type: 'RESET_FORM' });
    }
  };

  const disabledReason = getDisabledReason();

  return (
    <div style={{
      padding: 'var(--app-space-lg)',
      backgroundColor: 'var(--pf-v6-global--BackgroundColor--200)',
      borderRadius: 'var(--pf-v6-global--BorderRadius--sm)',
    }}>
      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
        <FlexItem>
          <Flex spaceItems={{ default: 'spaceItemsMd' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
              <Button
                variant="primary"
                onClick={handleSend}
                isDisabled={!canSend}
                isLoading={state.sending}
                size="lg"
                icon={<PaperPlaneIcon />}
                aria-label="Send event to webhook"
              >
                {state.sending ? 'Sending Event...' : 'Send Event'}
              </Button>
            </FlexItem>
            <FlexItem>
              <Button
                variant="link"
                onClick={handleReset}
                isDisabled={state.sending}
                icon={<UndoIcon />}
                isDanger
                aria-label="Reset form"
              >
                Reset Form
              </Button>
            </FlexItem>
          </Flex>
        </FlexItem>
        {disabledReason && (
          <FlexItem>
            <HelperText>
              <HelperTextItem variant="indeterminate">
                {disabledReason}
              </HelperTextItem>
            </HelperText>
          </FlexItem>
        )}
      </Flex>
    </div>
  );
}
