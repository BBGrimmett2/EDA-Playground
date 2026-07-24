/**
 * Application Layout - PatternFly Page structure with AAP-style dark header
 */

import {
  Page,
  PageSection,
  Masthead,
  MastheadMain,
  MastheadBrand,
} from '@patternfly/react-core';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const masthead = (
    <Masthead style={{
      backgroundColor: '#151515',
      borderBottom: '1px solid #292929'
    }}>
      <MastheadMain>
        <MastheadBrand>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.125rem'
          }}>
            <span style={{
              color: '#ffffff',
              fontSize: '1.125rem',
              fontWeight: 600,
              lineHeight: 1.2
            }}>
              Event-Driven Ansible
            </span>
            <span style={{
              color: '#c9c9c9',
              fontSize: '0.875rem',
              fontWeight: 400,
              lineHeight: 1.2
            }}>
              Development Tool
            </span>
          </div>
        </MastheadBrand>
      </MastheadMain>
    </Masthead>
  );

  return (
    <Page masthead={masthead}>
      <PageSection>
        {children}
      </PageSection>
    </Page>
  );
}
