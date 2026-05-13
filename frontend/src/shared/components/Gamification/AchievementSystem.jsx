import React from 'react';
import {
  Box,
  Stack,
  Text,
  Paper,
  Group,
  Badge,
  ActionIcon,
  ScrollArea,
  Alert,
  Skeleton,
  ThemeIcon,
} from '@mantine/core';
import {
  IconTrophy,
  IconStar,
  IconFlame,
  IconRefresh,
  IconAlertCircle,
  IconCheck,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

const AchievementSystem = ({
  userProgress: _userProgress,
  achievements = [],
  loading = false,
  error = null,
  onAchievementUnlocked: _onAchievementUnlocked,
  onRefresh,
}) => {
  void _userProgress;
  void _onAchievementUnlocked;

  const isDark = typeof document !== 'undefined'
    && document.documentElement.getAttribute('data-mantine-color-scheme') === 'dark';

  const getAchievementIcon = (category) => {
    switch (category) {
      case 'progress': return <IconCheck size={18} />;
      case 'learning': return <IconStar size={18} />;
      case 'streak': return <IconFlame size={18} />;
      default: return <IconTrophy size={18} />;
    }
  };

  const getAchievementColor = (category) => {
    switch (category) {
      case 'progress': return 'green';
      case 'learning': return 'blue';
      case 'streak': return 'orange';
      default: return 'yellow';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  // achievements here are UserAchievement records:
  // { id, user, achievement: { id, name, description, icon, points, category }, earned_at }
  const totalPoints = achievements.reduce((sum, ua) => sum + (ua.achievement?.points || 0), 0);

  if (loading) {
    return (
      <Box>
        {[1, 2, 3].map((i) => <Skeleton key={i} height={60} radius="md" mb="md" />)}
      </Box>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Ошибка загрузки" color="red" mb="md">
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Group justify="space-between" mb="md">
        <Text size="lg" fw={600}>Достижения</Text>
        <ActionIcon variant="subtle" size="sm" onClick={onRefresh} loading={loading}>
          <IconRefresh size={16} />
        </ActionIcon>
      </Group>

      {/* Summary */}
      <Paper
        p="md" radius="md" mb="md"
        bg={isDark ? 'dark.6' : 'yellow.0'}
      >
        <Group justify="space-between" mb="sm">
          <Text size="sm" fw={600}>Общий прогресс</Text>
          <Badge color="yellow" size="lg">{totalPoints} очков</Badge>
        </Group>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">Достижений получено</Text>
          <Badge color="green" variant="light">{achievements.length}</Badge>
        </Group>
      </Paper>

      {achievements.length === 0 ? (
        <Paper p="xl" radius="md" ta="center">
          <IconTrophy size={48} color="var(--mantine-color-gray-4)" />
          <Text size="sm" c="dimmed" mt="md">Пока нет достижений</Text>
          <Text size="xs" c="dimmed" mt="xs">
            Выполняйте шаги поступления, чтобы получить достижения
          </Text>
        </Paper>
      ) : (
        <ScrollArea style={{ height: 400 }}>
          <Stack gap="sm">
            {achievements.map((ua, index) => {
              const category = ua.achievement?.category || 'other';
              const color = getAchievementColor(category);
              return (
                <MotionDiv
                  key={ua.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Paper
                    p="md"
                    radius="md"
                    bg={isDark ? 'dark.6' : 'gray.0'}
                    style={{ borderLeft: `3px solid var(--mantine-color-${color}-6)` }}
                  >
                    <Group justify="space-between" mb={6}>
                      <Group gap="sm">
                        <ThemeIcon size={36} radius="xl" color={color} variant="light">
                          {getAchievementIcon(category)}
                        </ThemeIcon>
                        <Box>
                          <Text size="sm" fw={600}>{ua.achievement?.name || '—'}</Text>
                          <Text size="xs" c="dimmed">{ua.achievement?.description || ''}</Text>
                        </Box>
                      </Group>
                      <Badge color={color} variant="light">
                        +{ua.achievement?.points || 0}
                      </Badge>
                    </Group>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">Получено: {formatDate(ua.earned_at)}</Text>
                      <Group gap="xs">
                        <IconCheck size={12} color="var(--mantine-color-green-6)" />
                        <Text size="xs" c="green">Разблокировано</Text>
                      </Group>
                    </Group>
                  </Paper>
                </MotionDiv>
              );
            })}
          </Stack>
        </ScrollArea>
      )}

      {/* Tips */}
      <Paper p="md" radius="md" mt="md" bg={isDark ? 'dark.6' : 'blue.0'}>
        <Text size="sm" fw={600} mb="sm">Как получить больше достижений?</Text>
        <Stack gap={4}>
          {[
            'Завершите заполнение профиля',
            'Загрузите все необходимые документы',
            'Подайте заявки в университеты',
            'Заходите в систему каждый день',
          ].map((tip) => (
            <Text key={tip} size="xs" c="dimmed">• {tip}</Text>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};

export default AchievementSystem;
