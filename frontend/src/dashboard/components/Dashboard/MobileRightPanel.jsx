import React from 'react';
import {
  Drawer,
  Box,
  ActionIcon,
  Group,
  Text,
  Tabs,
  ScrollArea
} from '@mantine/core';
import {
  IconX,
  IconBell,
  IconRobot
} from '@tabler/icons-react';
import RightPanel from './RightPanel';
import useSwipeGesture from '../../../shared/hooks/useSwipeGesture.js';

const MobileRightPanel = ({ 
  opened, 
  onClose, 
  activeSection, 
  currentProgress,
  activeTab = 'ai' // 'ai' или 'notifications'
}) => {
  // Swipe gesture для закрытия панели свайпом вправо
  const swipeRef = useSwipeGesture(null, onClose, null, null);
  
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="320px"
      padding={0}
      withCloseButton={false}
      overlayProps={{ 
        opacity: 0.5, 
        blur: 4 
      }}
      transitionProps={{
        transition: 'slide-left',
        duration: 200,
        timingFunction: 'ease'
      }}
      styles={{
        content: {
          backgroundColor: 'var(--app-color-surface)',
        },
        body: {
          padding: 0,
          height: '100%'
        }
      }}
    >
      <Box 
        ref={swipeRef}
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        className="swipe-area"
      >
        {/* Заголовок с кнопкой закрытия */}
        <Box style={{ 
          padding: '16px', 
          borderBottom: '1px solid var(--mantine-color-gray-3)',
          backgroundColor: 'var(--app-color-surface)'
        }}>
          <Group justify="space-between" align="center">
            <Group gap="xs" align="center">
              {activeTab === 'ai' ? (
                <>
                  <IconRobot size={20} style={{ color: 'var(--mantine-color-grape-6)' }} />
                  <Text size="lg" weight={600}>AI Помощник</Text>
                </>
              ) : (
                <>
                  <IconBell size={20} style={{ color: 'var(--mantine-color-blue-6)' }} />
                  <Text size="lg" weight={600}>Уведомления</Text>
                </>
              )}
            </Group>
            <ActionIcon 
              variant="subtle" 
              color="gray" 
              onClick={onClose}
              size="md"
            >
              <IconX size={18} />
            </ActionIcon>
          </Group>
        </Box>

        {/* Контент панели */}
        <ScrollArea style={{ flex: 1 }}>
          <RightPanel 
            activeSection={activeSection}
            currentProgress={currentProgress}
            isMobile={true}
            activeTab={activeTab}
          />
        </ScrollArea>
      </Box>
    </Drawer>
  );
};

export default MobileRightPanel;