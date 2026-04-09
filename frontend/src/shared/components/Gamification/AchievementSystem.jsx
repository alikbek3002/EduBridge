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
  Progress,
  Grid
} from '@mantine/core';
import { 
  IconTrophy, 
  IconStar, 
  IconFlame,
  IconRefresh,
  IconAlertCircle,
  IconCheck,
  IconLock
} from '@tabler/icons-react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

const AchievementSystem = ({ 
  userProgress: _userProgress, 
  achievements = [], 
  loading = false, 
  error = null,
  onAchievementUnlocked: _onAchievementUnlocked,
  onRefresh
}) => {
  void _userProgress;
  void _onAchievementUnlocked;
  const getAchievementIcon = (type) => {
    switch (type) {
      case 'profile_completed': return <IconCheck size={20} />;
      case 'ielts_passed': return <IconStar size={20} />;
      case 'tolc_passed': return <IconStar size={20} />;
      case 'university_applied': return <IconTrophy size={20} />;
      case 'document_uploaded': return <IconCheck size={20} />;
      case 'visa_obtained': return <IconTrophy size={20} />;
      case 'streak_7': return <IconFlame size={20} />;
      case 'streak_30': return <IconFlame size={20} />;
      default: return <IconTrophy size={20} />;
    }
  };

  const getAchievementColor = (type) => {
    switch (type) {
      case 'profile_completed': return 'green';
      case 'ielts_passed': return 'blue';
      case 'tolc_passed': return 'purple';
      case 'university_applied': return 'yellow';
      case 'document_uploaded': return 'cyan';
      case 'visa_obtained': return 'red';
      case 'streak_7': return 'orange';
      case 'streak_30': return 'pink';
      default: return 'gray';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  // Группируем достижения по типам
  const achievementsByType = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.achievement_type]) {
      acc[achievement.achievement_type] = [];
    }
    acc[achievement.achievement_type].push(achievement);
    return acc;
  }, {});

  const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points, 0);

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
          Достижения
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

      {/* Общая статистика */}
      <Paper p="md" radius="md" mb="md" style={{ backgroundColor: 'var(--mantine-color-yellow-0)' }}>
        <Group justify="space-between" mb="sm">
          <Text size="sm" fw={600}>
            Общий прогресс
          </Text>
          <Badge color="yellow" size="lg">
            {totalPoints} очков
          </Badge>
        </Group>
        
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Достижений получено
          </Text>
          <Badge color="green" variant="light">
            {achievements.length}
          </Badge>
        </Group>
      </Paper>

      {achievements.length === 0 ? (
        <Paper p="xl" radius="md" style={{ textAlign: 'center' }}>
          <IconTrophy size={48} color="var(--mantine-color-gray-4)" />
          <Text size="sm" c="dimmed" mt="md">
            Пока нет достижений
          </Text>
          <Text size="xs" c="dimmed" mt="xs">
            Выполняйте шаги поступления, чтобы получить достижения
          </Text>
        </Paper>
      ) : (
        <ScrollArea style={{ height: '400px' }}>
          <Stack gap="md">
            {Object.entries(achievementsByType).map(([type, typeAchievements]) => (
              <Box key={type}>
                <Text size="sm" fw={600} mb="sm" c="dimmed">
                  {type.replace(/_/g, ' ').toUpperCase()}
                </Text>
                
                <Stack gap="sm">
                  {typeAchievements.map((achievement, index) => (
                    <MotionDiv
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Paper
                        p="md"
                        radius="md"
                        style={{
                          backgroundColor: 'var(--mantine-color-gray-0)',
                          borderLeft: `3px solid var(--mantine-color-${getAchievementColor(achievement.achievement_type)}-6)`
                        }}
                      >
                        <Group justify="space-between" mb="sm">
                          <Group gap="sm">
                            <Avatar
                              color={getAchievementColor(achievement.achievement_type)}
                              radius="xl"
                              size="md"
                            >
                              {getAchievementIcon(achievement.achievement_type)}
                            </Avatar>
                            
                            <Box>
                              <Text size="sm" fw={600}>
                                {achievement.title}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {achievement.description}
                              </Text>
                            </Box>
                          </Group>
                          
                          <Badge 
                            color={getAchievementColor(achievement.achievement_type)}
                            variant="light"
                          >
                            +{achievement.points}
                          </Badge>
                        </Group>
                        
                        <Group justify="space-between">
                          <Text size="xs" c="dimmed">
                            Получено: {formatDate(achievement.unlocked_at)}
                          </Text>
                          
                          <Group gap="xs">
                            <IconCheck size={12} color="var(--mantine-color-green-6)" />
                            <Text size="xs" c="green">
                              Разблокировано
                            </Text>
                          </Group>
                        </Group>
                      </Paper>
                    </MotionDiv>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        </ScrollArea>
      )}

      {/* Рекомендации для получения достижений */}
      <Paper p="md" radius="md" mt="md" style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
        <Text size="sm" fw={600} mb="sm">
          Как получить больше достижений?
        </Text>
        
        <Stack gap="xs">
          <Text size="xs" c="dimmed">
            • Завершите заполнение профиля
          </Text>
          <Text size="xs" c="dimmed">
            • Загрузите все необходимые документы
          </Text>
          <Text size="xs" c="dimmed">
            • Подайте заявки в университеты
          </Text>
          <Text size="xs" c="dimmed">
            • Заходите в систему каждый день
          </Text>
        </Stack>
      </Paper>
    </Box>
  );
};

export default AchievementSystem;
