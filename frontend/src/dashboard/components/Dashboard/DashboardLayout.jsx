import React, { useState, useEffect } from 'react';
import { Box, ScrollArea, Drawer } from '@mantine/core';
import { useDisclosure, useViewportSize } from '@mantine/hooks';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile } from '../../../store/authSlice';
import LeftNavigation from './LeftNavigation';
import CentralContent from './CentralContent';
import MobileHeader from './MobileHeader';
import MobileFAB from './MobileFAB';
import { useDashboardStore } from '../../../store/dashboardStore';
import './Dashboard.css';

const DashboardLayout = () => {
  const [activeSection, setActiveSection] = useState('main');
  const [mobileNavOpened, { toggle: toggleMobileNav, close: closeMobileNav }] = useDisclosure(false);
  const { currentProgress, overallProgress, initFromBackend } = useDashboardStore();
  const { width } = useViewportSize();
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  useEffect(() => {
    dispatch(fetchProfile());
    initFromBackend?.();
  }, [dispatch, initFromBackend]);

  useEffect(() => {
    if (!isMobile) {
      closeMobileNav();
    }
  }, [isMobile, closeMobileNav]);

  const handleSettingsToggle = () => {
    setActiveSection('settings');
  };

  return (
    <Box
      className="dashboard-layout"
      style={{
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        background: 'linear-gradient(180deg, var(--app-color-bg) 0%, var(--app-color-surface) 40%, var(--app-color-bg) 100%)',
        paddingBottom: 0,
      }}
    >
      {isMobile && (
        <MobileHeader
          user={user}
          onMenuToggle={toggleMobileNav}
          isMenuOpen={mobileNavOpened}
        />
      )}

      {isMobile && (
        <Drawer
          opened={mobileNavOpened}
          onClose={closeMobileNav}
          position="left"
          size="280px"
          padding={0}
          withCloseButton={false}
          overlayProps={{
            opacity: 0.5,
            blur: 4,
          }}
          transitionProps={{
            transition: 'slide-right',
            duration: 200,
            timingFunction: 'ease',
          }}
          styles={{
            content: {
              backgroundColor: 'var(--app-color-surface)',
            },
            body: {
              padding: 0,
              height: '100%',
            },
          }}
        >
          <LeftNavigation
            activeSection={activeSection}
            onSectionChange={(section) => {
              setActiveSection(section);
              closeMobileNav();
            }}
            user={user}
            isMobile={true}
            isDrawer={true}
            onClose={closeMobileNav}
          />
        </Drawer>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          minHeight: isMobile ? 'calc(100vh - 64px)' : '100vh',
          width: '100%',
        }}
      >
        {!isMobile && (
          <div
            className="left-navigation"
            style={{
              flex: isTablet ? '0 0 25%' : '0 0 20%',
              maxWidth: isTablet ? '200px' : '250px',
              borderRight: '1px solid var(--mantine-color-gray-3)',
              backgroundColor: 'var(--app-color-surface)',
              minHeight: '100vh',
              boxShadow: 'var(--app-shadow-md)',
            }}
          >
            <LeftNavigation
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              isOpened={false}
              onToggle={() => {}}
              user={user}
            />
          </div>
        )}

        <div
          className="central-content"
          style={{
            flex: '1 1 auto',
            backgroundColor: 'transparent',
            minHeight: isMobile ? 'calc(100vh - 64px)' : '100vh',
            overflow: 'auto',
          }}
        >
          <ScrollArea style={{ height: '100%' }}>
            <CentralContent
              activeSection={activeSection}
              overallProgress={overallProgress}
              currentProgress={currentProgress}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          </ScrollArea>
        </div>
      </div>

      {isMobile && (
        <MobileFAB onSettingsToggle={handleSettingsToggle} />
      )}
    </Box>
  );
};

export default DashboardLayout;
