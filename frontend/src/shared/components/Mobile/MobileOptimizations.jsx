import React from 'react';
import { 
  Box, 
  Stack, 
  Text, 
  Paper, 
  Group, 
  Button, 
  Switch,
  Alert
} from '@mantine/core';
import { 
  IconBell, 
  IconWifi, 
  IconCamera,
  IconAlertCircle
} from '@tabler/icons-react';

const MobileOptimizations = () => {
  const [pushNotifications, setPushNotifications] = React.useState(false);
  const [offlineMode, setOfflineMode] = React.useState(false);
  const [cameraAccess, setCameraAccess] = React.useState(false);

  const handlePushNotificationToggle = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setPushNotifications(!pushNotifications);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            setPushNotifications(true);
          }
        });
      }
    }
  };

  const handleOfflineModeToggle = () => {
    setOfflineMode(!offlineMode);
    // Здесь можно добавить логику для включения/отключения офлайн режима
  };

  const handleCameraAccessToggle = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => {
          setCameraAccess(true);
        })
        .catch(() => {
          setCameraAccess(false);
        });
    }
  };

  return (
    <Box>
      <Text size="lg" fw={600} mb="md">
        Мобильные оптимизации
      </Text>
      
      <Stack gap="md">
        <Paper p="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
          <Group justify="space-between" mb="sm">
            <Group gap="sm">
              <IconBell size={20} color="var(--mantine-color-blue-6)" />
              <Box>
                <Text size="sm" fw={500}>
                  Push уведомления
                </Text>
                <Text size="xs" c="dimmed">
                  Получайте уведомления о дедлайнах и обновлениях
                </Text>
              </Box>
            </Group>
            <Switch
              checked={pushNotifications}
              onChange={handlePushNotificationToggle}
            />
          </Group>
        </Paper>

        <Paper p="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-green-0)' }}>
          <Group justify="space-between" mb="sm">
            <Group gap="sm">
              <IconWifi size={20} color="var(--mantine-color-green-6)" />
              <Box>
                <Text size="sm" fw={500}>
                  Офлайн режим
                </Text>
                <Text size="xs" c="dimmed">
                  Просматривайте информацию без интернета
                </Text>
              </Box>
            </Group>
            <Switch
              checked={offlineMode}
              onChange={handleOfflineModeToggle}
            />
          </Group>
        </Paper>

        <Paper p="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-purple-0)' }}>
          <Group justify="space-between" mb="sm">
            <Group gap="sm">
              <IconCamera size={20} color="var(--mantine-color-purple-6)" />
              <Box>
                <Text size="sm" fw={500}>
                  Сканер документов
                </Text>
                <Text size="xs" c="dimmed">
                  Сканируйте документы через камеру
                </Text>
              </Box>
            </Group>
            <Button
              size="sm"
              variant="light"
              onClick={handleCameraAccessToggle}
            >
              {cameraAccess ? 'Разрешено' : 'Разрешить'}
            </Button>
          </Group>
        </Paper>

        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Мобильные функции"
          color="blue"
        >
          <Text size="sm">
            Эти функции оптимизируют работу приложения на мобильных устройствах.
            Некоторые функции могут требовать разрешения браузера.
          </Text>
        </Alert>
      </Stack>
    </Box>
  );
};

export default MobileOptimizations;
