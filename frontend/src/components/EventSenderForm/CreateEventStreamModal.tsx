/**
 * Create Event Stream Modal
 * Modal form for creating new AAP event streams
 */

import { useState, useEffect } from 'react';
import {
  Modal,
  ModalVariant,
  ModalBody,
  Button,
  Form,
  FormGroup,
  TextInput,
  Checkbox,
  InputGroup,
  InputGroupItem,
  InputGroupText,
  Alert,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Select,
  SelectList,
  SelectOption,
  MenuToggle,
  Spinner,
} from '@patternfly/react-core';
import type { MenuToggleElement } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { useAppContext } from '../../context/AppContext';
import { fetchOrganizations, createEventStream } from '../../services/aapApi';
import type { AAPOrganization } from '../../types/integration';

interface CreateEventStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateEventStreamModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateEventStreamModalProps) {
  const { state, dispatch } = useAppContext();
  const { creatingEventStream } = state;

  // Form fields
  const [nameSuffix, setNameSuffix] = useState('');
  const [testMode, setTestMode] = useState(true);
  const [token, setToken] = useState('playground');
  const [selectedOrganization, setSelectedOrganization] = useState<AAPOrganization | null>(null);

  // Organizations
  const [organizations, setOrganizations] = useState<AAPOrganization[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);
  const [organizationsError, setOrganizationsError] = useState<string | null>(null);
  const [orgSelectOpen, setOrgSelectOpen] = useState(false);

  // Validation
  const [nameTouched, setNameTouched] = useState(false);
  const [tokenTouched, setTokenTouched] = useState(false);

  // Error handling
  const [error, setError] = useState<string | null>(null);
  const [aapLink, setAapLink] = useState<string | null>(null);

  // Success handling
  const [tokenCopied, setTokenCopied] = useState(false);

  // Fetch organizations on modal open
  useEffect(() => {
    if (isOpen && organizations.length === 0) {
      loadOrganizations();
    }
  }, [isOpen]);

  const loadOrganizations = async () => {
    setLoadingOrganizations(true);
    setOrganizationsError(null);

    try {
      const orgs = await fetchOrganizations();
      setOrganizations(orgs);

      // Auto-select if only one organization
      if (orgs.length === 1) {
        setSelectedOrganization(orgs[0]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch organizations';
      setOrganizationsError(message);
    } finally {
      setLoadingOrganizations(false);
    }
  };

  const generateToken = () => {
    const array = new Uint8Array(24);
    crypto.getRandomValues(array);
    const generatedToken = Array.from(array, (byte) =>
      byte.toString(16).padStart(2, '0')
    ).join('');
    setToken(generatedToken);
  };

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy token:', err);
    }
  };

  const handleCreate = async () => {
    setError(null);
    setAapLink(null);

    // Validate
    if (!nameSuffix.trim()) {
      setError('Name is required');
      setNameTouched(true);
      return;
    }

    if (!token.trim()) {
      setError('Token is required');
      setTokenTouched(true);
      return;
    }

    if (!selectedOrganization) {
      setError('Organization is required');
      return;
    }

    const fullName = `EDA Playground - ${nameSuffix}`;

    dispatch({ type: 'CREATE_EVENT_STREAM_START' });

    try {
      const newStream = await createEventStream(
        fullName,
        testMode,
        token,
        selectedOrganization.id
      );

      dispatch({ type: 'CREATE_EVENT_STREAM_SUCCESS', payload: newStream });

      // Show success notification (using browser notification or toast)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Event Stream Created', {
          body: `Event stream "${fullName}" created successfully`,
        });
      }

      // Call success callback and close modal
      onSuccess();
      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create event stream';

      // Check if error contains AAP link (for duplicate)
      try {
        const errorData = JSON.parse(message);
        setError(errorData.message);
        if (errorData.aapLink) {
          setAapLink(errorData.aapLink);
        }
      } catch {
        setError(message);
      }

      dispatch({ type: 'CREATE_EVENT_STREAM_FAILURE', payload: message });
    }
  };

  const handleClose = () => {
    // Reset form
    setNameSuffix('');
    setTestMode(true);
    setToken('playground');
    setSelectedOrganization(null);
    setNameTouched(false);
    setTokenTouched(false);
    setError(null);
    setAapLink(null);
    setTokenCopied(false);
    onClose();
  };

  const isValid =
    nameSuffix.trim() !== '' &&
    token.trim() !== '' &&
    selectedOrganization !== null &&
    !loadingOrganizations &&
    !organizationsError;

  const nameValidation = nameTouched && !nameSuffix.trim() ? 'error' : 'default';
  const tokenValidation = tokenTouched && !token.trim() ? 'error' : 'default';

  const orgToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setOrgSelectOpen(!orgSelectOpen)}
      isExpanded={orgSelectOpen}
      isFullWidth
      isDisabled={loadingOrganizations || !!organizationsError}
    >
      {selectedOrganization?.name || 'Select an organization...'}
    </MenuToggle>
  );

  return (
    <Modal
      variant={ModalVariant.medium}
      title="Create Event Stream"
      isOpen={isOpen}
      onClose={handleClose}
    >
      <ModalBody>
        <Form>
        {error && (
          <Alert
            variant="danger"
            title="Failed to create event stream"
            isInline
            style={{ marginBottom: 'var(--pf-v6-global--spacer--md)' }}
          >
            <p>{error}</p>
            {aapLink && (
              <Button
                variant="link"
                isInline
                component="a"
                href={aapLink}
                target="_blank"
                icon={<ExternalLinkAltIcon />}
              >
                View in AAP
              </Button>
            )}
          </Alert>
        )}

        {organizationsError && (
          <Alert
            variant="warning"
            title="Unable to load organizations"
            isInline
            style={{ marginBottom: 'var(--pf-v6-global--spacer--md)' }}
          >
            {organizationsError}
          </Alert>
        )}

        <FormGroup label="Name" isRequired fieldId="stream-name">
          <InputGroup>
            <InputGroupItem>
              <InputGroupText>EDA Playground -</InputGroupText>
            </InputGroupItem>
            <InputGroupItem isFill>
              <TextInput
                isRequired
                id="stream-name"
                value={nameSuffix}
                onChange={(_event, value) => setNameSuffix(value)}
                onBlur={() => setNameTouched(true)}
                validated={nameValidation}
                placeholder="My Test Stream"
              />
            </InputGroupItem>
          </InputGroup>
          <FormHelperText>
            <HelperText>
              <HelperTextItem variant={nameValidation}>
                {nameValidation === 'error'
                  ? 'Name is required'
                  : 'Enter a unique name for your event stream'}
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        </FormGroup>

        <FormGroup label="Organization" isRequired fieldId="organization">
          {loadingOrganizations ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Spinner size="md" />
              <span>Loading organizations...</span>
            </div>
          ) : (
            <>
              <Select
                id="organization"
                isOpen={orgSelectOpen}
                selected={selectedOrganization?.name}
                onSelect={(_event, selection) => {
                  const org = organizations.find((o) => o.name === selection);
                  if (org) {
                    setSelectedOrganization(org);
                  }
                  setOrgSelectOpen(false);
                }}
                onOpenChange={(nextOpen) => setOrgSelectOpen(nextOpen)}
                toggle={orgToggle}
              >
                <SelectList>
                  {organizations.map((org) => (
                    <SelectOption
                      key={org.id}
                      value={org.name}
                      description={org.description}
                    >
                      {org.name}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>
                    {selectedOrganization
                      ? `Selected: ${selectedOrganization.name}`
                      : `Choose from ${organizations.length} organization${
                          organizations.length !== 1 ? 's' : ''
                        }`}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            </>
          )}
        </FormGroup>

        <FormGroup label="Test Mode" fieldId="test-mode">
          <Checkbox
            id="test-mode"
            label="Enable test mode (recommended for development)"
            isChecked={testMode}
            onChange={(_event, checked) => setTestMode(checked)}
          />
          <FormHelperText>
            <HelperText>
              <HelperTextItem>
                Test mode allows you to safely test events without affecting production systems
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        </FormGroup>

        <FormGroup label="Auth Token" isRequired fieldId="token">
          <InputGroup>
            <InputGroupItem isFill>
              <TextInput
                isRequired
                id="token"
                value={token}
                onChange={(_event, value) => setToken(value)}
                onBlur={() => setTokenTouched(true)}
                validated={tokenValidation}
                placeholder="Enter token or generate one"
              />
            </InputGroupItem>
            <InputGroupItem>
              <Button variant="secondary" onClick={generateToken}>
                Generate
              </Button>
            </InputGroupItem>
            <InputGroupItem>
              <Button variant="secondary" onClick={copyToken}>
                {tokenCopied ? 'Copied!' : 'Copy'}
              </Button>
            </InputGroupItem>
          </InputGroup>
          <FormHelperText>
            <HelperText>
              <HelperTextItem variant={tokenValidation}>
                {tokenValidation === 'error'
                  ? 'Token is required'
                  : 'This token will be used to authenticate webhook requests'}
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        </FormGroup>

        <div style={{ marginTop: 'var(--pf-v6-global--spacer--lg)', display: 'flex', gap: 'var(--pf-v6-global--spacer--sm)' }}>
          <Button
            variant="primary"
            onClick={handleCreate}
            isLoading={creatingEventStream}
            isDisabled={!isValid || creatingEventStream}
          >
            Create
          </Button>
          <Button
            variant="link"
            onClick={handleClose}
            isDisabled={creatingEventStream}
          >
            Cancel
          </Button>
        </div>
      </Form>
      </ModalBody>
    </Modal>
  );
}
