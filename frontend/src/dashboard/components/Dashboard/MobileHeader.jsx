import React from 'react';
import { 
  Box, 
  Group, 
  ActionIcon, 
  Text, 
  Avatar,
  Burger,
  Tooltip,
  Badge,
  Paper,
  useMantineTheme
} from '@mantine/core';
import { 
  IconBell, 
  IconRobot,
  IconLogout,
  IconSettings
} from '@tabler/icons-react';
import { API_BASE_URL } from '../../../shared/services/api.js';

const MobileHeader = ({ 
  user, 
  onMenuToggle, 
  onNotificationsToggle,
  onAiToggle,
  isMenuOpen,
  unreadNotifications = 0
}) => {
  const theme = useMantineTheme();
  
  const avatarRaw = user?.avatar || '';
  const avatarSrc = avatarRaw
    ? (avatarRaw.startsWith('http://') || avatarRaw.startsWith('https://')
        ? avatarRaw
        : `${API_BASE_URL}${avatarRaw.startsWith('/') ? '' : '/'}${avatarRaw}`)
    : undefined;

  return (
    <Paper 
      className="mobile-header"
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--mantine-color-gray-3)',
        backgroundColor: 'var(--app-color-surface)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Group justify="space-between" align="center">
        {/* Левая сторона - меню и логотип */}
        <Group gap="md" align="center">
          <Burger
            opened={isMenuOpen}
            onClick={onMenuToggle}
            size="sm"
            color={theme.colors.gray[6]}
          />
          <Text 
            size="lg" 
            weight={600}
            style={{ 
              background: 'linear-gradient(45deg, var(--mantine-color-blue-6), var(--mantine-color-purple-6))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            EduBridge
          </Text>
        </Group>

        {/* Правая сторона - действия и аватар */}
        <Group gap="xs" align="center">
          {/* Кнопка уведомлений */}
          <Tooltip label="Уведомления" position="bottom">
            <ActionIcon
              variant="light"
              color="blue"
              size="lg"
              onClick={onNotificationsToggle}
              style={{ position: 'relative' }}
            >
              <IconBell size={18} />
              {unreadNotifications > 0 && (
                <Badge
                  size="xs"
                  color="red"
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    minWidth: 16,
                    height: 16,
                    padding: 0,
                    fontSize: 10
                  }}
                >
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </Badge>
              )}
            </ActionIcon>
          </Tooltip>

          {/* Кнопка AI помощника */}
          <Tooltip label="AI Помощник" position="bottom">
            <ActionIcon
              variant="light"
              color="grape"
              size="lg"
              onClick={onAiToggle}
            >
              <IconRobot size={18} />
            </ActionIcon>
          </Tooltip>

          {/* Аватар пользователя */}
          <Avatar 
            src={avatarSrc}
            size="md"
            radius="xl"
            style={{ 
              border: '2px solid var(--mantine-color-blue-4)',
              cursor: 'pointer'
            }}
          >
            {user?.first_name?.[0] || user?.username?.[0] || 'U'}
          </Avatar>
        </Group>
      </Group>
    </Paper>
  );
};

export default MobileHeader;
