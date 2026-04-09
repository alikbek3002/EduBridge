import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import React, { useState } from 'react';
import { 
  Box, 
  Stack, 
  Text, 
  Paper, 
  Group, 
  Card, 
  Progress, 
  Button,
  Grid,
  Badge,
  Tabs,
  List,
  ActionIcon,
  Modal,
  NumberInput
} from '@mantine/core';
import { useDashboardStore } from '../../../../store/dashboardStore';
import { 
  IconPlayerPlay, 
  IconEye, 
  IconBook, 
  IconTarget, 
  IconClock,
  IconTrophy,
  IconArrowRight,
  IconCheck,
  IconCalculator
} from '@tabler/icons-react';
import { updateProfileComplete, fetchProfile } from '../../../../store/authSlice';

const TOLCSection = ({ progress }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Обновляем данные при изменении пользователя
  useEffect(() => {
    if (user?.profile) {
      setCurrentLevel(user.profile.tolc_current_score || 0);
      setTargetLevel(user.profile.tolc_target_score || 0);
    }
  }, [user]);
  const [opened, setOpened] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(user?.profile?.tolc_current_score || 0);
  const [targetLevel, setTargetLevel] = useState(user?.profile?.tolc_target_score || 0);
  // Извлекаем значения из объекта progress
  // Реальный прогресс TOLC: текущий балл / целевой балл
  const tolcProgress = targetLevel > 0
    ? Math.max(0, Math.min(100, Math.round((currentLevel / targetLevel) * 100)))
    : 0;
  const _overallProgress = progress?.overallProgress || 0;

  // Синхронизируем прогресс с глобальным дашборд-стором
  const updateProgress = useDashboardStore((s) => s.updateProgress);
  useEffect(() => {
    updateProgress('tolc', tolcProgress);
  }, [tolcProgress, updateProgress]);

  // Тёмная тема: нейтральные surface-стили и палитры
  const isDark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-mantine-color-scheme') === 'dark';
  const surfaceStyle = { background: 'var(--app-color-surface)' };
  const blueCardStyle = {
    backgroundColor: isDark ? 'color-mix(in srgb, var(--mantine-color-blue-6), transparent 85%)' : 'var(--mantine-color-blue-0)',
    border: `1px solid ${isDark ? 'color-mix(in srgb, var(--mantine-color-blue-6), transparent 60%)' : 'var(--mantine-color-blue-2)'}`
  };

  // Генерируем тесты на основе данных пользователя
  const userTests = user?.profile ? [
    {
      id: 1,
      title: 'TOLC-I Test 1',
      duration: '1 час 30 минут',
      difficulty: 'Средний',
      score: user.profile.tolc_current_score || null,
      status: user.profile.tolc_current_score ? 'completed' : 'available',
      sections: ['Математика', 'Логика', 'Наука']
    },
    {
      id: 2,
      title: 'TOLC-I Test 2',
      duration: '1 час 30 минут',
      difficulty: 'Сложный',
      score: null,
      status: 'locked',
      sections: ['Математика', 'Логика', 'Наука']
    },
    {
      id: 3,
      title: 'TOLC-I Test 3',
      duration: '1 час 30 минут',
      difficulty: 'Легкий',
      score: null,
      status: 'locked',
      sections: ['Математика', 'Логика', 'Наука']
    }
  ] : [];

  const videoLessons = [
    {
      id: 1,
      title: 'Математика: Алгебра и функции',
      duration: '20 минут',
      category: 'Математика',
      completed: true
    },
    {
      id: 2,
      title: 'Логика: Анализ текста',
      duration: '18 минут',
      category: 'Логика',
      completed: true
    },
    {
      id: 3,
      title: 'Наука: Физика и химия',
      duration: '25 минут',
      category: 'Наука',
      completed: false
    },
    {
      id: 4,
      title: 'Стратегии решения задач',
      duration: '15 минут',
      category: 'Общее',
      completed: false
    }
  ];

  const skills = [
    { name: 'Математика', current: 0, target: 20, color: 'blue' },
    { name: 'Логика', current: 0, target: 20, color: 'green' },
    { name: 'Наука', current: 0, target: 20, color: 'purple' }
  ];

  return (
    <Box className="p-6">
      <Stack gap="xl">
        {/* Header */}
        <Box>
          <Text size="xl" fw={800} style={{
            background: 'linear-gradient(90deg, #1e3a8a 0%, #0ea5e9 50%, #14b8a6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Подготовка к TOLC
          </Text>
          <Text size="md" c="dimmed">
            Итальянский тест для поступления в университеты
          </Text>
        </Box>

        {/* Progress Overview */}
        <Paper className="p-6" shadow="md" radius="lg" style={surfaceStyle}>
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="md">
                <Group justify="space-between" align="center">
                  <Text size="lg" fw={600}>
                    Текущий балл: {currentLevel} → Цель: {targetLevel}
                  </Text>
                  <Button
                    variant="light"
                    color="blue"
                    onClick={() => setOpened(true)}
                    leftSection={<IconTarget size={16} />}
                    radius="md"
                  >
                    Установить цели
                  </Button>
                </Group>
                <Progress
                  value={targetLevel > 0 ? (currentLevel / targetLevel) * 100 : 0}
                  color="blue"
                  size="xl"
                  className="mb-2"
                />
                <Text size="sm" c="dimmed">
                  {targetLevel > 0 ? `Осталось набрать ${targetLevel - currentLevel} баллов до цели` : 'Установите целевую оценку'}
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card className="h-full" style={blueCardStyle} radius="lg" shadow="sm">
                <Stack align="center" gap="sm">
                  <IconCalculator size={48} color="var(--mantine-color-blue-6)" />
                  <Text size="lg" fw={700} c="blue">
                    {tolcProgress}%
                  </Text>
                  <Text size="sm" c="dimmed" ta="center">
                    Общий прогресс подготовки
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Skills Breakdown */}
        <Paper className="p-6" shadow="md" radius="lg" style={surfaceStyle}>
          <Text size="lg" fw={600} className="mb-4">
            Прогресс по разделам
          </Text>
          <Grid>
            {skills.map((skill, index) => (
              <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4 }}>
                <Card shadow="sm" padding="lg" radius="lg" withBorder style={surfaceStyle}>
                  <Stack gap="md">
                    <Text size="md" fw={600}>
                      {skill.name}
                    </Text>
                    <Box>
                      <Group justify="space-between" className="mb-2">
                        <Text size="sm" c="dimmed">
                          Текущий: {skill.current}
                        </Text>
                        <Text size="sm" c="dimmed">
                          Цель: {skill.target}
                        </Text>
                      </Group>
                      <Progress
                        value={skill.target > 0 ? (skill.current / skill.target) * 100 : 0}
                        color={skill.color}
                        size="md"
                      />
                    </Box>
                    <Badge
                      color={skill.current >= skill.target ? 'green' : 'yellow'}
                      variant="light"
                    >
                      {skill.current >= skill.target ? 'Достигнуто' : 'В процессе'}
                    </Badge>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Paper>

        {/* Tabs for different content */}
        <Tabs defaultValue="tests">
          <Tabs.List>
            <Tabs.Tab value="tests" leftSection={<IconBook size={16} />}>
              Mock-тесты
            </Tabs.Tab>
            <Tabs.Tab value="videos" leftSection={<IconPlayerPlay size={16} />}>
              Видео-уроки
            </Tabs.Tab>
            <Tabs.Tab value="practice" leftSection={<IconTarget size={16} />}>
              Практика
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="tests" className="mt-6">
            <Stack gap="md">
              <Text size="lg" fw={600}>
                Доступные тесты TOLC-I
              </Text>
              <Grid>
                {userTests.map((test) => (
                  <Grid.Col key={test.id} span={{ base: 12, md: 6 }}>
                    <Card shadow="md" padding="lg" radius="lg" withBorder style={surfaceStyle}>
                      <Stack gap="md">
                        <Group justify="space-between" align="flex-start">
                          <Box>
                            <Text size="md" fw={600}>
                              {test.title}
                            </Text>
                            <Text size="sm" c="dimmed">
                              {test.duration} • {test.difficulty}
                            </Text>
                            <Text size="xs" c="dimmed" className="mt-1">
                              Разделы: {test.sections.join(', ')}
                            </Text>
                          </Box>
                          {test.score && (
                            <Badge color="green" variant="light" radius="sm">
                              {test.score} баллов
                            </Badge>
                          )}
                        </Group>
                        {test.status === 'completed' && (
                          <Group>
                            <IconCheck size={16} color="green" />
                            <Text size="sm" c="green">
                              Тест завершен
                            </Text>
                          </Group>
                        )}
                        <Button
                          leftSection={test.status === 'completed' ? <IconEye size={16} /> : <IconPlayerPlay size={16} />}
                          color={test.status === 'completed' ? 'blue' : 'green'}
                          variant={test.status === 'completed' ? 'outline' : 'filled'}
                          disabled={test.status === 'locked'}
                          fullWidth
                          radius="md"
                        >
                          {test.status === 'completed' ? 'Просмотреть результаты' :
                           test.status === 'locked' ? 'Заблокировано' : 'Начать тест'}
                        </Button>
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="videos" className="mt-6">
            <Stack gap="md">
              <Text size="lg" fw={600}>
                Видео-уроки TOLC
              </Text>
              <Stack gap="sm">
                {videoLessons.map((lesson) => (
                  <Card key={lesson.id} shadow="sm" padding="md" radius="lg" withBorder style={surfaceStyle}>
                    <Group justify="space-between" align="center">
                      <Group>
                        <ActionIcon
                          color={lesson.completed ? 'green' : 'blue'}
                          variant={lesson.completed ? 'filled' : 'light'}
                          size="lg"
                        >
                          {lesson.completed ? <IconCheck size={20} /> : <IconPlayerPlay size={20} />}
                        </ActionIcon>
                        <Box>
                          <Text size="md" fw={500}>
                            {lesson.title}
                          </Text>
                          <Text size="sm" c="dimmed">
                            {lesson.category} • {lesson.duration}
                          </Text>
                        </Box>
                      </Group>
                      <Button
                        leftSection={<IconEye size={16} />}
                        color="blue"
                        variant="outline"
                        size="sm"
                        radius="md"
                      >
                        Просмотреть
                      </Button>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="practice" className="mt-6">
            <Stack gap="md">
              <Text size="lg" fw={600}>
                Дополнительная практика
              </Text>
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Card shadow="sm" padding="lg" radius="lg" withBorder style={surfaceStyle}>
                    <Stack gap="md">
                      <Group>
                        <IconBook size={24} color="var(--mantine-color-blue-6)" />
                        <Text size="md" fw={600}>
                          Задачи по математике
                        </Text>
                      </Group>
                      <Text size="sm" c="dimmed">
                        Практические задания по алгебре, геометрии и анализу
                      </Text>
                      <Button color="blue" variant="outline" fullWidth radius="md">
                        Начать практику
                      </Button>
                    </Stack>
                  </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Card shadow="sm" padding="lg" radius="lg" withBorder style={surfaceStyle}>
                    <Stack gap="md">
                      <Group>
                        <IconTarget size={24} color="var(--mantine-color-green-6)" />
                        <Text size="md" fw={600}>
                          Логические задачи
                        </Text>
                      </Group>
                      <Text size="sm" c="dimmed">
                        Упражнения на развитие логического мышления
                      </Text>
                      <Button color="green" variant="outline" fullWidth radius="md">
                        Начать практику
                      </Button>
                    </Stack>
                  </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Card shadow="sm" padding="lg" radius="lg" withBorder style={surfaceStyle}>
                    <Stack gap="md">
                      <Group>
                        <IconCalculator size={24} color="var(--mantine-color-purple-6)" />
                        <Text size="md" fw={600}>
                          Научные задачи
                        </Text>
                      </Group>
                      <Text size="sm" c="dimmed">
                        Задачи по физике, химии и биологии
                      </Text>
                      <Button color="purple" variant="outline" fullWidth radius="md">
                        Начать практику
                      </Button>
                    </Stack>
                  </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Card shadow="sm" padding="lg" radius="lg" withBorder style={surfaceStyle}>
                    <Stack gap="md">
                      <Group>
                        <IconClock size={24} color="var(--mantine-color-orange-6)" />
                        <Text size="md" fw={600}>
                          Тайм-менеджмент
                        </Text>
                      </Group>
                      <Text size="sm" c="dimmed">
                        Стратегии эффективного использования времени на тесте
                      </Text>
                      <Button color="orange" variant="outline" fullWidth radius="md">
                        Изучить стратегии
                      </Button>
                    </Stack>
                  </Card>
                </Grid.Col>
              </Grid>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Modal for setting goals */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Установить цели TOLC"
        size="md"
        centered
        overlayProps={{ backgroundOpacity: 0.45, blur: 3 }}
        transitionProps={{ transition: 'pop', duration: 200 }}
      >
        <Stack gap="md">
          <NumberInput
            label="Текущий балл"
            value={currentLevel}
            onChange={setCurrentLevel}
            min={0}
            max={50}
            step={1}
          />
          <NumberInput
            label="Целевой балл"
            value={targetLevel}
            onChange={setTargetLevel}
            min={0}
            max={50}
            step={1}
          />
          <Group justify="flex-end" gap="sm">
            <Button variant="light" onClick={() => setOpened(false)} radius="md">Отмена</Button>
            <Button
              onClick={async () => {
                try {
                  await dispatch(updateProfileComplete({
                    tolc_current_score: currentLevel,
                    tolc_target_score: targetLevel,
                  })).unwrap();
                  await dispatch(fetchProfile());
                } catch (e) {
                  console.error('Failed to save TOLC levels', e);
                } finally {
                  setOpened(false);
                }
              }}
              radius="md"
            >
              Сохранить цели
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
};

export default TOLCSection;

