/**
 * Event Sender Form - Main orchestrator component
 */

import { useEffect } from 'react';
import {
  Form,
  Spinner,
  Alert,
  PageSection,
  Title,
  Card,
  CardBody,
  EmptyState,
  EmptyStateBody,
  AlertActionCloseButton,
} from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';
import { useAppContext } from '../../context/AppContext';
import { fetchIntegrations } from '../../services/api';
import { checkAuthStatus } from '../../services/aapAuth';
import { IntegrationSelector } from './IntegrationSelector';
import { PayloadEditor } from './PayloadEditor';
import { ConnectionForm } from './ConnectionForm';
import { ActionButtons } from './ActionButtons';
import { ResponseDisplay } from './ResponseDisplay';

export function EventSenderForm() {
  const { state, dispatch } = useAppContext();

  useEffect(() => {
    async function initializeApp() {
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        // Load integrations
        const integrations = await fetchIntegrations();
        dispatch({ type: 'SET_INTEGRATIONS', payload: integrations });

        // Check AAP authentication status (if session cookie exists)
        const authStatus = await checkAuthStatus();
        if (authStatus.authenticated) {
          dispatch({ type: 'SET_AAP_SESSION', payload: authStatus });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load integrations';
        dispatch({ type: 'SEND_REQUEST_FAILURE', payload: errorMessage });
      }
    }

    initializeApp();
  }, [dispatch]);

  if (state.loading) {
    return (
      <PageSection>
        <div style={{ textAlign: 'center', padding: 'var(--app-space-2xl)' }}>
          <Spinner size="xl" aria-label="Loading integrations" />
          <div style={{ marginTop: 'var(--app-space-md)' }}>
            <Title headingLevel="h2" size="lg">Loading integrations...</Title>
          </div>
        </div>
      </PageSection>
    );
  }

  if (state.error && state.integrations.length === 0) {
    return (
      <PageSection>
        <Alert
          variant="danger"
          title="Failed to load integrations"
          isInline
          actionClose={<AlertActionCloseButton onClose={() => dispatch({ type: 'CLEAR_ERROR' })} />}
        >
          {state.error}
        </Alert>
      </PageSection>
    );
  }

  return (
    <PageSection style={{ padding: 'var(--app-space-xl)' }}>
      <div className="app-content" style={{ width: '100%', maxWidth: '1400px' }}>
        <div style={{ marginBottom: 'var(--app-space-xl)' }}>
          <Title headingLevel="h1" size="2xl" style={{
            color: 'var(--pf-v6-global--Color--100)',
            fontWeight: 600
          }}>
            Event Source Integration Tester
          </Title>
          <p style={{
            marginTop: 'var(--app-space-sm)',
            color: 'var(--pf-v6-global--Color--100)',
            fontSize: '1rem',
            lineHeight: 1.5
          }}>
            Test event-driven Ansible integrations by selecting a source and sending sample events
          </p>
        </div>

        <Form style={{ width: '100%' }}>
          <div className="app-stack app-stack--lg">
            {/* Integration Selection Card */}
            <Card>
              <CardBody>
                <IntegrationSelector />
              </CardBody>
            </Card>

            {state.selectedIntegration ? (
              <>
                {/* Payload Editor Card */}
                <Card>
                  <CardBody>
                    <PayloadEditor />
                  </CardBody>
                </Card>

                {/* Connection Configuration Card */}
                <Card>
                  <CardBody>
                    <Title headingLevel="h3" size="lg" style={{ marginBottom: 'var(--app-space-lg)' }}>
                      Connection Configuration
                    </Title>
                    <ConnectionForm />
                  </CardBody>
                </Card>

                {/* Action Buttons */}
                <ActionButtons />

                {/* Response Display */}
                <ResponseDisplay />
              </>
            ) : (
              /* Empty State when no integration selected */
              <Card>
                <CardBody>
                  <EmptyState variant="full">
                    <CubesIcon style={{ fontSize: '4rem', color: 'var(--pf-v6-global--Color--200)', marginBottom: 'var(--app-space-md)' }} />
                    <Title headingLevel="h2" size="lg">
                      Select an integration to begin
                    </Title>
                    <EmptyStateBody>
                      Choose an event source integration from the dropdown above to load its example payload
                      and start testing your Event-Driven Ansible webhook endpoint.
                    </EmptyStateBody>
                  </EmptyState>
                </CardBody>
              </Card>
            )}
          </div>
        </Form>
      </div>
    </PageSection>
  );
}
