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
  FileInput,
  Alert,
  Divider
} from '@mantine/core';
import { useEffect } from 'react';
import { useDashboardStore } from '../../../../store/dashboardStore';
import { 
  IconPlane, 
  IconPlayerPlay, 
  IconDownload, 
  IconUpload,
  IconCheck,
  IconClock,
  IconAlertCircle,
  IconEye,
  IconExternalLink,
  IconCalendar
} from '@tabler/icons-react';

const VisaSection = ({ progress }) => {
  const { user } = useSelector((state) => state.auth);
  const _overallProgress = progress?.overallProgress || 0;
  const [opened, setOpened] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const steps = [
    {
      id: 1,
      title: 'Запись на подачу документов',
      description: 'Запись в итальянское консульство',
      completed: user?.profile?.visa_step_1_completed || false,
      required: true,
      documents: ['Загранпаспорт', 'DOV', 'Codice Fiscale']
    },
    {
      id: 2,
      title: 'Подготовка документов',
      description: 'Сбор всех необходимых документов',
      completed: user?.profile?.visa_step_2_completed || false,
      required: true,
      documents: ['Справка о доходах', 'Страховка', 'Справка о зачислении']
    },
    {
      id: 3,
      title: 'Подача документов',
      description: 'Подача в консульство',
      completed: user?.profile?.visa_step_3_completed || false,
      required: true,
      documents: ['Все документы', 'Оплата пошлины']
    },
    {
      id: 4,
      title: 'Получение визы',
      description: 'Получение готовой визы',
      completed: user?.profile?.visa_step_4_completed || false,
      required: true,
      documents: ['Виза']
    }
  ];

  // Рассчитываем прогресс на основе реальных данных
  const completedSteps = steps.filter(step => step.completed).length;
  const visaProgress = Math.round((completedSteps / steps.length) * 100);
  // Синхронизируем прогресс Visa с глобальным стором
  const updateProgress = useDashboardStore((s) => s.updateProgress);
  useEffect(() => {
    updateProgress('visa', visaProgress);
  }, [visaProgress, updateProgress]);

  const documents = [
    {
      id: 1,
      name: 'Загранпаспорт',
      status: user?.profile?.visa_document_1_uploaded ? 'uploaded' : 'pending',
      required: true,
      size: user?.profile?.visa_document_1_size || null,
      uploadedAt: user?.profile?.visa_document_1_uploaded_at || null,
      validUntil: user?.profile?.visa_document_1_valid_until || null
    },
    {
      id: 2,
      name: 'DOV (Dichiarazione di Valore)',
      status: user?.profile?.visa_document_2_uploaded ? 'uploaded' : 'pending',
      required: true,
      size: user?.profile?.visa_document_2_size || null,
      uploadedAt: user?.profile?.visa_document_2_uploaded_at || null,
      validUntil: user?.profile?.visa_document_2_valid_until || null
    },
    {
      id: 3,
      name: 'Codice Fiscale',
      status: user?.profile?.visa_document_3_uploaded ? 'uploaded' : 'pending',
      required: true,
      size: user?.profile?.visa_document_3_size || null,
      uploadedAt: user?.profile?.visa_document_3_uploaded_at || null,
      validUntil: user?.profile?.visa_document_3_valid_until || null
    },
    {
      id: 4,
      name: 'Справка о доходах родителей',
      status: user?.profile?.visa_document_4_uploaded ? 'uploaded' : 'pending',
      required: true,
      size: user?.profile?.visa_document_4_size || null,
      uploadedAt: user?.profile?.visa_document_4_uploaded_at || null,
      validUntil: user?.profile?.visa_document_4_valid_until || null
    },
    {
      id: 5,
      name: 'Страховка на год',
      status: user?.profile?.visa_document_5_uploaded ? 'uploaded' : 'pending',
      required: true,
      size: user?.profile?.visa_document_5_size || null,
      uploadedAt: user?.profile?.visa_document_5_uploaded_at || null,
      validUntil: user?.profile?.visa_document_5_valid_until || null
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'uploaded': return 'green';
      case 'pending': return 'yellow';
      case 'not_required': return 'gray';
      default: return 'red';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'uploaded': return 'Загружено';
      case 'pending': return 'Ожидает';
      case 'not_required': return 'Не требуется';
      default: return 'Ошибка';
    }
  };

  const totalSteps = steps.length;

  return (
      <Box p="var(--app-spacing-md)">
      <Stack gap="xl">
        {/* Header */}
        <Box>
          <Text size="xl" fw={700}>
            Визовая поддержка
          </Text>
          <Text size="md" c="dimmed">
            Получение студенческой визы для обучения в Италии
          </Text>
        </Box>

        {/* Important Notice */}
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Важная информация"
          color="red"
        >
          Процесс получения студенческой визы может занять 2-3 месяца. 
          Начните подготовку за 4-6 месяцев до начала обучения!
        </Alert>

        {/* Progress Overview */}
        <Paper p="var(--app-spacing-md)" shadow="sm" style={{ background: 'var(--app-color-surface)' }}>
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="md">
                <Group justify="space-between" align="center">
                  <Text size="lg" fw={600}>
                    Прогресс получения визы: {completedSteps}/{totalSteps} шагов
                  </Text>
                  <Badge color="blue" variant="light">
                    {Math.round((completedSteps / totalSteps) * 100)}%
                  </Badge>
                </Group>
                <Progress
                  value={(completedSteps / totalSteps) * 100}
                  color="blue"
                  size="xl"
                  className="mb-2"
                />
                <Text size="sm" c="dimmed">
                  Следующий шаг: {steps.find(step => !step.completed && step.required)?.title}
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card className="h-full" style={{ backgroundColor: 'color-mix(in srgb, var(--mantine-color-blue-6), transparent 85%)', border: '1px solid color-mix(in srgb, var(--mantine-color-blue-6), transparent 60%)' }}>
                <Stack align="center" gap="sm">
                  <IconPlane size={48} color="var(--mantine-color-blue-6)" />
                  <Text size="lg" fw={700} c="blue">
                    {visaProgress}%
                  </Text>
                  <Text size="sm" c="dimmed" ta="center">
                    Общий прогресс
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Steps */}
        <Paper p="var(--app-spacing-md)" shadow="sm" style={{ background: 'var(--app-color-surface)' }}>
          <Text size="lg" fw={600} className="mb-4">
            Пошаговый план
          </Text>
          <Stack gap="md">
            {steps.map((step) => (
              <Card key={step.id} shadow="sm" padding="lg" radius="md" withBorder style={{ background: 'var(--app-color-surface)' }}>
                <Group justify="space-between" align="flex-start">
                  <Group>
                    <ActionIcon
                      color={step.completed ? 'green' : 'blue'}
                      variant={step.completed ? 'filled' : 'light'}
                      size="lg"
                    >
                      {step.completed ? <IconCheck size={20} /> : <IconClock size={20} />}
                    </ActionIcon>
                    <Box>
                      <Text size="md" fw={600}>
                        {step.title}
                      </Text>
                      <Text size="sm" c="dimmed" className="mb-2">
                        {step.description}
                      </Text>
                      {step.documents.length > 0 && (
                        <Text size="xs" c="dimmed">
                          Требуемые документы: {step.documents.join(', ')}
                        </Text>
                      )}
                    </Box>
                  </Group>
                  <Group>
                    {step.completed ? (
                      <Badge color="green" variant="light">
                        Завершено
                      </Badge>
                    ) : (
                      <Badge color="blue" variant="light">
                        В процессе
                      </Badge>
                    )}
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>
        </Paper>

        {/* Documents */}
        <Paper p="var(--app-spacing-md)" shadow="sm" style={{ background: 'var(--app-color-surface)' }}>
          <Text size="lg" fw={600} className="mb-4">
            Документы
          </Text>
          <Stack gap="md">
            {documents.map((doc) => (
              <Card key={doc.id} shadow="sm" padding="lg" radius="md" withBorder style={{ background: 'var(--app-color-surface)' }}>
                <Group justify="space-between" align="flex-start">
                  <Group>
                    <Box>
                      <Text size="md" fw={600}>
                        {doc.name}
                      </Text>
                      {doc.uploadedAt && (
                        <Text size="xs" c="dimmed">
                          Загружено: {new Date(doc.uploadedAt).toLocaleDateString('ru-RU')} • {doc.size}
                        </Text>
                      )}
                      {doc.validUntil && (
                        <Text size="xs" c="dimmed">
                          Действителен до: {new Date(doc.validUntil).toLocaleDateString('ru-RU')}
                        </Text>
                      )}
                    </Box>
                  </Group>
                  <Group>
                    <Badge
                      color={getStatusColor(doc.status)}
                      variant="light"
                    >
                      {getStatusText(doc.status)}
                    </Badge>
                    {doc.status === 'uploaded' && (
                      <Button
                        size="sm"
                        variant="outline"
                        leftSection={<IconDownload size={16} />}
                      >
                        Скачать
                      </Button>
                    )}
                    {doc.status === 'pending' && (
                      <Button
                        size="sm"
                        color="blue"
                        leftSection={<IconUpload size={16} />}
                        onClick={() => setOpened(true)}
                      >
                        Загрузить
                      </Button>
                    )}
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>
        </Paper>

        {/* Upload Modal */}
        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          title="Загрузка документа"
          size="md"
        >
          <Stack gap="md">
            <FileInput
              label="Выберите файл"
              placeholder="Нажмите для выбора файла"
              value={selectedFile}
              onChange={setSelectedFile}
            />
            <Group>
              <Button onClick={() => setOpened(false)}>
                Загрузить
              </Button>
              <Button variant="outline" onClick={() => setOpened(false)}>
                Отмена
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Box>
  );
};

export default VisaSection;
