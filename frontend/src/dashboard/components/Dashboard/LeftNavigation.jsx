import React, { useState } from 'react';
import { 
  Box, 
  Stack, 
  Text, 
  Group, 
  Button,
  Avatar,
  Badge,
  Divider,
  Modal,
  Paper,
  ActionIcon,
  useMantineTheme
} from '@mantine/core';
import { 
  IconHome, 
  IconBook, 
  IconSchool, 
  IconBuilding, 
  IconFileText, 
  IconFile, 
  IconPlane, 
  IconSettings,
  IconBell,
  IconHelp,
  IconX,
  IconStar,
  IconMapPin,
  IconCalendar,
  IconUser,
  IconMail,
  IconPhone,
  IconWorldWww,
  IconTrophy,
  IconCertificate,
  IconTarget
} from '@tabler/icons-react';
import { useDashboardStore } from '../../../store/dashboardStore';
import { API_BASE_URL } from '../../../shared/services/api.js';

const LeftNavigation = ({ activeSection, onSectionChange, user, isMobile = false, isDrawer = false, onClose }) => {
  const [showStudentCard, setShowStudentCard] = useState(false);
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === 'dark';
  const { currentProgress } = useDashboardStore();

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
      description: 'Обзор и статистика',
      icon: IconHome,
      color: 'blue'
    },
    {
      id: 'ielts',
      label: 'IELTS',
      description: 'Подготовка к IELTS',
      icon: IconBook,
      color: 'green'
    },
    {
      id: 'tolc',
      label: 'TOLC',
      description: 'Подготовка к TOLC',
      icon: IconSchool,
      color: 'orange'
    },
    {
      id: 'universities',
      label: 'Университеты',
      description: 'Поиск университетов',
      icon: IconBuilding,
      color: 'purple'
    },
    {
      id: 'universitaly',
      label: 'Universitaly',
      description: 'Платформа Universitaly',
      icon: IconBuilding,
      color: 'purple'
    },
    {
      id: 'codice',
      label: 'Codice Fiscale',
      description: 'Документы и коды',
      icon: IconFileText,
      color: 'teal'
    },
    {
      id: 'dov',
      label: 'DOV',
      description: 'Декларация о стоимости',
      icon: IconFile,
      color: 'indigo'
    },
    {
      id: 'visa',
      label: 'Визовая поддержка',
      description: 'Помощь с визами',
      icon: IconPlane,
      color: 'cyan'
    },
    {
      id: 'aimentor',
      label: 'AI Ментор',
      description: 'Персональный помощник',
      icon: IconHelp,
      color: 'pink'
    }
  ];

  const getColorValue = (colorName) => {
    const colorMap = {
      blue: '#228be6',
      green: '#51cf66',
      purple: '#9775fa',
      orange: '#ff922b',
      cyan: '#22d3ee',
      teal: '#20c997',
      indigo: '#5c7cfa',
      pink: '#f783ac'
    };
    return colorMap[colorName] || '#868e96';
  };

  return (
    <>
      {/* CSS animations */}
      <style>{`
        @keyframes cardFloat {
          0%, 100% {
            transform: perspective(1000px) rotateX(5deg) translateY(0px);
          }
          50% {
            transform: perspective(1000px) rotateX(5deg) translateY(-8px);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
    <Box style={{ height: '100%', backgroundColor: 'var(--app-color-surface)' }}>
      {/* Мобильный заголовок с кнопкой закрытия */}
      {isMobile && isDrawer && (
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
              className="touch-icon-button"
            >
              <IconX size={18} />
            </ActionIcon>
          </Group>
        </Box>
      )}

      <Stack gap="xs" style={{ padding: '16px' }}>
        {/* Top spacer to avoid clipping under app frame - только для десктопа */}
        {!isMobile && <Box style={{ height: 8 }} />}
        
        {/* User Profile */}
        <Paper
          withBorder
          radius="lg"
          p={isMobile ? "sm" : "md"}
          onClick={() => setShowStudentCard(true)}
          style={{
            backgroundColor: 'var(--app-color-surface)',
            borderColor: 'var(--mantine-color-gray-3)',
            boxShadow: 'var(--app-shadow-sm)',
            cursor: 'pointer',
            transition: 'box-shadow 150ms ease, transform 150ms ease',
            color: isDark ? 'var(--mantine-color-white)' : undefined
          }}
          className={isMobile ? "touch-card" : ""}
        >
          <Group>
            <Avatar
              size={isMobile ? "md" : "lg"}
              color="blue"
              radius="xl"
              src={avatarSrc}
            >
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </Avatar>
            <Box style={{ flex: 1 }}>
              <Text size={isMobile ? "sm" : "md"} fw={700} c={isDark ? 'white' : 'dark'}>
                {user?.first_name} {user?.last_name}
              </Text>
              <Text size="xs" c={isDark ? 'white' : 'dimmed'}>
                Студент
              </Text>
            </Box>
            <Badge color="green" variant="light" size="sm" radius="sm">
              Активен
            </Badge>
          </Group>
        </Paper>

        {/* Navigation Items */}
        <Stack gap="md">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            // Определяем живой прогресс по id секции
            const liveProgressMap = {
              ielts: currentProgress?.ielts ?? null,
              tolc: currentProgress?.tolc ?? null,
              universitaly: currentProgress?.universitaly ?? null,
              codice: currentProgress?.codice ?? null,
              dov: currentProgress?.dov ?? null,
              visa: currentProgress?.visa ?? null
            };
            const itemProgress = liveProgressMap[item.id];

            return (
              <Button
                key={item.id}
                variant={isActive ? 'filled' : 'subtle'}
                color={isActive ? item.color : 'gray'}
                onClick={() => {
                  onSectionChange(item.id);
                  if (isMobile && onClose) {
                    onClose();
                  }
                }}
                justify="flex-start"
                size={isMobile ? "md" : "lg"}
                radius="md"
                aria-current={isActive ? 'page' : undefined}
                title={item.description}
                style={{
                  minHeight: isMobile ? '64px' : '68px',
                  padding: isMobile ? '12px 16px' : '16px 18px',
                  height: 'auto'
                }}
                className={isMobile ? "touch-nav-item" : ""}
                styles={{
                  root: {
                    display: 'flex',
                    alignItems: 'center',
                    height: 'auto'
                  },
                  label: {
                    color: isDark && !isActive ? '#ffffff' : undefined,
                    fontSize: isMobile ? '14px' : undefined,
                    fontWeight: isActive ? 600 : 500,
                    whiteSpace: 'normal',
                    textAlign: 'left',
                    overflow: 'visible'
                  },
                  inner: {
                    justifyContent: 'flex-start',
                    height: 'auto'
                  }
                }}
                leftSection={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon 
                      size={isMobile ? 20 : 22} 
                      color={isActive ? 'white' : getColorValue(item.color)} 
                    />
                  </div>
                }
                rightSection={
                  typeof itemProgress === 'number' ? (
                    <Badge 
                      size={isMobile ? "xs" : "sm"} 
                      color={item.color} 
                      variant="light"
                      radius="sm"
                    >
                      {itemProgress}%
                    </Badge>
                  ) : null
                }
              >
                <Box style={{ 
                  textAlign: 'left', 
                  lineHeight: 1.2, 
                  color: isDark && !isActive ? 'white' : undefined 
                }}>
                  <Text 
                    size={isMobile ? "sm" : "md"} 
                    fw={isActive ? 700 : 500} 
                    c={isActive ? 'white' : (isDark ? 'white' : 'dark')} 
                    style={{ lineHeight: 1.2 }}
                  >
                    {item.label}
                  </Text>
                  {!isMobile && (
                    <Text 
                      size="xs" 
                      c={isActive ? 'white' : (isDark ? 'white' : 'dimmed')} 
                      style={{ lineHeight: 1.2 }}
                    >
                      {item.description}
                    </Text>
                  )}
                </Box>
              </Button>
            );
          })}
        </Stack>

        <Divider style={{ margin: '20px 0' }} />

        {/* Settings */}
        <Button
          variant={activeSection === 'settings' ? 'filled' : 'subtle'}
          color={activeSection === 'settings' ? 'gray' : 'gray'}
          onClick={() => onSectionChange('settings')}
          justify="flex-start"
          leftSection={<IconSettings size={22} />}
          size="lg"
          radius="md"
          aria-current={activeSection === 'settings' ? 'page' : undefined}
          style={{
            alignItems: 'flex-start',
            height: 'auto',
            minHeight: 64,
            padding: '16px 18px',
            borderRadius: 'var(--app-radius-md)',
            transition: 'background-color 0.2s ease'
          }}
        >
          <Box style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <Text size="md" fw={activeSection === 'settings' ? 600 : 500} c={isDark ? 'white' : (activeSection === 'settings' ? 'dark' : undefined)}>
              Настройки
            </Text>
            <Text size="sm" c={isDark ? 'white' : 'dimmed'} style={{ lineHeight: 1.2 }}>
              Профиль и предпочтения
            </Text>
          </Box>
        </Button>

        {/* Help & Support */}
        <Stack gap="md" style={{ marginTop: '20px' }}>
          <Button
            variant="subtle"
            color="gray"
            justify="flex-start"
            leftSection={<IconHelp size={22} />}
            size="lg"
            radius="md"
            style={{
              alignItems: 'flex-start',
              height: 'auto',
              minHeight: 64,
              padding: '16px 18px',
              borderRadius: 'var(--app-radius-md)',
              transition: 'background-color 0.2s ease'
            }}
            onClick={() => onSectionChange('help')}
          >
            <Box style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <Text size="md" fw={500} c={isDark ? 'white' : undefined}>
                Помощь
              </Text>
              <Text size="sm" c={isDark ? 'white' : 'dimmed'} style={{ lineHeight: 1.2 }}>
                FAQ и поддержка
              </Text>
            </Box>
          </Button>

          <Button
            variant="subtle"
            color="gray"
            justify="flex-start"
            leftSection={<IconBell size={22} />}
            size="lg"
            radius="md"
            style={{
              alignItems: 'flex-start',
              height: 'auto',
              minHeight: 64,
              padding: '16px 18px',
              borderRadius: 'var(--app-radius-md)',
              transition: 'background-color 0.2s ease'
            }}
            onClick={() => onSectionChange('notifications')}
          >
            <Box style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <Text size="md" fw={500} c={isDark ? 'white' : undefined}>
                Уведомления
              </Text>
              <Text size="sm" c={isDark ? 'white' : 'dimmed'} style={{ lineHeight: 1.2 }}>
                Настройки уведомлений
              </Text>
            </Box>
          </Button>
        </Stack>
      </Stack>

      {/* Centered Student Card Modal */}
      <Modal
        opened={showStudentCard}
        onClose={() => setShowStudentCard(false)}
        withCloseButton={false}
        centered
        size="xl"
        overlayProps={{ backgroundOpacity: 0.4, blur: 4 }}
        transitionProps={{ transition: 'fade', duration: 300, timingFunction: 'ease-out' }}
        styles={{
          content: {
            background: 'transparent',
            boxShadow: 'none'
          }
        }}
      >
        <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Paper
            radius="lg"
            shadow="xl"
            style={{
              width: 650,
              maxWidth: '90vw',
              height: 450,
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
              border: 'none',
              boxShadow: '0 20px 40px rgba(76, 29, 149, 0.25), 0 8px 16px rgba(0, 0, 0, 0.15)',
              borderRadius: 16,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Top curved design with logo */}
            <Box style={{ 
              position: 'absolute', 
              top: 0,
              left: 0,
              right: 0,
              height: 120,
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
              clipPath: 'polygon(0 0, 100% 0, 100% 70%, 80% 100%, 0 85%)',
              zIndex: 1
            }}>
              {/* Logo and company info */}
              <Group gap={12} style={{ padding: '20px 32px' }}>
                <Box style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(251, 191, 36, 0.9)',
                  border: '2px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <IconCertificate size={24} color="#1e1b4b" />
                </Box>
                <Box>
                  <Text fw={700} c="white" size="lg">EduBridge International</Text>
                  <Text c="rgba(255, 255, 255, 0.9)" size="sm">Student Identification Card</Text>
                </Box>
              </Group>
            </Box>

            {/* Curved decorative wave */}
            <Box style={{
              position: 'absolute',
              top: 100,
              left: 0,
              right: 0,
              height: 80,
              background: 'linear-gradient(45deg, rgba(251, 191, 36, 0.9) 0%, rgba(245, 158, 11, 0.8) 100%)',
              clipPath: 'polygon(0 50%, 100% 20%, 100% 100%, 0 100%)',
              zIndex: 2
            }} />

            {/* White content area */}
            <Box style={{
              position: 'absolute',
              top: 140,
              left: 0,
              right: 0,
              bottom: 0,
              background: '#f8fafc',
              zIndex: 3
            }} />

            <Group justify="space-between" align="flex-start" style={{ 
              position: 'relative',
              zIndex: 4,
              height: '100%',
              padding: 0
            }}>
              {/* Left content area */}
              <Box style={{ flex: 1, paddingTop: 170, paddingLeft: 32, paddingRight: 20, paddingBottom: 40 }}>
                {/* Orange name strip */}
                <Box style={{
                  background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  marginBottom: 20,
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}>
                  <Text size="xl" fw={800} c="white" style={{ letterSpacing: '0.5px' }}>
                    {user?.first_name || 'Имя'} {user?.last_name || 'Фамилия'}
                  </Text>
                </Box>
                
                {/* Student information */}
                <Stack gap={8}>
                  <Group justify="space-between">
                    <Text size="sm" c="#374151" fw={600}>Student ID</Text>
                    <Text size="sm" c="#1f2937" fw={700} style={{ fontFamily: 'monospace' }}>
                      {user?.student_id || '1234-456-7890'}
                    </Text>
                  </Group>
                  
                  <Group justify="space-between">
                    <Text size="sm" c="#374151" fw={600}>D.O.B</Text>
                    <Text size="sm" c="#1f2937" fw={600}>
                      {user?.profile?.date_of_birth ? 
                        new Date(user.profile.date_of_birth).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : 
                        'January 15, 2000'
                      }
                    </Text>
                  </Group>
                  
                  <Group justify="space-between">
                    <Text size="sm" c="#374151" fw={600}>Faculty</Text>
                    <Text size="sm" c="#1f2937" fw={600}>
                      {user?.profile?.interests?.[0] || 'Computer Science'}
                    </Text>
                  </Group>
                  
                  <Group justify="space-between">
                    <Text size="sm" c="#374151" fw={600}>Progress</Text>
                    <Badge 
                      color="violet" 
                      variant="filled" 
                      size="sm"
                      style={{ background: 'linear-gradient(45deg, #7c3aed 0%, #5b21b6 100%)' }}
                    >
                      75% Complete
                    </Badge>
                  </Group>
                </Stack>
              </Box>
              
              {/* Right photo area */}
              <Box style={{
                width: 140,
                height: '100%',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: 170,
                paddingRight: 32,
                paddingBottom: 40
              }}>
                {/* Student photo */}
                <Box style={{
                  width: 120,
                  height: 140,
                  borderRadius: '12px',
                  background: avatarSrc 
                    ? `url(${avatarSrc})` 
                    : 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '3px solid white',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {!avatarSrc && (
                    <IconUser size={50} color="#7c3aed" />
                  )}
                </Box>
              </Box>
            </Group>
          </Paper>
        </Box>
      </Modal>
    </Box>
    </>
  );
};

export default LeftNavigation;
