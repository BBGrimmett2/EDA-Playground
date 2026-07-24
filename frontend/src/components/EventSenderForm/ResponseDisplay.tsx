/**
 * Response Display Component
 */

import { Alert, FormGroup, DescriptionList, DescriptionListGroup, DescriptionListTerm, DescriptionListDescription } from '@patternfly/react-core';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import { useAppContext } from '../../context/AppContext';

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
          code={JSON.stringify(response.data, null, 2)}
          language={Language.json}
          isReadOnly
          height="300px"
          options={{
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
          }}
        />
      </FormGroup>
    </>
  );
}
