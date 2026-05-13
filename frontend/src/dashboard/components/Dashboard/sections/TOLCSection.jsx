import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  Modal,
  NumberInput,
  ThemeIcon,
} from '@mantine/core';
import {
  IconCalculator,
  IconBrain,
  IconBook,
  IconAtom,
  IconPlayerPlay,
  IconCheck,
  IconClock,
  IconTrophy,
} from '@tabler/icons-react';
import { useDashboardStore } from '../../../../store/dashboardStore';
import { updateProfileComplete, fetchProfile } from '../../../../store/authSlice';
import { educationAPI } from '../../../../shared/services/api';
import IELTSTestRunner from '../components/IELTSTestRunner';

const TOLC_SECTIONS = ['tolc_math', 'tolc_logic', 'tolc_verbal', 'tolc_science'];

const sectionMeta = {
  tolc_math: { label: 'Mathematics', icon: IconCalculator, color: 'blue' },
  tolc_logic: { label: 'Logic', icon: IconBrain, color: 'green' },
  tolc_verbal: { label: 'Verbal', icon: IconBook, color: 'orange' },
  tolc_science: { label: 'Science', icon: IconAtom, color: 'violet' },
};

const TOLCSection = ({ progress }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [opened, setOpened] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(user?.profile?.tolc_current_score || 0);
  const [targetLevel, setTargetLevel] = useState(user?.profile?.tolc_target_score || 0);

  useEffect(() => {
    if (user?.profile) {
      setCurrentLevel(user.profile.tolc_current_score || 0);
      setTargetLevel(user.profile.tolc_target_score || 0);
    }
  }, [user]);

  const tolcProgress = targetLevel > 0
    ? Math.max(0, Math.min(100, Math.round((currentLevel / targetLevel) * 100)))
    : 0;

  const updateProgress = useDashboardStore((s) => s.updateProgress);
  useEffect(() => {
    updateProgress('tolc', tolcProgress);
  }, [tolcProgress, updateProgress]);

  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [testsLoading, setTestsLoading] = useState(false);
  const [runnerTestId, setRunnerTestId] = useState(null);

  const loadTestsAndAttempts = async () => {
    try {
      setTestsLoading(true);
      const [testsRes, attemptsRes] = await Promise.all([
        educationAPI.listIELTSTests().catch(() => ({ data: [] })),
        educationAPI.listIELTSAttempts().catch(() => ({ data: [] })),
      ]);
      const testsData = Array.isArray(testsRes?.data) ? testsRes.data : testsRes?.data?.results || [];
      const attemptsData = Array.isArray(attemptsRes?.data) ? attemptsRes.data : attemptsRes?.data?.results || [];
      setTests(testsData.filter((t) => TOLC_SECTIONS.includes(t.section)));
      setAttempts(attemptsData);
    } finally {
      setTestsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadTestsAndAttempts();
  }, [user]);

  const bestAttemptByTest = useMemo(() => {
    const map = {};
    attempts.forEach((a) => {
      const prev = map[a.test];
      if (!prev || a.band_score > prev.band_score) map[a.test] = a;
    });
    return map;
  }, [attempts]);

  const completedCount = tests.filter((t) => bestAttemptByTest[t.id]).length;

  return (
    <Box p="md">
      <Stack gap="lg">
        <Group justify="space-between">
          <Box>
            <Text size="xl" fw={700} c="dark.9">TOLC Подготовка</Text>
            <Text size="sm" c="dimmed">Тест для поступления в итальянские университеты</Text>
          </Box>
          <Badge color="blue" variant="light" radius="sm" size="lg">
            {tolcProgress}% завершено
          </Badge>
        </Group>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder radius="lg">
              <Stack gap="md">
                <Text size="lg" fw={600}>Текущий балл</Text>
                <Group justify="space-between">
                  <Text size="2xl" fw={700} c="blue">{currentLevel}</Text>
                  <Button size="sm" variant="light" onClick={() => setOpened(true)} radius="md">Изменить</Button>
                </Group>
                <Progress value={(currentLevel / 50) * 100} size="lg" radius="md" color="blue" />
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder radius="lg">
              <Stack gap="md">
                <Text size="lg" fw={600}>Целевой балл</Text>
                <Group justify="space-between">
                  <Text size="2xl" fw={700} c="green">{targetLevel}</Text>
                  <Button size="sm" variant="light" onClick={() => setOpened(true)} radius="md">Изменить</Button>
                </Group>
                <Progress value={(targetLevel / 50) * 100} size="lg" radius="md" color="green" />
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder radius="lg">
              <Stack align="center" gap="sm">
                <ThemeIcon size={48} radius="md" color="green" variant="light">
                  <IconCheck size={26} />
                </ThemeIcon>
                <Text size="xl" fw={700}>{completedCount}</Text>
                <Text size="sm" c="dimmed">Пройдено секций</Text>
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder radius="lg">
              <Stack align="center" gap="sm">
                <ThemeIcon size={48} radius="md" color="blue" variant="light">
                  <IconClock size={26} />
                </ThemeIcon>
                <Text size="xl" fw={700}>{tests.length - completedCount}</Text>
                <Text size="sm" c="dimmed">Осталось секций</Text>
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder radius="lg">
              <Stack align="center" gap="sm">
                <ThemeIcon size={48} radius="md" color="orange" variant="light">
                  <IconTrophy size={26} />
                </ThemeIcon>
                <Text size="xl" fw={700}>{tolcProgress}%</Text>
                <Text size="sm" c="dimmed">Прогресс к цели</Text>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        <Card withBorder radius="lg">
          <Stack gap="md">
            <Text size="lg" fw={600}>Доступные тесты TOLC</Text>
            {testsLoading && tests.length === 0 ? (
              <Text size="sm" c="dimmed">Загружаем тесты…</Text>
            ) : tests.length === 0 ? (
              <Text size="sm" c="dimmed">Тесты пока недоступны.</Text>
            ) : (
              <Stack gap="sm">
                {tests.map((test) => {
                  const meta = sectionMeta[test.section] || { label: test.section, icon: IconBook, color: 'gray' };
                  const SectionIcon = meta.icon;
                  const best = bestAttemptByTest[test.id];
                  const completed = Boolean(best);
                  return (
                    <Paper key={test.id} p="md" withBorder radius="md">
                      <Group justify="space-between" wrap="nowrap">
                        <Group gap="sm" wrap="nowrap" style={{ flex: 1 }}>
                          <ThemeIcon size={40} radius="md" color={meta.color} variant="light">
                            <SectionIcon size={22} />
                          </ThemeIcon>
                          <Box style={{ flex: 1 }}>
                            <Text fw={600} mb={4}>{test.title}</Text>
                            <Group gap="xs">
                              <Badge color={meta.color} variant="light" radius="sm">{meta.label}</Badge>
                              <Badge color="blue" variant="light" radius="sm">{test.duration_minutes} мин</Badge>
                              <Badge color="gray" variant="light" radius="sm">{test.questions_count} вопросов</Badge>
                              {completed && (
                                <Badge color="green" variant="filled" radius="sm">
                                  Band {best.band_score.toFixed(1)} ({best.score}/{best.total})
                                </Badge>
                              )}
                            </Group>
                          </Box>
                        </Group>
                        <Button
                          size="sm"
                          leftSection={<IconPlayerPlay size={16} />}
                          radius="md"
                          onClick={() => setRunnerTestId(test.id)}
                        >
                          {completed ? 'Пройти ещё раз' : 'Начать'}
                        </Button>
                      </Group>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Stack>
        </Card>

        <IELTSTestRunner
          testId={runnerTestId}
          opened={Boolean(runnerTestId)}
          onClose={() => setRunnerTestId(null)}
          onCompleted={() => loadTestsAndAttempts()}
        />

        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          title="Изменение балла TOLC"
          size="md"
          centered
        >
          <Stack gap="md">
            <NumberInput label="Текущий балл" value={currentLevel} onChange={setCurrentLevel} min={0} max={50} step={0.5} />
            <NumberInput label="Целевой балл" value={targetLevel} onChange={setTargetLevel} min={0} max={50} step={0.5} />
            <Group justify="flex-end">
              <Button variant="light" onClick={() => setOpened(false)}>Отмена</Button>
              <Button onClick={async () => {
                try {
                  await dispatch(updateProfileComplete({
                    tolc_current_score: currentLevel,
                    tolc_target_score: targetLevel,
                  })).unwrap();
                  await dispatch(fetchProfile());
                } catch (e) {
                  console.error('Failed to save TOLC scores', e);
                } finally {
                  setOpened(false);
                }
              }}>Сохранить</Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Box>
  );
};

export default TOLCSection;
