import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Stack, Group, Text, Paper, Card, Badge, Button, SegmentedControl, Switch } from '@mantine/core';
import { IconBell, IconCheck, IconX, IconMail } from '@tabler/icons-react';
import { fetchNotifications, markNotificationAsRead } from '../../../../store/notificationsSlice';
import notificationsApi from '../../../../shared/api/notificationsApi';

export default function NotificationsSection() {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useSelector((s) => s.notifications);
  const [filter, setFilter] = React.useState('all');

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const filtered = notifications.filter((n) => (filter === 'all' ? true : !n.is_read));

  return (
    <Box>
      <Stack gap="md">
        <Group align="center" gap="xs">
          <IconBell size={18} />
          <Text size="lg" fw={600}>Уведомления</Text>
          {unreadCount > 0 && <Badge color="red" variant="filled" size="sm">{unreadCount}</Badge>}
        </Group>

        <Paper p="var(--app-spacing-md)" withBorder shadow="sm" style={{ background: 'var(--app-color-surface)' }}>
          <Group justify="space-between" align="center">
            <SegmentedControl
              value={filter}
              onChange={setFilter}
              data={[{ label: 'Все', value: 'all' }, { label: 'Непрочитанные', value: 'unread' }]}
            />
            <Group gap="sm">
              <Switch label="Email уведомления" defaultChecked />
              <Switch label="Push уведомления" defaultChecked />
              <Button size="xs" variant="light" onClick={async ()=>{ await notificationsApi.markAllAsRead(); dispatch(fetchNotifications()); }}>Отметить все прочитанными</Button>
            </Group>
          </Group>
        </Paper>

        <Stack>
          {loading.notifications && <Text size="sm" c="dimmed">Загрузка…</Text>}
          {!loading.notifications && filtered.length === 0 && (
            <Card withBorder radius="md" shadow="sm" style={{ background: 'var(--app-color-surface)' }}>
              <Text c="dimmed" size="sm">Нет уведомлений</Text>
            </Card>
          )}

          {filtered.map((n) => (
            <Card key={n.id} withBorder radius="md" shadow="sm" style={{ background: 'var(--app-color-surface)' }}>
              <Group justify="space-between" align="flex-start">
                <Box>
                  <Group gap={8} mb={4} align="center">
                    <Badge size="xs" variant="light" color={n.is_read ? 'gray' : 'blue'}>{n.is_read ? 'прочитано' : 'новое'}</Badge>
                    <Text fw={600}>{n.title || 'Уведомление'}</Text>
                  </Group>
                  <Text size="sm" c="dimmed">{n.message}</Text>
                </Box>
                <Group gap="xs">
                  {!n.is_read && (
                    <Button size="xs" variant="light" leftSection={<IconCheck size={14} />} onClick={() => dispatch(markNotificationAsRead(n.id))}>Прочитано</Button>
                  )}
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}


