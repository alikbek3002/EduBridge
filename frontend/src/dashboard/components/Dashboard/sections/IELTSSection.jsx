import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useMemo, useState } from 'react';
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
  NumberInput,
  ThemeIcon,
  SimpleGrid,
  Tooltip,
} from '@mantine/core';
import {
  IconHeadphones,
  IconBook,
  IconPencil,
  IconMicrophone2,
  IconBulb,
  IconPlayerPlay,
  IconEye,
  IconTarget,
  IconClock,
  IconTrophy,
  IconArrowRight,
  IconCheck,
  IconX,
  IconLock,
} from '@tabler/icons-react';
import { DateInput } from '@mantine/dates';
import { updateProfileComplete, fetchProfile } from '../../../../store/authSlice';
import { educationAPI } from '../../../../shared/services/api';
import IELTSTestRunner from '../components/IELTSTestRunner';

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

  // Минималистичная белая тема — все карточки одинаковые
  const isDark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-mantine-color-scheme') === 'dark';
  const surfaceStyle = { background: '#ffffff', border: '1px solid #e5e7eb' };
  const greenCardStyle = surfaceStyle;
  const blueCardStyle = surfaceStyle;
  const orangeCardStyle = surfaceStyle;
  const purpleCardStyle = surfaceStyle;

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

  // IELTS mock tests from backend
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [testsLoading, setTestsLoading] = useState(false);
  const [runnerTestId, setRunnerTestId] = useState(null);

  const IELTS_SECTIONS = ['listening', 'reading', 'writing', 'speaking'];

  const loadTestsAndAttempts = async () => {
    try {
      setTestsLoading(true);
      const [testsRes, attemptsRes] = await Promise.all([
        educationAPI.listIELTSTests().catch(() => ({ data: [] })),
        educationAPI.listIELTSAttempts().catch(() => ({ data: [] })),
      ]);
      const testsData = Array.isArray(testsRes?.data) ? testsRes.data : testsRes?.data?.results || [];
      const attemptsData = Array.isArray(attemptsRes?.data) ? attemptsRes.data : attemptsRes?.data?.results || [];
      // Show only IELTS sections in this view
      setTests(testsData.filter((t) => IELTS_SECTIONS.includes(t.section)));
      setAttempts(attemptsData);
    } finally {
      setTestsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadTestsAndAttempts();
  }, [user]);

  // Best attempt by section (highest band score)
  const bestAttemptByTest = useMemo(() => {
    const map = {};
    attempts.forEach((a) => {
      const prev = map[a.test];
      if (!prev || a.band_score > prev.band_score) map[a.test] = a;
    });
    return map;
  }, [attempts]);

  const sectionMeta = {
    listening: { label: 'Listening', icon: IconHeadphones, color: 'blue' },
    reading: { label: 'Reading', icon: IconBook, color: 'green' },
    writing: { label: 'Writing', icon: IconPencil, color: 'orange' },
    speaking: { label: 'Speaking', icon: IconMicrophone2, color: 'violet' },
  };

  const completedTests = Object.keys(bestAttemptByTest).length;
  const totalTests = tests.length;

  // Average band across all attempts (real, per-attempt)
  const averageBand = useMemo(() => {
    if (!attempts.length) return 0;
    const sum = attempts.reduce((acc, a) => acc + (a.band_score || 0), 0);
    return sum / attempts.length;
  }, [attempts]);

  // Best band per IELTS section
  const bestBySection = useMemo(() => {
    const map = {};
    attempts.forEach((a) => {
      const sec = a.section || tests.find((t) => t.id === a.test)?.section;
      if (!sec) return;
      const prev = map[sec];
      if (prev === undefined || a.band_score > prev) map[sec] = a.band_score;
    });
    return map;
  }, [attempts, tests]);

  // Прогресс = средний band / 9 (более осмысленно, чем количество пройденных)
  const testProgress = averageBand > 0 ? Math.round((averageBand / 9) * 100) : 0;

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
            <Text size="xl" fw={700} c="dark.9">IELTS Подготовка</Text>
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
                <IconTrophy size={48} stroke={1.5} color="#111111" />
                <Text size="lg" fw={700} c="dark">
                  {testProgress}%
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  Прогресс тестов
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Band score breakdown (real data from attempts) */}
        {attempts.length > 0 && (
          <Card withBorder shadow="none" radius="lg" style={surfaceStyle}>
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="lg" fw={600}>Результаты по band score</Text>
                <Badge color="gray" variant="light" radius="sm">
                  Средний: {averageBand.toFixed(1)}
                </Badge>
              </Group>
              <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
                {IELTS_SECTIONS.map((sec) => {
                  const meta = sectionMeta[sec];
                  const SectionIcon = meta.icon;
                  const best = bestBySection[sec];
                  return (
                    <Paper key={sec} withBorder radius="md" p="sm">
                      <Group gap="xs" mb={6}>
                        <SectionIcon size={18} stroke={1.5} color="#111111" />
                        <Text size="sm" fw={500}>{meta.label}</Text>
                      </Group>
                      <Text size="xl" fw={700} c="dark">
                        {typeof best === 'number' ? best.toFixed(1) : '—'}
                      </Text>
                      <Text size="xs" c="dimmed">лучший band</Text>
                    </Paper>
                  );
                })}
              </SimpleGrid>
            </Stack>
          </Card>
        )}

        {/* Список тестов */}
        <Card withBorder shadow="md" radius="lg" style={surfaceStyle}>
          <Stack gap="md">
            <Text size="lg" fw={600}>
              Доступные тесты
            </Text>
            {testsLoading && tests.length === 0 ? (
              <Text size="sm" c="dimmed">Загружаем тесты…</Text>
            ) : tests.length === 0 ? (
              <Text size="sm" c="dimmed">
                Тесты пока недоступны. Загрузите фикстуры на бэкенде:
                <br />
                <code>python manage.py loaddata ielts_tests</code>
              </Text>
            ) : (
              <Stack gap="sm">
                {tests.map((test) => {
                  const meta = sectionMeta[test.section] || { label: test.section, icon: IconBook, color: 'gray' };
                  const SectionIcon = meta.icon;
                  const best = bestAttemptByTest[test.id];
                  const completed = Boolean(best);
                  return (
                    <Paper
                      key={test.id}
                      p="md"
                      withBorder
                      radius="md"
                      shadow="xs"
                      style={{
                        backgroundColor: completed
                          ? (isDark ? 'color-mix(in srgb, var(--mantine-color-green-6), transparent 85%)' : 'var(--mantine-color-green-0)')
                          : (isDark ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-gray-0)'),
                      }}
                    >
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
          onCompleted={() => {
            loadTestsAndAttempts();
            dispatch(fetchProfile());
          }}
        />

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

        {/* Study Modules — wired to real practice tests */}
        {(() => {
          const modules = [
            { id: 'listening', title: 'Listening', icon: IconHeadphones, lessons: 12, description: 'Академические и General Training задания на аудирование' },
            { id: 'reading', title: 'Reading', icon: IconBook, lessons: 15, description: 'True/False, matching headings, gap filling' },
            { id: 'writing', title: 'Writing', icon: IconPencil, lessons: 10, description: 'Task 1 (графики/диаграммы) и Task 2 (эссе)' },
            { id: 'speaking', title: 'Speaking', icon: IconMicrophone2, lessons: 8, description: 'Parts 1, 2 и 3: интервью и монолог' },
          ];
          return (
            <Box>
              <Group justify="space-between" mb="sm">
                <Text size="lg" fw={700}>Учебные модули</Text>
                <Badge color="gray" variant="light" radius="sm">Тренировка</Badge>
              </Group>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                {modules.map((mod) => {
                  const Icon = mod.icon;
                  const test = tests.find((t) => t.section === mod.id);
                  const best = test ? bestAttemptByTest[test.id] : null;
                  return (
                    <Paper key={mod.id} withBorder radius="md" p="md" style={{ background: '#ffffff' }}>
                      <Group gap="sm" mb={8}>
                        <ThemeIcon size={36} radius="md" color="gray" variant="light">
                          <Icon size={20} stroke={1.5} />
                        </ThemeIcon>
                        <Box style={{ flex: 1 }}>
                          <Text fw={600} size="sm">{mod.title}</Text>
                          <Text size="xs" c="dimmed">{mod.lessons} уроков</Text>
                        </Box>
                        {best && (
                          <Badge color="dark" variant="filled" size="sm">
                            Band {best.band_score.toFixed(1)}
                          </Badge>
                        )}
                      </Group>
                      <Text size="xs" c="dimmed" mb={10}>{mod.description}</Text>
                      <Button
                        size="xs"
                        variant="filled"
                        color="dark"
                        fullWidth
                        radius="md"
                        leftSection={<IconPlayerPlay size={14} />}
                        disabled={!test}
                        onClick={() => test && setRunnerTestId(test.id)}
                      >
                        {best ? 'Пройти ещё раз' : 'Начать тренировку'}
                      </Button>
                    </Paper>
                  );
                })}
              </SimpleGrid>
            </Box>
          );
        })()}

        {/* Study Tips */}
        {(() => {
          const TIPS = [
            'Слушайте подкасты на английском 20 минут каждый день — это улучшает Listening.',
            'Практикуйте пересказ академических текстов в 2-3 предложениях для Writing Task 1.',
            'Запишите себя на диктофон и прослушайте — это ключ к прогрессу в Speaking.',
            'Читайте статьи из BBC, The Guardian или Nature для подготовки к Reading.',
            'Учите коннекторы: furthermore, nevertheless, in contrast — они нужны для Writing Task 2.',
            'В Speaking Part 2 используйте «время на подготовку» — набросайте 3-4 ключевых слова.',
            'Для Listening тренируйте предсказание ответа до прослушивания по контексту вопроса.',
            'Разбирайте свои ошибки в mock-тестах — это эффективнее, чем просто делать новые тесты.',
            'Изучите 200 наиболее частых слов академического словаря Oxford AWL.',
            'Делайте хотя бы один полный mock-тест в условиях реального экзамена каждую неделю.',
            'В Writing Task 2 обязательно дайте чёткий ответ во введении — это структурное требование.',
            'Для Reading тренируйтесь сканированию (skimming) — на каждый текст 20 минут максимум.',
            'Учите парафраз: каждое слово в вопросе будет переформулировано в тексте.',
            'В Speaking важна fluency, а не идеальная грамматика — говорите без долгих пауз.',
            'Не учите шаблонные фразы наизусть — экзаменаторы замечают и снижают балл за coherence.',
            'Тренируйте Listening Section 4 (лекция) отдельно — это самая сложная часть.',
            'В True/False/Not Given сначала ищите Not Given — это ключ к высокому баллу.',
            'Для Writing считайте слова: Task 1 — минимум 150, Task 2 — минимум 250.',
            'Используйте линейку слов разной длины и сложности (lexical resource — 25% оценки).',
            'В Speaking Part 3 не бойтесь высказывать мнение — экзаменатор оценивает аргументацию.',
            'Засекайте время на каждую задачу — потеря времени = потеря баллов.',
            'Учите топик-словари по темам: education, environment, technology, health, society.',
            'Перед экзаменом сделайте 4-5 полных mock-тестов в один день — это репетиция выносливости.',
            'В день экзамена не учите новое — повторяйте уже изученные шаблоны и фразы.',
            'Берите с собой только воду и удостоверение — телефон не пройдёт через охрану.',
          ];
          const tip = TIPS[new Date().getDate() % TIPS.length];
          return (
            <Paper withBorder radius="md" p="md"
              style={{ background: isDark ? 'color-mix(in srgb, var(--mantine-color-yellow-6), transparent 85%)' : 'var(--mantine-color-yellow-0)', borderColor: isDark ? 'transparent' : 'var(--mantine-color-yellow-2)' }}>
              <Group gap="sm" mb={6}>
                <ThemeIcon size={28} radius="md" color="yellow" variant="light">
                  <IconBulb size={16} />
                </ThemeIcon>
                <Text size="sm" fw={600} c="yellow.7">Совет дня</Text>
              </Group>
              <Text size="sm">{tip}</Text>
            </Paper>
          );
        })()}

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
