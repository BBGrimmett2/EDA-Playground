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
} from '@patternfly/react-core';
import { useAppContext } from '../../context/AppContext';
import { fetchIntegrations } from '../../services/api';
import { IntegrationSelector } from './IntegrationSelector';
import { PayloadEditor } from './PayloadEditor';
import { ConnectionForm } from './ConnectionForm';
import { ActionButtons } from './ActionButtons';
import { ResponseDisplay } from './ResponseDisplay';

export function EventSenderForm() {
  const { state, dispatch } = useAppContext();

  useEffect(() => {
    async function loadIntegrations() {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const integrations = await fetchIntegrations();
        dispatch({ type: 'SET_INTEGRATIONS', payload: integrations });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load integrations';
        dispatch({ type: 'SEND_REQUEST_FAILURE', payload: errorMessage });
      }
    }

    loadIntegrations();
  }, [dispatch]);

  if (state.loading) {
    return (
      <PageSection>
        <div style={{ textAlign: 'center', padding: 'var(--app-space-2xl)' }}>
          <Spinner size="xl" />
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
        <Alert variant="danger" title="Failed to load integrations" isInline>
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
            <IntegrationSelector />

            {state.selectedIntegration && (
              <>
                <PayloadEditor />
                <ConnectionForm />
                <ActionButtons />
                <ResponseDisplay />
              </>
            )}
          </div>
        </Form>
      </div>
    </PageSection>
  );
}
