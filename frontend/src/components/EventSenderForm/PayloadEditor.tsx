/**
 * Payload Editor Component - Monaco-based JSON editor
 */

import { useState } from 'react';
import { FormGroup, FormHelperText, HelperText, HelperTextItem, Alert, Button, Flex, FlexItem } from '@patternfly/react-core';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import { useAppContext } from '../../context/AppContext';

export function PayloadEditor() {
  const { state, dispatch } = useAppContext();
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleEditorChange = (value: string) => {
    dispatch({ type: 'UPDATE_PAYLOAD', payload: value });

    // Validate JSON syntax
    try {
      JSON.parse(value);
      setValidationError(null);
    } catch (e) {
      if (e instanceof Error) {
        setValidationError(e.message);
      }
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(state.payload);
      const formatted = JSON.stringify(parsed, null, 2);
      dispatch({ type: 'UPDATE_PAYLOAD', payload: formatted });
      setValidationError(null);
    } catch {
      // Already showing validation error
    }
  };

  return (
    <FormGroup
      label="Event Payload"
      isRequired
      fieldId="payload-editor"
    >
      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
        <FlexItem>
          <Button
            variant="secondary"
            onClick={handleFormat}
            isDisabled={!state.payload || !!validationError}
            size="sm"
          >
            Format JSON
          </Button>
        </FlexItem>
        <FlexItem>
          <CodeEditor
            code={state.payload}
            onChange={handleEditorChange}
            language={Language.json}
            height="500px"
            width="100%"
            options={{
              minimap: { enabled: false },
              lineNumbers: 'on',
              formatOnPaste: true,
              formatOnType: true,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
            }}
          />
        </FlexItem>
        {validationError && (
          <FlexItem>
            <Alert
              variant="danger"
              title="Invalid JSON"
              isInline
              isPlain
            >
              {validationError}
            </Alert>
          </FlexItem>
        )}
      </Flex>
      <FormHelperText>
        <HelperText>
          <HelperTextItem>Edit the JSON payload to customize the event data</HelperTextItem>
        </HelperText>
      </FormHelperText>
    </FormGroup>
  );
}
