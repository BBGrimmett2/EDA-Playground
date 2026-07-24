/**
 * Response Display Component
 */

import { Alert, FormGroup, DescriptionList, DescriptionListGroup, DescriptionListTerm, DescriptionListDescription } from '@patternfly/react-core';
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
  const { state } = useAppContext();

  if (state.error) {
    return (
      <Alert
        variant="danger"
        title="Request Failed"
        isInline
      >
        {state.error}
      </Alert>
    );
  }

  if (!state.response) {
    return null;
  }

  const { response } = state;
  const variant = response.success ? 'success' : 'warning';
  const title = response.success ? 'Success' : 'Request Completed with Errors';

  return (
    <>
      <Alert
        variant={variant}
        title={title}
        isInline
      >
        <DescriptionList isHorizontal isCompact>
          <DescriptionListGroup>
            <DescriptionListTerm>Status</DescriptionListTerm>
            <DescriptionListDescription>
              {response.statusCode} {response.statusText}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Duration</DescriptionListTerm>
            <DescriptionListDescription>
              {response.duration}ms
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
          }}
        />
      </FormGroup>
    </>
  );
}
