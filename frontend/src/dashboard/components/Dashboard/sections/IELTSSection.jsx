import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import React, { useState } from 'react';
import { useDashboardStore } from '../../../../store/dashboardStore';
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
  TextInput,
  NumberInput
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { 
  IconPlayerPlay,   
  IconEye, 
  IconBook, 
  IconTarget, 
  IconClock,
  IconTrophy,
  IconArrowRight,
  IconCheck,
  IconX
} from '@tabler/icons-react';
import { updateProfileComplete, fetchProfile } from '../../../../store/authSlice';
import { educationAPI } from '../../../../shared/services/api';

const IELTSSection = ({ progress }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  // Важно: выбираем значения из zustand по отдельности, чтобы избежать бесконечных перерисовок
  const _userData = useDashboardStore((s) => s.userData);

  // Обновляем данные при изменении пользователя
  useEffect(() => {
    if (user?.profile) {
      setCurrentLevel(user.profile.ielts_current_score || 0);
      setTargetLevel(user.profile.ielts_target_score || 0);
    }
  }, [user]);
  const [opened, setOpened] = useState(false);
  const [certModal, setCertModal] = useState(false);
  const [certFile, setCertFile] = useState(null);
  const [certDoc, setCertDoc] = useState(null); // документ из БД
  const [certLoading, setCertLoading] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(user?.profile?.ielts_current_score || 0);
  const [targetLevel, setTargetLevel] = useState(user?.profile?.ielts_target_score || 0);

  const attachSignedUrl = async (document) => {
    if (!document?.id) {
      return document;
    }

    try {
      const response = await educationAPI.getDocumentSignedUrl(document.id);
      const signedUrl = response?.data?.signed_url;
      return signedUrl ? { ...document, file_url: signedUrl } : document;
    } catch {
      return document;
    }
  };

  // Реальный прогресс: доля текущего уровня к целевому (0-100)
  const _overallProgress = progress?.overallProgress || 0;
  const ieltsProgress = targetLevel > 0
    ? Math.max(0, Math.min(100, Math.round((currentLevel / targetLevel) * 100)))
    : 0;

  // Синхронизация с глобальным стором (для консистентности в других частях UI)
  const updateProgress = useDashboardStore((s) => s.updateProgress);
  useEffect(() => {
    updateProgress('ielts', ieltsProgress);
  }, [ieltsProgress, updateProgress]);

  // Цветовая схема (для замены светлых градиентов на surface в dark)
  const isDark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-mantine-color-scheme') === 'dark';
  const surfaceStyle = { background: 'var(--app-color-surface)' };
  const greenCardStyle = {
    backgroundColor: isDark ? 'color-mix(in srgb, var(--mantine-color-green-6), transparent 85%)' : 'var(--mantine-color-green-0)',
    border: `1px solid ${isDark ? 'color-mix(in srgb, var(--mantine-color-green-6), transparent 60%)' : 'var(--mantine-color-green-2)'}`
  };
  const blueCardStyle = {
    backgroundColor: isDark ? 'color-mix(in srgb, var(--mantine-color-blue-6), transparent 85%)' : 'var(--mantine-color-blue-0)',
    border: `1px solid ${isDark ? 'color-mix(in srgb, var(--mantine-color-blue-6), transparent 60%)' : 'var(--mantine-color-blue-2)'}`
  };
  const orangeCardStyle = {
    backgroundColor: isDark ? 'color-mix(in srgb, var(--mantine-color-orange-6), transparent 85%)' : 'var(--mantine-color-orange-0)',
    border: `1px solid ${isDark ? 'color-mix(in srgb, var(--mantine-color-orange-6), transparent 60%)' : 'var(--mantine-color-orange-2)'}`
  };
  const purpleCardStyle = {
    backgroundColor: isDark ? 'color-mix(in srgb, var(--mantine-color-violet-6, #7c3aed), transparent 85%)' : 'var(--mantine-color-purple-0)',
    border: `1px solid ${isDark ? 'color-mix(in srgb, var(--mantine-color-violet-6, #7c3aed), transparent 60%)' : 'var(--mantine-color-violet-2, #e9d8fd)'}`
  };

  // Генерируем тесты на основе данных пользователя
  const userTests = user?.profile ? [
    {
      id: 1,
      title: 'IELTS Academic Test 1',
      duration: '2 часа 45 минут',
      difficulty: 'Средний',
      score: user.profile.ielts_current_score || null,
      status: user.profile.ielts_current_score ? 'completed' : 'available'
    },
    {
      id: 2,
      title: 'IELTS Academic Test 2',
      duration: '2 часа 45 минут',
      difficulty: 'Сложный',
      score: null,
      status: 'locked'
    },
    {
      id: 3,
      title: 'IELTS Academic Test 3',
      duration: '2 часа 45 минут',
      difficulty: 'Сложный',
      score: null,
      status: 'locked'
    }
  ] : [];

  const completedTests = userTests.filter(test => test.status === 'completed').length;
  const totalTests = userTests.length;
  const testProgress = Math.round((completedTests / totalTests) * 100);

  // Дата экзамена из БД
  const examDateStr = user?.profile?.ielts_exam_date || null;
  const examDate = examDateStr ? new Date(examDateStr) : null;
  const today = new Date();
  // normalize dates to UTC midnight to avoid tz drift
  const daysUntilExam = examDate 
    ? Math.max(0, Math.ceil((Date.UTC(examDate.getFullYear(), examDate.getMonth(), examDate.getDate()) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / (1000 * 60 * 60 * 24)))
    : null;
  const [examModal, setExamModal] = useState(false);
  const [examInput, setExamInput] = useState(examDate || null);

  // Подтягиваем документы пользователя и ищем языковой сертификат
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        setCertLoading(true);
        const res = await educationAPI.listDocuments();
        const docs = Array.isArray(res?.data) ? res.data : res?.data?.results || [];
        const langCert = docs.find((d) => d.document_type === 'language_certificate');
        setCertDoc(langCert ? await attachSignedUrl(langCert) : null);
      } catch (e) {
        console.error('Failed to load documents', e);
      } finally {
        setCertLoading(false);
      }
    };
    load();
  }, [user]);

  return (
    <Box p="md">
      <Stack gap="lg">
        {/* Заголовок секции */}
        <Group justify="space-between">
          <Box>
            <Text size="xl" fw={800} style={{
              background: 'linear-gradient(90deg, #1e3a8a 0%, #0ea5e9 50%, #14b8a6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>IELTS Подготовка</Text>
            <Text size="sm" c="dimmed">
              Подготовка к международному экзамену
            </Text>
          </Box>
          <Badge color="blue" variant="light" size="lg" radius="sm">
            {ieltsProgress}% завершено
          </Badge>
        </Group>

        {/* Текущий и целевой уровень */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder shadow="md" radius="lg" style={surfaceStyle}>
              <Stack gap="md">
                <Text size="lg" fw={600}>Текущий уровень</Text>
                <Group justify="space-between">
                  <Text size="2xl" fw={700} c="blue">{currentLevel}</Text>
                  <Button size="sm" variant="light" onClick={() => setOpened(true)} radius="md">Изменить</Button>
                </Group>
                <Progress value={(currentLevel / 9) * 100} size="lg" radius="md" color="blue" />
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder shadow="md" radius="lg" style={surfaceStyle}>
              <Stack gap="md">
                <Text size="lg" fw={600}>Целевой уровень</Text>
                <Group justify="space-between">
                  <Text size="2xl" fw={700} c="green">{targetLevel}</Text>
                  <Button size="sm" variant="light" onClick={() => setOpened(true)} radius="md">Изменить</Button>
                </Group>
                <Progress value={(targetLevel / 9) * 100} size="lg" radius="md" color="green" />
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Общий прогресс */}
        <Card withBorder shadow="md" radius="lg" style={surfaceStyle}>
          <Stack gap="md">
            <Group justify="space-between">
              <Text size="lg" fw={600}>
                Общий прогресс подготовки
              </Text>
              <Text size="sm" c="dimmed">
                {ieltsProgress}% завершено
              </Text>
            </Group>
            <Progress
              value={ieltsProgress}
              size="lg"
              radius="md"
              color="blue"
              animated
            />
          </Stack>
        </Card>

        {/* Сертификат IELTS */}
        <Card withBorder shadow="md" radius="lg" style={surfaceStyle}>
          <Stack gap="md">
            <Group justify="space-between">
              <Box>
                <Text size="lg" fw={600}>Сертификат IELTS</Text>
                <Text size="sm" c="dimmed">Добавьте свой сертификат или проверьте статус</Text>
              </Box>
              {certLoading ? (
                <Badge color="gray" variant="light" radius="sm">Проверяем…</Badge>
              ) : certDoc ? (
                <Badge color="green" variant="light" radius="sm">Добавлен</Badge>
              ) : (
                <Badge color="gray" variant="light" radius="sm">Не добавлен</Badge>
              )}
            </Group>

            {certDoc ? (
              <Group justify="space-between" align="center">
                <Text size="sm">Сертификат добавлен.</Text>
                <Group>
                  {certDoc.file_url && (
                    <Button
                      component="a"
                      href={certDoc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      leftSection={<IconEye size={16} />}
                      variant="light"
                      radius="md"
                    >
                      Просмотреть
                    </Button>
                  )}
                  <Button
                    variant="light"
                    color="red"
                    onClick={async () => {
                      try {
                        if (!certDoc?.id) return;
                        await educationAPI.deleteDocument(certDoc.id);
                        setCertDoc(null);
                      } catch (e) {
                        console.error('Failed to delete certificate', e);
                      }
                    }}
                    radius="md"
                  >
                    Удалить
                  </Button>
                </Group>
              </Group>
            ) : (
              <Group justify="flex-end">
                <Button onClick={() => setCertModal(true)} radius="md">
                  Добавить сертификат
                </Button>
              </Group>
            )}
          </Stack>
        </Card>

        {/* Статистика */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card className="h-full" style={greenCardStyle} radius="lg" shadow="sm">
              <Stack align="center" gap="sm">
                <IconCheck size={48} color="var(--mantine-color-green-6)" />
                <Text size="lg" fw={700} c="green">
                  {completedTests}
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  Пройдено тестов
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card className="h-full" style={blueCardStyle} radius="lg" shadow="sm">
              <Stack align="center" gap="sm">
                <IconBook size={48} color="var(--mantine-color-blue-6)" />
                <Text size="lg" fw={700} c="blue">
                  {totalTests - completedTests}
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  Осталось тестов
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card className="h-full" style={orangeCardStyle} radius="lg" shadow="sm">
              <Stack align="center" gap="sm">
                <IconClock size={48} color="var(--mantine-color-orange-6)" />
                <Group gap={6} align="center">
                  <Text size="lg" fw={700} c="orange">
                    {daysUntilExam === null ? '—' : daysUntilExam}
                  </Text>
                  <Button size="xs" variant="light" onClick={() => setExamModal(true)} radius="md">
                    Указать дату
                  </Button>
                </Group>
                <Text size="sm" c="dimmed" ta="center">Дней до экзамена</Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card className="h-full" style={purpleCardStyle} radius="lg" shadow="sm">
              <Stack align="center" gap="sm">
                <IconTrophy size={48} color="var(--mantine-color-purple-6)" />
                <Text size="lg" fw={700} c="purple">
                  {testProgress}%
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  Прогресс тестов
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Список тестов */}
        <Card withBorder shadow="md" radius="lg" style={surfaceStyle}>
          <Stack gap="md">
            <Text size="lg" fw={600}>
              Доступные тесты
            </Text>
            <Stack gap="sm">
              {userTests.map((test) => (
                <Paper
                  key={test.id}
                  p="md"
                  withBorder
                  radius="md"
                  shadow="xs"
                  style={{
                    backgroundColor: test.status === 'completed' 
                      ? (isDark ? 'color-mix(in srgb, var(--mantine-color-green-6), transparent 85%)' : 'var(--mantine-color-green-0)') 
                      : test.status === 'locked'
                      ? (isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-1)')
                      : (isDark ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-gray-0)')
                  }}
                >
                  <Group justify="space-between">
                    <Box style={{ flex: 1 }}>
                      <Text fw={600} mb="xs">
                        {test.title}
                      </Text>
                      <Group gap="md" mb="sm">
                        <Badge color="blue" variant="light" radius="sm">
                          {test.duration}
                        </Badge>
                        <Badge 
                          color={test.difficulty === 'Сложный' ? 'red' : 'yellow'} 
                          variant="light"
                          radius="sm"
                        >
                          {test.difficulty}
                        </Badge>
                        {test.score && (
                          <Badge color="green" variant="light" radius="sm">
                            {test.score} баллов
                          </Badge>
                        )}
                      </Group>
                    </Box>
                    <Group gap="sm">
                      {test.status === 'completed' ? (
                        <Badge color="green" variant="light" radius="sm">
                          Завершено
                        </Badge>
                      ) : test.status === 'locked' ? (
                        <Badge color="gray" variant="light" radius="sm">
                          Заблокировано
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          leftSection={<IconPlayerPlay size={16} />}
                          radius="md"
                        >
                          Начать
                        </Button>
                      )}
                    </Group>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Stack>
        </Card>

        {/* Модальное окно изменения уровня */}
        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          title="Изменение уровня"
          size="md"
          centered
          overlayProps={{ backgroundOpacity: 0.45, blur: 3 }}
          transitionProps={{ transition: 'pop', duration: 200 }}
        >
          <Stack gap="md">
            <NumberInput
              label="Текущий уровень"
              value={currentLevel}
              onChange={setCurrentLevel}
              min={0}
              max={9}
              step={0.5}
              precision={1}
            />
            <NumberInput
              label="Целевой уровень"
              value={targetLevel}
              onChange={setTargetLevel}
              min={0}
              max={9}
              step={0.5}
              precision={1}
            />
            <Group justify="flex-end" gap="sm">
              <Button
                variant="light"
                onClick={() => setOpened(false)}
                radius="md"
              >
                Отмена
              </Button>
              <Button onClick={async () => {
                try {
                  await dispatch(updateProfileComplete({
                    ielts_current_score: currentLevel,
                    ielts_target_score: targetLevel,
                  })).unwrap();
                  await dispatch(fetchProfile());
                } catch (e) {
                  console.error('Failed to save IELTS levels', e);
                } finally {
                  setOpened(false);
                }
              }} radius="md">Сохранить</Button>
            </Group>
          </Stack>
        </Modal>

        {/* Модальное окно добавления сертификата */}
        <Modal
          opened={certModal}
          onClose={() => setCertModal(false)}
          title="Добавление сертификата IELTS"
          size="md"
          centered
          overlayProps={{ backgroundOpacity: 0.45, blur: 3 }}
          transitionProps={{ transition: 'pop', duration: 200 }}
        >
          <Stack gap="md">
            <Text size="sm" c="dimmed">Загрузите PDF сертификата (только .pdf)</Text>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const f = e.currentTarget.files?.[0] || null;
                if (f && f.type !== 'application/pdf') return;
                setCertFile(f);
              }}
            />
            <Group justify="flex-end" gap="sm">
              <Button variant="light" onClick={() => setCertModal(false)} radius="md">Отмена</Button>
              <Button
                onClick={async () => {
                  if (!certFile) return;
                  try {
                    setCertLoading(true);
                    const res = await educationAPI.uploadDocument({ file: certFile, name: 'IELTS Certificate', description: 'IELTS PDF' });
                    const doc = res?.data;
                    setCertDoc(doc ? await attachSignedUrl(doc) : null);
                    setCertModal(false);
                  } catch (e) {
                    console.error('Upload failed', e);
                  } finally {
                    setCertLoading(false);
                  }
                }}
                radius="md"
              >
                Сохранить
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* Модалка даты экзамена */}
        <Modal
          opened={examModal}
          onClose={() => setExamModal(false)}
          title="Дата экзамена IELTS"
          size="md"
          centered
          overlayProps={{ backgroundOpacity: 0.45, blur: 3 }}
          transitionProps={{ transition: 'pop', duration: 200 }}
        >
          <Stack gap="md">
            <DateInput
              value={examInput}
              onChange={setExamInput}
              label="Дата экзамена"
              valueFormat="YYYY-MM-DD"
              placeholder="Выберите дату"
              clearable
            />
            <Group justify="flex-end" gap="sm">
              <Button variant="light" onClick={() => setExamModal(false)} radius="md">Отмена</Button>
              <Button
                onClick={async () => {
                  let selected = null;
                  if (examInput) {
                    if (examInput instanceof Date) {
                      selected = examInput;
                    } else if (typeof examInput === 'string') {
                      const parsed = new Date(examInput);
                      if (!isNaN(parsed.getTime())) selected = parsed;
                    }
                  }

                  const iso = selected
                    ? new Date(Date.UTC(selected.getFullYear(), selected.getMonth(), selected.getDate()))
                        .toISOString()
                        .slice(0, 10)
                    : null;

                  try {
                    await dispatch(updateProfileComplete({ ielts_exam_date: iso })).unwrap();
                    await dispatch(fetchProfile());
                  } catch (e) {
                    console.error('Failed to save exam date', e);
                  }
                  setExamModal(false);
                }}
                radius="md"
              >
                Сохранить
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Box>
  );
};

export default IELTSSection;
