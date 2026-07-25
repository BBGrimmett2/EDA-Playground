/**
 * Integration Selector Component
 * Provides categorized dropdown for selecting event source integrations
 */

import { useState } from 'react';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  SelectGroup,
} from '@patternfly/react-core';
import type { MenuToggleElement } from '@patternfly/react-core';
import { useAppContext } from '../../context/AppContext';
import type { Integration } from '../../types/integration';

export function IntegrationSelector() {
  const { state, dispatch } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  // Group integrations by category
  const groupedIntegrations = state.integrations.reduce((groups, integration) => {
    const category = integration.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(integration);
    return groups;
  }, {} as Record<string, Integration[]>);

  const onSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, selection: string | number | undefined) => {
    if (typeof selection === 'string') {
      const integration = state.integrations.find(i => i.id === selection);
      if (integration) {
        dispatch({ type: 'SELECT_INTEGRATION', payload: integration });
      }
    }
    setIsOpen(false);
  };

  // Category display labels with proper ordering
  const categoryLabels: Record<string, string> = {
    generic: 'Generic',
    monitoring: 'Monitoring',
    ticketing: 'Ticketing',
    scm: 'Source Control',
    messaging: 'Messaging',
    security: 'Security',
  };

  // Sort categories for consistent display
  const categoryOrder = ['generic', 'monitoring', 'ticketing', 'scm', 'messaging', 'security'];
  const sortedCategories = Object.entries(groupedIntegrations).sort(([a], [b]) => {
    return categoryOrder.indexOf(a) - categoryOrder.indexOf(b);
  });

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
      isFullWidth
      aria-label="Integration selector toggle"
    >
      {state.selectedIntegration?.name || 'Select an integration...'}
    </MenuToggle>
  );

  return (
    <FormGroup
      label="Integration"
      isRequired
      fieldId="integration-selector"
      style={{ marginBottom: 'var(--pf-v6-global--spacer--lg)' }}
    >
      <Select
        id="integration-selector"
        isOpen={isOpen}
        selected={state.selectedIntegration?.id}
        onSelect={onSelect}
        onOpenChange={(nextOpen) => setIsOpen(nextOpen)}
        toggle={toggle}
        shouldFocusToggleOnSelect
        aria-label="Select an integration"
      >
        <SelectList>
          {sortedCategories.map(([category, integrations]) => (
            <SelectGroup
              key={category}
              label={categoryLabels[category] || category}
            >
              {integrations.map(integration => (
                <SelectOption
                  key={integration.id}
                  value={integration.id}
                  description={integration.description}
                >
                  {integration.name}
                </SelectOption>
              ))}
            </SelectGroup>
          ))}
        </SelectList>
      </Select>
      {!isOpen && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              Select an event source integration to load its example payload
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
}
