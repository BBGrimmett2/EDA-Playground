/**
 * Action Buttons Component
 */

import { Button, Flex, FlexItem } from '@patternfly/react-core';
import { useAppContext } from '../../context/AppContext';
import { sendEventToEDA } from '../../services/eventSender';

export function ActionButtons() {
  const { state, dispatch } = useAppContext();

  const canSend = state.selectedIntegration && state.payload && state.webhookUrl && !state.sending;

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
    dispatch({ type: 'RESET_FORM' });
  };

  return (
    <Flex spaceItems={{ default: 'spaceItemsMd' }}>
      <FlexItem>
        <Button
          variant="primary"
          onClick={handleSend}
          isDisabled={!canSend}
          isLoading={state.sending}
        >
          {state.sending ? 'Sending...' : 'Send Event'}
        </Button>
      </FlexItem>
      <FlexItem>
        <Button
          variant="secondary"
          onClick={handleReset}
          isDisabled={state.sending}
        >
          Reset
        </Button>
      </FlexItem>
    </Flex>
  );
}
