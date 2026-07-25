/**
 * Payload Editor Component - Monaco-based JSON editor
 */

import { useState } from 'react';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Alert,
  Button,
  Flex,
  FlexItem,
  Title,
} from '@patternfly/react-core';
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
    <>
      <Title headingLevel="h3" size="lg" style={{ marginBottom: 'var(--app-space-lg)' }}>
        Event Payload
      </Title>
      <FormGroup
        isRequired
        fieldId="payload-editor"
      >
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
          <FlexItem>
            <Flex spaceItems={{ default: 'spaceItemsSm' }}>
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
            </Flex>
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
                tabSize: 2,
              }}
              aria-label="JSON payload editor"
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
            <HelperTextItem>
              {validationError
                ? 'Fix the JSON syntax errors above before sending'
                : 'Edit the JSON payload to customize the event data for your test'}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>
    </>
  );
}
