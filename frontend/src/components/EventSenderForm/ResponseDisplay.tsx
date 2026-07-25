/**
 * Response Display Component
 */

import {
  Alert,
  AlertActionCloseButton,
  FormGroup,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Card,
  CardBody,
  Title,
} from '@patternfly/react-core';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import { useAppContext } from '../../context/AppContext';

/**
 * Format response body for display
 */
function formatResponseBody(data: any): string {
  // Handle empty responses
  if (data === null || data === undefined || data === '') {
    return '// Empty response - event was accepted by the webhook';
  }

  // Handle string responses
  if (typeof data === 'string') {
    // If it's already JSON string, try to parse and format it
    try {
      const parsed = JSON.parse(data);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // Not JSON, return as-is with comment
      return data.trim() || '// Empty response - event was accepted by the webhook';
    }
  }

  // Handle objects and arrays
  try {
    const formatted = JSON.stringify(data, null, 2);
    // Check if result is just empty object or array
    if (formatted === '{}' || formatted === '[]') {
      return '// Empty response - event was accepted by the webhook';
    }
    return formatted;
  } catch {
    return String(data);
  }
}

export function ResponseDisplay() {
  const { state, dispatch } = useAppContext();

  if (state.error) {
    return (
      <Card>
        <CardBody>
          <Alert
            variant="danger"
            title="Request Failed"
            isInline
            actionClose={
              <AlertActionCloseButton
                onClose={() => dispatch({ type: 'CLEAR_ERROR' })}
                aria-label="Close error alert"
              />
            }
          >
            {state.error}
          </Alert>
        </CardBody>
      </Card>
    );
  }

  if (!state.response) {
    return null;
  }

  const { response } = state;
  const variant = response.success ? 'success' : 'warning';
  const title = response.success ? 'Event Sent Successfully' : 'Request Completed with Errors';

  return (
    <Card>
      <CardBody>
        <Title headingLevel="h3" size="lg" style={{ marginBottom: 'var(--app-space-lg)' }}>
          Response
        </Title>

        <div className="app-stack app-stack--lg">
          <Alert
            variant={variant}
            title={title}
            isInline
            actionClose={
              <AlertActionCloseButton
                onClose={() => dispatch({ type: 'SEND_REQUEST_SUCCESS', payload: null as any })}
                aria-label="Close response alert"
              />
            }
          >
            <DescriptionList isHorizontal isCompact>
              <DescriptionListGroup>
                <DescriptionListTerm>Status</DescriptionListTerm>
                <DescriptionListDescription>
                  <strong>{response.statusCode}</strong> {response.statusText}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Duration</DescriptionListTerm>
                <DescriptionListDescription>
                  <strong>{response.duration}ms</strong>
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </Alert>

          <FormGroup label="Response Body" fieldId="response-body">
            <CodeEditor
              code={formatResponseBody(response.data)}
              language={Language.json}
              isReadOnly
              height="300px"
              options={{
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                readOnly: true,
              }}
              aria-label="Response body viewer"
            />
          </FormGroup>
        </div>
      </CardBody>
    </Card>
  );
}
