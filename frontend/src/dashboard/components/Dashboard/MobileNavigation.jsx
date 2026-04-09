import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Stack, 
  Text, 
  Group, 
  Button,
  Avatar,
  Badge,
  Divider,
  Paper,
  ActionIcon,
  ScrollArea,
  Drawer
} from '@mantine/core';
import { 
  IconHome, 
  IconBook, 
  IconSchool, 
  IconBuilding, 
  IconFileText, 
  IconCreditCard, 
  IconFile, 
  IconPlane, 
  IconSettings,
  IconBell,
  IconHelp,
  IconX,
  IconLogout
} from '@tabler/icons-react';
import { API_BASE_URL } from '../../../shared/services/api.js';
import useSwipeGesture from '../../../shared/hooks/useSwipeGesture.js';
import { logoutUser } from '../../../store/authSlice.js';

const MobileNavigation = ({ 
  opened, 
  onClose, 
  activeSection, 
  onSectionChange, 
  user,
  currentProgress 
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Swipe gesture для закрытия панели свайпом влево
  const swipeRef = useSwipeGesture(onClose, null, null, null);
  
  const avatarRaw = user?.avatar || '';
  const avatarSrc = avatarRaw
    ? (avatarRaw.startsWith('http://') || avatarRaw.startsWith('https://')
        ? avatarRaw
        : `${API_BASE_URL}${avatarRaw.startsWith('/') ? '' : '/'}${avatarRaw}`)
    : undefined;

  const navigationItems = [
    {
      id: 'main',
      label: 'Главная',
      description: 'Обзор прогресса',
      icon: IconHome,
      color: 'blue'
    },
    {
      id: 'education',
      label: 'Обучение',
      description: 'Курсы и материалы',
      icon: IconBook,
      color: 'green',
      badge: currentProgress?.totalLessons ? `${currentProgress.completedLessons || 0}/${currentProgress.totalLessons}` : null
    },
    {
      id: 'examprep',
      label: 'Подготовка к экзаменам',
      description: 'IELTS, TOEFL и др.',
      icon: IconSchool,
      color: 'orange'
    },
    {
      id: 'universities',
      label: 'Университеты',
      description: 'Поиск и подача заявок',
      icon: IconBuilding,
      color: 'purple'
    },
    {
      id: 'documents',
      label: 'Документы',
      description: 'Управление документами',
      icon: IconFileText,
      color: 'teal'
    },
    {
      id: 'payments',
      label: 'Платежи',
      description: 'История и управление',
      icon: IconCreditCard,
      color: 'red'
    },
    {
      id: 'reports',
      label: 'Отчеты',
      description: 'Анализ прогресса',
      icon: IconFile,
      color: 'indigo'
    },
    {
      id: 'visa',
      label: 'Визовая поддержка',
      description: 'Помощь с визами',
      icon: IconPlane,
      color: 'cyan'
    }
  ];

  const handleItemClick = (sectionId) => {
    onSectionChange(sectionId);
    onClose(); // ?????????????????? ???????? ?????????? ????????????
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    onClose();
    navigate('/login', { replace: true });
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="left"
      size="280px"
      padding={0}
      withCloseButton={false}
      overlayProps={{ 
        opacity: 0.5, 
        blur: 4 
      }}
      transitionProps={{
        transition: 'slide-right',
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
              Навигация
            </Text>
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

        {/* Профиль пользователя */}
        <Box style={{ padding: '16px', backgroundColor: 'var(--app-color-bg)' }}>
          <Group gap="md" align="center">
            <Avatar 
              src={avatarSrc}
              size="lg"
              radius="xl"
              style={{ 
                border: '2px solid var(--mantine-color-blue-4)'
              }}
            >
              {user?.first_name?.[0] || user?.username?.[0] || 'U'}
            </Avatar>
            <Box style={{ flex: 1 }}>
              <Text size="md" weight={600} truncate>
                {user?.first_name && user?.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : user?.username || 'Пользователь'
                }
              </Text>
              <Text size="xs" c="dimmed" truncate>
                {user?.email || 'email@example.com'}
              </Text>
            </Box>
          </Group>
        </Box>

        <Divider />

        {/* Навигационные элементы */}
        <ScrollArea 
          style={{ flex: 1 }}
          scrollbarSize={6}
          scrollHideDelay={0}
        >
          <Stack gap={0} style={{ padding: '8px 0' }}>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'light' : 'subtle'}
                  color={isActive ? item.color : 'gray'}
                  justify="flex-start"
                  leftSection={<Icon size={20} />}
                  rightSection={
                    item.badge && (
                      <Badge 
                        size="xs" 
                        color={item.color}
                        variant="filled"
                      >
                        {item.badge}
                      </Badge>
                    )
                  }
                  onClick={() => handleItemClick(item.id)}
                  style={{
                    margin: '2px 8px',
                    padding: '12px 16px',
                    height: 'auto',
                    borderRadius: '8px',
                    justifyContent: 'flex-start',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 400,
                    backgroundColor: isActive 
                      ? `var(--mantine-color-${item.color}-1)` 
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: isActive 
                        ? `var(--mantine-color-${item.color}-2)` 
                        : 'var(--mantine-color-gray-1)'
                    }
                  }}
                >
                  <Box style={{ flex: 1, textAlign: 'left' }}>
                    <Text size="sm" weight={isActive ? 600 : 500}>
                      {item.label}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {item.description}
                    </Text>
                  </Box>
                </Button>
              );
            })}
          </Stack>
        </ScrollArea>

        <Divider />

        {/* Нижние действия */}
        <Box style={{ padding: '16px' }}>
          <Stack gap="xs">
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconSettings size={18} />}
              onClick={() => handleItemClick('settings')}
              size="sm"
              style={{ justifyContent: 'flex-start' }}
            >
              Настройки
            </Button>
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconHelp size={18} />}
              onClick={() => handleItemClick('help')}
              size="sm"
              style={{ justifyContent: 'flex-start' }}
            >
              Помощь
            </Button>
            <Button
              variant="subtle"
              color="red"
              leftSection={<IconLogout size={18} />}
              onClick={handleLogout}
              size="sm"
              style={{ justifyContent: 'flex-start' }}
            >
              Выход
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};

export default MobileNavigation;