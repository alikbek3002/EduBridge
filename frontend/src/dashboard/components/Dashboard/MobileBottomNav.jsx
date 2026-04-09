import React from 'react';
import { 
  Box, 
  Group, 
  Button,
  Badge,
  Paper,
  Text
} from '@mantine/core';
import { 
  IconHome, 
  IconBook, 
  IconSchool, 
  IconBuilding,
  IconBell,
  IconRobot
} from '@tabler/icons-react';

const MobileBottomNav = ({ 
  activeSection, 
  onSectionChange,
  onNotificationsToggle,
  onAiToggle,
  currentProgress,
  unreadNotifications = 0
}) => {
  const mainItems = [
    {
      id: 'main',
      label: 'Главная',
      icon: IconHome,
      color: 'blue'
    },
    {
      id: 'education',
      label: 'Обучение',
      icon: IconBook,
      color: 'green',
      badge: currentProgress?.totalLessons ? `${currentProgress.completedLessons || 0}/${currentProgress.totalLessons}` : null
    },
    {
      id: 'examprep',
      label: 'Экзамены',
      icon: IconSchool,
      color: 'orange'
    },
    {
      id: 'universities',
      label: 'ВУЗы',
      icon: IconBuilding,
      color: 'purple'
    }
  ];

  const actionItems = [
    {
      id: 'notifications',
      label: 'Уведомления',
      icon: IconBell,
      color: 'blue',
      action: onNotificationsToggle,
      badge: unreadNotifications > 0 ? (unreadNotifications > 9 ? '9+' : unreadNotifications.toString()) : null
    },
    {
      id: 'ai',
      label: 'AI',
      icon: IconRobot,
      color: 'grape',
      action: onAiToggle
    }
  ];

  return (
    <Paper 
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: '8px 16px 16px 16px',
        borderTop: '1px solid var(--mantine-color-gray-3)',
        backgroundColor: 'var(--app-color-surface)',
        boxShadow: '0 -2px 12px rgba(0, 0, 0, 0.1)',
        borderRadius: '16px 16px 0 0'
      }}
    >
      <Group justify="space-between" align="center" gap="xs">
        {/* Основные разделы */}
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant="subtle"
              color={isActive ? item.color : 'gray'}
              onClick={() => onSectionChange(item.id)}
              style={{
                flex: 1,
                flexDirection: 'column',
                height: '60px',
                padding: '8px 4px',
                backgroundColor: isActive ? `var(--mantine-color-${item.color}-1)` : 'transparent',
                border: 'none',
                borderRadius: '12px',
                position: 'relative'
              }}
            >
              <Icon 
                size={20} 
                style={{ 
                  color: isActive 
                    ? `var(--mantine-color-${item.color}-6)` 
                    : 'var(--mantine-color-gray-6)',
                  marginBottom: '2px'
                }} 
              />
              <Text 
                size="xs" 
                style={{ 
                  color: isActive 
                    ? `var(--mantine-color-${item.color}-6)` 
                    : 'var(--mantine-color-gray-6)',
                  fontWeight: isActive ? 600 : 400,
                  lineHeight: 1
                }}
              >
                {item.label}
              </Text>
              {item.badge && (
                <Badge
                  size="xs"
                  color={item.color}
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    minWidth: 16,
                    height: 16,
                    padding: 0,
                    fontSize: 9
                  }}
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}

        {/* Разделитель */}
        <Box 
          style={{
            width: '1px',
            height: '40px',
            backgroundColor: 'var(--mantine-color-gray-3)',
            margin: '0 4px'
          }} 
        />

        {/* Действия */}
        {actionItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <Button
              key={item.id}
              variant="subtle"
              color={item.color}
              onClick={item.action}
              style={{
                flexDirection: 'column',
                height: '60px',
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '12px',
                position: 'relative',
                minWidth: '60px'
              }}
            >
              <Icon 
                size={20} 
                style={{ 
                  color: `var(--mantine-color-${item.color}-6)`,
                  marginBottom: '2px'
                }} 
              />
              <Text 
                size="xs" 
                style={{ 
                  color: `var(--mantine-color-${item.color}-6)`,
                  fontWeight: 500,
                  lineHeight: 1
                }}
              >
                {item.label}
              </Text>
              {item.badge && (
                <Badge
                  size="xs"
                  color="red"
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 8,
                    minWidth: 16,
                    height: 16,
                    padding: 0,
                    fontSize: 9
                  }}
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </Group>
    </Paper>
  );
};

export default MobileBottomNav;