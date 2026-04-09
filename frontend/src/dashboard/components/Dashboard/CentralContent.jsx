import React from 'react';
import { Box } from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../../../shared/components/Animations/PageTransition.jsx';
import TopActionButtons from './TopActionButtons.jsx';
const MotionDiv = motion.div;
const MainPage = React.lazy(() => import('./sections/MainPage.jsx'));
const IELTSSection = React.lazy(() => import('./sections/IELTSSection.jsx'));
const TOLCSection = React.lazy(() => import('./sections/TOLCSection.jsx'));
const UniversitiesSection = React.lazy(() => import('./sections/UniversitiesSection.jsx'));
const UniversitalySection = React.lazy(() => import('./sections/UniversitalySection.jsx'));
const CodiceSection = React.lazy(() => import('./sections/CodiceSection.jsx'));
const DOVSection = React.lazy(() => import('./sections/DOVSection.jsx'));
const VisaSection = React.lazy(() => import('./sections/VisaSection.jsx'));
const AIMentorSection = React.lazy(() => import('./sections/AIMentorSection.jsx'));
const SettingsSection = React.lazy(() => import('./sections/SettingsSection.jsx'));
const HelpSection = React.lazy(() => import('./sections/HelpSection.jsx'));
const NotificationsSection = React.lazy(() => import('./sections/NotificationsSection.jsx'));

const CentralContent = ({ activeSection, overallProgress, currentProgress, isMobile = false, isTablet = false }) => {
  const getSectionComponent = () => {
    const progress = { overallProgress, currentProgress };
    const deviceProps = { isMobile, isTablet };
    
    switch (activeSection) {
      case 'main':
        return <MainPage {...deviceProps} />;
      case 'education':
      case 'ielts':
        return <IELTSSection progress={progress} {...deviceProps} />;
      case 'examprep':
      case 'tolc':
        return <TOLCSection progress={progress} {...deviceProps} />;
      case 'universities':
        return <UniversitiesSection progress={progress} {...deviceProps} />;
      case 'universitaly':
        return <UniversitalySection progress={progress} {...deviceProps} />;
      case 'documents':
      case 'codice':
        return <CodiceSection progress={progress} {...deviceProps} />;
      case 'reports':
      case 'dov':
        return <DOVSection progress={progress} {...deviceProps} />;
      case 'visa':
        return <VisaSection progress={progress} {...deviceProps} />;
      case 'payments':
        return <div>Раздел платежей (в разработке)</div>;
      case 'aimentor':
        return <AIMentorSection {...deviceProps} />;
      case 'settings':
        return <SettingsSection progress={progress} {...deviceProps} />;
      case 'help':
        return <HelpSection {...deviceProps} />;
      case 'notifications':
        return <NotificationsSection {...deviceProps} />;
      default:
        return <MainPage {...deviceProps} />;
    }
  };

  return (
    <Box 
      style={{ 
        height: '100%', 
        background: 'transparent',
        padding: 0
      }}
      className={`central-content-container ${isMobile ? 'mobile-content' : isTablet ? 'tablet-content' : 'desktop-content'} hide-scrollbar`}
    >
      {/* Кнопки уведомлений и AI рекомендаций в верхней части */}
      <TopActionButtons isMobile={isMobile} isTablet={isTablet} />
      
      {/* Основной контент */}
      <Box style={{ padding: isMobile ? '8px' : isTablet ? '16px' : 'var(--app-spacing-md)' }}>
        <AnimatePresence mode="wait">
          <MotionDiv
            key={activeSection}
            initial={{ opacity: 0, y: isMobile ? 10 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: isMobile ? -10 : -20 }}
            transition={{ 
              duration: isMobile ? 0.2 : 0.3,
              ease: "easeInOut"
            }}
            style={{ height: '100%' }}
          >
            <React.Suspense fallback={<div />}> 
              <PageTransition direction="right" isMobile={isMobile} isTablet={isTablet}>
                {getSectionComponent()}
              </PageTransition>
            </React.Suspense>
          </MotionDiv>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default CentralContent;
