import { useSelector } from 'react-redux';
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
  List,
  ActionIcon,
  Checkbox,
  Modal,
  TextInput,
  FileInput
} from '@mantine/core';
import { useEffect } from 'react';
import { useDashboardStore } from '../../../../store/dashboardStore';
import { 
  IconFileText, 
  IconPlayerPlay, 
  IconDownload, 
  IconUpload,
  IconCheck,
  IconClock,
  IconAlertCircle,
  IconEye,
  IconX
} from '@tabler/icons-react';

const UniversitalySection = ({ progress }) => {
  const { user } = useSelector((state) => state.auth);
  const [opened, setOpened] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Извлекаем значения из объекта progress
  const _overallProgress = progress?.overallProgress || 0;
  const _currentProgress = progress?.currentProgress || {};

  const steps = [
    {
      id: 1,
      title: 'Создание аккаунта на Universitaly',
      description: 'Регистрация на официальном сайте',
      completed: user?.profile?.universitaly_step_1_completed || false,
      required: true,
      documents: ['Email', 'Пароль', 'Личные данные']
    },
    {
      id: 2,
      title: 'Заполнение анкеты',
      description: 'Подробная информация о себе',
      completed: user?.profile?.universitaly_step_1_completed || false,
      required: true,
      documents: ['Фото', 'Документы', 'Справки']
    },
    {
      id: 3,
      title: 'Выбор специальности',
      description: 'Выбор направления обучения',
      completed: false,
      required: true,
      documents: ['Мотивационное письмо', 'Рекомендации']
    },
    {
      id: 4,
      title: 'Подача документов',
      description: 'Загрузка всех необходимых файлов',
      completed: false,
      required: true,
      documents: ['Диплом', 'Сертификаты', 'Портфолио']
    },
    {
      id: 5,
      title: 'Ожидание результатов',
      description: 'Рассмотрение заявки университетом',
      completed: false,
      required: false,
      documents: []
    }
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);
  // Синхронизируем прогресс Universitaly с глобальным стором
  const updateProgress = useDashboardStore((s) => s.updateProgress);
  useEffect(() => {
    updateProgress('universitaly', progressPercentage);
  }, [progressPercentage, updateProgress]);

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
            }}>Universitaly</Text>
            <Text size="sm" c="dimmed">
              Регистрация и подача документов
            </Text>
          </Box>
          <Badge color="blue" variant="light" size="lg" radius="sm">
            {progressPercentage}% завершено
          </Badge>
        </Group>

        {/* Общий прогресс */}
        <Card withBorder shadow="md" radius="lg" style={{ background: 'var(--app-color-surface)' }}>
          <Stack gap="md">
            <Group justify="space-between">
              <Text size="lg" fw={600}>
                Общий прогресс
              </Text>
              <Text size="sm" c="dimmed">
                {completedSteps} из {totalSteps} шагов
              </Text>
            </Group>
            <Progress
              value={progressPercentage}
              size="lg"
              radius="md"
              color="blue"
              animated
            />
          </Stack>
        </Card>

        {/* Статистика */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card className="h-full" style={{ backgroundColor: 'color-mix(in srgb, var(--mantine-color-green-6), transparent 85%)', border: '1px solid color-mix(in srgb, var(--mantine-color-green-6), transparent 60%)' }} radius="lg" shadow="sm">
              <Stack align="center" gap="sm">
                <IconCheck size={48} color="var(--mantine-color-green-6)" />
                <Text size="lg" fw={700} c="green">
                  {completedSteps}
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  Завершено шагов
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card className="h-full" style={{ backgroundColor: 'color-mix(in srgb, var(--mantine-color-orange-6), transparent 85%)', border: '1px solid color-mix(in srgb, var(--mantine-color-orange-6), transparent 60%)' }} radius="lg" shadow="sm">
              <Stack align="center" gap="sm">
                <IconClock size={48} color="var(--mantine-color-orange-6)" />
                <Text size="lg" fw={700} c="orange">
                  {totalSteps - completedSteps}
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  Осталось шагов
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card className="h-full" style={{ backgroundColor: 'color-mix(in srgb, var(--mantine-color-blue-6), transparent 85%)', border: '1px solid color-mix(in srgb, var(--mantine-color-blue-6), transparent 60%)' }} radius="lg" shadow="sm">
              <Stack align="center" gap="sm">
                <IconFileText size={48} color="var(--mantine-color-blue-6)" />
                <Text size="lg" fw={700} c="blue">
                  {progressPercentage}%
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  Общий прогресс
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Список шагов */}
        <Card withBorder shadow="md" radius="lg" style={{ background: 'var(--app-color-surface)' }}>
          <Stack gap="md">
            <Text size="lg" fw={600}>
              Пошаговый план
            </Text>
            <Stack gap="sm">
              {steps.map((step) => (
                <Paper
                  key={step.id}
                  p="md"
                  withBorder
                  radius="md"
                  shadow="xs"
                  style={{
                    backgroundColor: step.completed 
                      ? 'color-mix(in srgb, var(--mantine-color-green-6), transparent 85%)' 
                      : 'var(--app-color-surface)'
                  }}
                >
                  <Group justify="space-between">
                    <Box style={{ flex: 1 }}>
                      <Group gap="sm" mb="xs">
                        <Checkbox
                          checked={step.completed}
                          disabled
                          color="green"
                        />
                        <Text fw={600} c={step.completed ? 'green' : 'dark'}>
                          {step.title}
                        </Text>
                        {step.required && (
                          <Badge color="red" variant="light" size="sm" radius="sm">
                            Обязательно
                          </Badge>
                        )}
                      </Group>
                      <Text size="sm" c="dimmed" mb="sm">
                        {step.description}
                      </Text>
                      {step.documents.length > 0 && (
                        <Box>
                          <Text size="sm" fw={500} mb="xs">
                            Необходимые документы:
                          </Text>
                          <List size="sm" spacing="xs">
                            {step.documents.map((doc, docIndex) => (
                              <List.Item key={docIndex}>
                                <Text size="sm" c="dimmed">
                                  {doc}
                                </Text>
                              </List.Item>
                            ))}
                          </List>
                        </Box>
                      )}
                    </Box>
                    <Group gap="sm">
                      {step.completed ? (
                        <Badge color="green" variant="light" radius="sm">
                          Завершено
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="light"
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

        {/* Действия */}
        <Card withBorder shadow="md" radius="lg" style={{ background: 'var(--app-color-surface)' }}>
          <Stack gap="md">
            <Text size="lg" fw={600}>
              Быстрые действия
            </Text>
            <Group>
              <Button
                leftSection={<IconUpload size={16} />}
                onClick={() => setOpened(true)}
                radius="md"
              >
                Загрузить документы
              </Button>
              <Button
                variant="light"
                leftSection={<IconDownload size={16} />}
                radius="md"
              >
                Скачать шаблоны
              </Button>
              <Button
                variant="light"
                leftSection={<IconEye size={16} />}
                radius="md"
              >
                Просмотреть заявку
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* Модальное окно загрузки документов */}
        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          title="Загрузка документов"
          size="md"
          centered
          overlayProps={{ backgroundOpacity: 0.45, blur: 3 }}
          transitionProps={{ transition: 'pop', duration: 200 }}
        >
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Выберите файлы для загрузки в систему Universitaly
            </Text>
            <FileInput
              label="Выберите файл"
              placeholder="Нажмите для выбора файла"
              value={selectedFile}
              onChange={setSelectedFile}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
      <Group justify="flex-end" gap="sm">
              <Button
                variant="light"
                onClick={() => setOpened(false)}
        radius="md"
              >
                Отмена
              </Button>
              <Button
                onClick={() => {
                  setOpened(false);
                  setSelectedFile(null);
                }}
                disabled={!selectedFile}
        radius="md"
              >
                Загрузить
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Box>
  );
};

export default UniversitalySection;
