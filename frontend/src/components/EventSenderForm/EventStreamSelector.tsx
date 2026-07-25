/**
 * Event Stream Selector Component
 * Dropdown to select AAP event streams (filtered by "EDA-Playground" prefix)
 */

import { useState, useEffect } from 'react';
import {
  FormGroup,
  Select,
  SelectList,
  SelectOption,
  MenuToggle,
  Spinner,
  Alert,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Button,
} from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';
import type { MenuToggleElement } from '@patternfly/react-core';
import { useAppContext } from '../../context/AppContext';
import { fetchEventStreams } from '../../services/aapApi';
import type { AAPEventStream } from '../../types/integration';

export function EventStreamSelector() {
  const { state, dispatch } = useAppContext();
  const { aapSession, eventStreams, selectedEventStream, loadingEventStreams } = state;

  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch event streams on mount
  useEffect(() => {
    if (aapSession.authenticated && aapSession.aapBaseUrl && eventStreams.length === 0) {
      loadStreams();
    }
  }, [aapSession.authenticated, aapSession.aapBaseUrl]);

  const loadStreams = async () => {
    if (!aapSession.aapBaseUrl) return;

    setError(null);
    dispatch({ type: 'LOADING_EVENT_STREAMS', payload: true });

    try {
      const streams = await fetchEventStreams(aapSession.aapBaseUrl);
      dispatch({ type: 'SET_EVENT_STREAMS', payload: streams });

      if (streams.length === 0) {
        setError('No event streams with "EDA-Playground" prefix found. Create one in AAP to get started.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch event streams';
      setError(message);
      dispatch({ type: 'LOADING_EVENT_STREAMS', payload: false });

      // If session expired, clear AAP session
      if (message.includes('expired')) {
        dispatch({ type: 'CLEAR_AAP_SESSION' });
      }
    }
  };

  const onSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, selection: string | number | undefined) => {
    if (typeof selection === 'string') {
      const stream = eventStreams.find((s) => s.name === selection);
      if (stream) {
        dispatch({ type: 'SELECT_EVENT_STREAM', payload: stream });
      }
    }
    setIsOpen(false);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
      isFullWidth
      aria-label="Event stream selector toggle"
    >
      {selectedEventStream?.name || 'Select an event stream...'}
    </MenuToggle>
  );

  if (loadingEventStreams) {
    return (
      <FormGroup label="Event Stream" isRequired fieldId="event-stream-selector">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Spinner size="md" />
          <span>Loading event streams from {aapSession.aapBaseUrl}...</span>
        </div>
      </FormGroup>
    );
  }

  if (error) {
    return (
      <FormGroup label="Event Stream" isRequired fieldId="event-stream-selector">
        <Alert variant="warning" title="Unable to load event streams" isInline>
          {error}
        </Alert>
      </FormGroup>
    );
  }

  return (
    <FormGroup
      label="Event Stream"
      labelIcon={
        <Button
          variant="plain"
          onClick={loadStreams}
          icon={<SyncAltIcon />}
          aria-label="Refresh event streams"
          isDisabled={loadingEventStreams}
        />
      }
      isRequired
      fieldId="event-stream-selector"
    >
      <Select
        id="event-stream-selector"
        isOpen={isOpen}
        selected={selectedEventStream?.name}
        onSelect={onSelect}
        onOpenChange={(nextOpen) => setIsOpen(nextOpen)}
        toggle={toggle}
        shouldFocusToggleOnSelect
        aria-label="Select an event stream"
      >
        <SelectList>
          {eventStreams.map((stream: AAPEventStream) => (
            <SelectOption
              key={stream.id}
              value={stream.name}
              description={stream.description || `ID: ${stream.id}`}
            >
              {stream.name}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
      <FormHelperText>
        <HelperText>
          <HelperTextItem>
            {selectedEventStream
              ? `URL: ${selectedEventStream.url}`
              : `Choose from ${eventStreams.length} available event stream${eventStreams.length !== 1 ? 's' : ''}`}
          </HelperTextItem>
        </HelperText>
      </FormHelperText>
    </FormGroup>
  );
}
