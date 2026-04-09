import React from 'react';
import { 
  Box, 
  Stack, 
  Text, 
  Paper, 
  Group, 
  Badge, 
  Button, 
  ActionIcon,
  ScrollArea,
  Alert,
  Skeleton,
  Divider
} from '@mantine/core';
import { 
  IconBell, 
  IconClock, 
  IconAlertCircle,
  IconCheck,
  IconRefresh,
  IconX
} from '@tabler/icons-react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

const NotificationCenter = ({ 
  userProgress: _userProgress, 
  notifications = [], 
  loading = false, 
  error = null,
  onNotificationRead,
  onRefresh
}) => {
  void _userProgress;
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'deadline': return <IconClock size={16} />;
      case 'reminder': return <IconBell size={16} />;
      case 'update': return <IconCheck size={16} />;
      case 'achievement': return <IconCheck size={16} />;
      case 'system': return <IconAlertCircle size={16} />;
      default: return <IconBell size={16} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Только что';
    if (diffInHours < 24) return `${diffInHours}ч назад`;
    if (diffInHours < 48) return 'Вчера';
    return date.toLocaleDateString('ru-RU');
  };

  if (loading) {
    return (
      <Box>
        <Skeleton height={60} radius="md" mb="md" />
        <Skeleton height={60} radius="md" mb="md" />
        <Skeleton height={60} radius="md" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Ошибка загрузки"
        color="red"
        mb="md"
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Group justify="space-between" mb="md">
        <Text size="lg" fw={600}>
          Уведомления
        </Text>
        <ActionIcon
          variant="subtle"
          size="sm"
          onClick={onRefresh}
          loading={loading}
        >
          <IconRefresh size={16} />
        </ActionIcon>
      </Group>

      {notifications.length === 0 ? (
        <Paper p="xl" radius="md" style={{ textAlign: 'center' }}>
          <IconBell size={48} color="var(--mantine-color-gray-4)" />
          <Text size="sm" c="dimmed" mt="md">
            Нет новых уведомлений
          </Text>
        </Paper>
      ) : (
        <ScrollArea style={{ height: '400px' }}>
          <Stack gap="sm">
            {notifications.map((notification, index) => (
              <MotionDiv
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Paper
                  p="md"
                  radius="md"
                  style={{
                    backgroundColor: notification.is_read 
                      ? 'var(--mantine-color-gray-0)' 
                      : 'var(--mantine-color-blue-0)',
                    borderLeft: `3px solid var(--mantine-color-${getPriorityColor(notification.priority)}-6)`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => onNotificationRead(notification.id)}
                >
                  <Group justify="space-between" mb="sm">
                    <Group gap="xs">
                      {getNotificationIcon(notification.notification_type)}
                      <Text size="sm" fw={500}>
                        {notification.title}
                      </Text>
                    </Group>
                    
                    <Group gap="xs">
                      {notification.is_important && (
                        <Badge color="red" size="xs">
                          Важно
                        </Badge>
                      )}
                      <Text size="xs" c="dimmed">
                        {formatDate(notification.created_at)}
                      </Text>
                    </Group>
                  </Group>
                  
                  <Text size="sm" c="dimmed" lineClamp={2}>
                    {notification.message}
                  </Text>
                  
                  {!notification.is_read && (
                    <Group justify="flex-end" mt="sm">
                      <Button
                        size="xs"
                        variant="light"
                        leftSection={<IconCheck size={12} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onNotificationRead(notification.id);
                        }}
                      >
                        Отметить как прочитанное
                      </Button>
                    </Group>
                  )}
                </Paper>
              </MotionDiv>
            ))}
          </Stack>
        </ScrollArea>
      )}

      {/* Статистика */}
      <Divider my="md" />
      <Paper p="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Всего уведомлений
          </Text>
          <Badge color="blue" variant="light">
            {notifications.length}
          </Badge>
        </Group>
        
        <Group justify="space-between" mt="xs">
          <Text size="sm" c="dimmed">
            Непрочитанных
          </Text>
          <Badge color="red" variant="light">
            {notifications.filter(n => !n.is_read).length}
          </Badge>
        </Group>
      </Paper>
    </Box>
  );
};

export default NotificationCenter;
