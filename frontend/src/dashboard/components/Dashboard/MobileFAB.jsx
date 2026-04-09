import React, { useState } from 'react';
import { 
  ActionIcon, 
  Group, 
  Text, 
  Paper,
  Transition,
  Stack,
  useMantineTheme
} from '@mantine/core';
import { 
  IconPlus, 
  IconBell, 
  IconRobot,
  IconSettings,
  IconX
} from '@tabler/icons-react';

const MobileFAB = ({ 
  onNotificationsToggle,
  onAiToggle,
  onSettingsToggle,
  unreadNotifications = 0
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useMantineTheme();
  
  const toggleFAB = () => setIsOpen(!isOpen);

  const fabItems = [
    {
      icon: IconBell,
      label: 'Уведомления',
      color: 'blue',
      action: () => {
        onNotificationsToggle();
        setIsOpen(false);
      },
      badge: unreadNotifications > 0 ? unreadNotifications : null
    },
    {
      icon: IconRobot,
      label: 'AI Помощник',
      color: 'grape',
      action: () => {
        onAiToggle();
        setIsOpen(false);
      }
    },
    {
      icon: IconSettings,
      label: 'Настройки',
      color: 'gray',
      action: () => {
        onSettingsToggle();
        setIsOpen(false);
      }
    }
  ];

  return (
    <>
      {/* Overlay */}
      <Transition mounted={isOpen} transition="fade" duration={200}>
        {(styles) => (
          <div
            style={{
              ...styles,
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              zIndex: 998
            }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </Transition>

      {/* FAB Items */}
      <Stack
        spacing="sm"
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '16px',
          zIndex: 999
        }}
      >
        {fabItems.map((item, index) => (
          <Transition
            key={item.label}
            mounted={isOpen}
            transition={{
              in: { 
                opacity: 1, 
                transform: 'translateY(0px) scale(1)' 
              },
              out: { 
                opacity: 0, 
                transform: 'translateY(20px) scale(0.8)' 
              },
              transitionProperty: 'opacity, transform'
            }}
            duration={200}
            timingFunction="ease"
            exitDuration={150}
          >
            {(styles) => (
              <Group
                spacing="xs"
                style={{
                  ...styles,
                  justifyContent: 'flex-end',
                  transitionDelay: `${index * 50}ms`
                }}
              >
                <Paper
                  p="xs"
                  radius="md"
                  style={{
                    backgroundColor: theme.colorScheme === 'dark' 
                      ? theme.colors.dark[6] 
                      : theme.white,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  <Text size="sm" weight={500}>
                    {item.label}
                  </Text>
                </Paper>
                <ActionIcon
                  size="lg"
                  radius="xl"
                  color={item.color}
                  variant="filled"
                  onClick={item.action}
                  style={{
                    width: 48,
                    height: 48,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    position: 'relative'
                  }}
                  className="mobile-fab-item touch-target"
                >
                  <item.icon size={20} />
                  {item.badge && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -2,
                        right: -2,
                        background: theme.colors.red[6],
                        color: theme.white,
                        borderRadius: '50%',
                        width: 18,
                        height: 18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        fontWeight: 600
                      }}
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </div>
                  )}
                </ActionIcon>
              </Group>
            )}
          </Transition>
        ))}
      </Stack>

      {/* Main FAB */}
      <ActionIcon
        size="xl"
        radius="xl"
        color="blue"
        variant="filled"
        onClick={toggleFAB}
        className="mobile-fab touch-target"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '16px',
          width: 56,
          height: 56,
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }}
      >
        {isOpen ? <IconX size={24} /> : <IconPlus size={24} />}
      </ActionIcon>
    </>
  );
};

export default MobileFAB;