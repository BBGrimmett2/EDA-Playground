/**
 * Application Layout - PatternFly Page structure with AAP-style dark header
 */

import { useState } from 'react';
import {
  Page,
  PageSection,
  Masthead,
  MastheadMain,
  MastheadBrand,
  MastheadContent,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  Button,
  Divider,
  Modal,
  ModalVariant,
  ModalBody,
} from '@patternfly/react-core';
import { UserIcon } from '@patternfly/react-icons';
import { useAppContext } from '../../context/AppContext';
import { logout } from '../../services/aapAuth';
import { AAPLogin } from '../Auth/AAPLogin';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { state, dispatch } = useAppContext();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      dispatch({ type: 'CLEAR_AAP_SESSION' });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Extract hostname from AAP URL for cleaner display
  const getAAPHostname = (url: string | null): string => {
    if (!url) return '';
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

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
            gap: '0.125rem',
            padding: 'var(--app-space-xs) 0'
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
              Playground
            </span>
          </div>
        </MastheadBrand>
      </MastheadMain>

      {/* Toolbar - Login button or User Profile */}
      <MastheadContent>
        <Toolbar isFullHeight>
          <ToolbarContent>
            <ToolbarItem style={{ marginLeft: 'auto' }}>
              {state.aapSession.authenticated ? (
                <Dropdown
                  isOpen={isUserMenuOpen}
                  onOpenChange={(isOpen) => setIsUserMenuOpen(isOpen)}
                  toggle={(toggleRef) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      icon={<UserIcon />}
                    >
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '2px',
                        marginRight: '8px'
                      }}>
                        <span style={{
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          lineHeight: 1.2,
                          color: '#151515'
                        }}>
                          {state.aapSession.user?.username || 'User'}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#3c3f42',
                          fontWeight: 500,
                          lineHeight: 1.2
                        }}>
                          {getAAPHostname(state.aapSession.aapBaseUrl)}
                        </span>
                      </div>
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem isDisabled style={{ fontSize: '0.875rem', color: '#6a6e73' }}>
                      <div style={{ padding: '0.5rem 0' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem', color: '#151515' }}>
                          {state.aapSession.user?.username || 'User'}
                        </div>
                        {state.aapSession.user?.email && (
                          <div style={{ fontSize: '0.85rem', color: '#151515', marginBottom: '0.5rem', opacity: 0.8 }}>
                            {state.aapSession.user.email}
                          </div>
                        )}
                        <div style={{ fontSize: '0.85rem', color: '#151515', marginTop: '0.75rem', fontWeight: 500 }}>
                          Connected to:
                        </div>
                        <a
                          href={state.aapSession.aapBaseUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '0.85rem',
                            color: '#06c',
                            textDecoration: 'none',
                            wordBreak: 'break-all',
                            display: 'inline-block',
                            fontWeight: 500
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                        >
                          {getAAPHostname(state.aapSession.aapBaseUrl)}
                        </a>
                      </div>
                    </DropdownItem>
                    <Divider component="li" />
                    <DropdownItem onClick={handleLogout}>
                      Logout
                    </DropdownItem>
                  </DropdownList>
                </Dropdown>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => setIsLoginModalOpen(true)}
                  style={{ backgroundColor: '#06c', borderColor: '#06c' }}
                >
                  Login to AAP
                </Button>
              )}
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      </MastheadContent>
    </Masthead>
  );

  return (
    <>
      <Page masthead={masthead} role="main">
        <PageSection isFilled>
          {children}
        </PageSection>
      </Page>

      {/* Login Modal */}
      <Modal
        variant={ModalVariant.small}
        title="Login to AAP"
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      >
        <ModalBody>
          <AAPLogin />
        </ModalBody>
      </Modal>
    </>
  );
}
