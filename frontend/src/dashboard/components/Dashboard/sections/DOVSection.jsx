import { useDispatch, useSelector } from 'react-redux';
import React, { useState } from 'react';
import { updateProfileComplete, fetchProfile } from '../../../../store/authSlice';
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
  Alert
} from '@mantine/core';
import { useEffect } from 'react';
import { useDashboardStore } from '../../../../store/dashboardStore';
import { educationAPI } from '../../../../shared/services/api';
import { 
  IconFileText, 
  IconPlayerPlay, 
  IconDownload, 
  IconUpload,
  IconCheck,
  IconClock,
  IconAlertCircle,
  IconEye,
  IconExternalLink
} from '@tabler/icons-react';

const DOVSection = ({ progress }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [markingStep, setMarkingStep] = useState(null);

  const toggleStep = async (stepNum, value) => {
    setMarkingStep(stepNum);
    try {
      await dispatch(updateProfileComplete({ [`dov_step_${stepNum}_completed`]: value })).unwrap();
      await dispatch(fetchProfile());
    } catch (e) {
      console.error('Failed to update DOV step', e);
    } finally {
      setMarkingStep(null);
    }
  };
  // Рассчитываем прогресс на основе реальных данных
  const _overallProgress = progress?.overallProgress || 0;
  const [opened, setOpened] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploadError(null);
    setUploading(true);
    try {
      await educationAPI.uploadDocument({
        file: selectedFile,
        name: selectedFile.name || 'DOV документ',
        document_type: 'diploma',
        description: 'Документ для Dichiarazione di Valore',
      });
      setSelectedFile(null);
      setOpened(false);
    } catch (e) {
      console.error('Upload failed', e);
      setUploadError('Не удалось загрузить файл. Попробуйте ещё раз.');
    } finally {
      setUploading(false);
    }
  };

  const steps = [
    {
      id: 1,
      title: 'Подготовка документов',
      description: 'Сбор всех необходимых документов',
      completed: !!user?.profile?.dov_step_1_completed,
      required: true,
      documents: ['Аттестат', 'IELTS', 'Мотивационное письмо', 'Рекомендации']
    },
    {
      id: 2,
      title: 'Апостилирование документов',
      description: 'Легализация документов для Италии',
      completed: !!user?.profile?.dov_step_2_completed,
      required: true,
      documents: ['Апостилированные документы', 'Переводы']
    },
    {
      id: 3,
      title: 'Подача в консульство',
      description: 'Подача документов в итальянское консульство',
      completed: !!user?.profile?.dov_step_3_completed,
      required: true,
      documents: ['Все документы', 'Заявление', 'Оплата пошлины']
    },
    {
      id: 4,
      title: 'Получение DOV',
      description: 'Получение готового документа',
      completed: !!user?.profile?.dov_step_4_completed,
      required: true,
      documents: ['DOV']
    }
  ];

  // Рассчитываем прогресс на основе реальных данных
  const completedSteps = steps.filter(step => step.completed).length;
  const dovProgress = Math.round((completedSteps / steps.length) * 100);
  // Синхронизируем прогресс DOV с глобальным стором
  const updateProgress = useDashboardStore((s) => s.updateProgress);
  useEffect(() => {
    updateProgress('dov', dovProgress);
  }, [dovProgress, updateProgress]);
  const documents = [
    {
      id: 1,
      name: 'Аттестат о среднем образовании',
      status: user?.profile?.dov_document_1_uploaded ? 'uploaded' : 'pending',
      required: true,
      size: user?.profile?.dov_document_1_size || null,
      uploadedAt: user?.profile?.dov_document_1_uploaded_at || null,
      needsApostille: true
    },
    {
      id: 2,
      name: 'IELTS сертификат',
      status: user?.profile?.dov_document_2_uploaded ? 'uploaded' : 'pending',
      required: true,
      size: user?.profile?.dov_document_2_size || null,
      uploadedAt: user?.profile?.dov_document_2_uploaded_at || null,
      document3UploadedAt: user?.profile?.dov_document_3_uploaded_at || null,
      needsApostille: false
    },
    {
      id: 4,
      name: 'Рекомендательные письма',
      status: user?.profile?.dov_document_4_uploaded ? 'uploaded' : 'pending',
      required: true,
      size: user?.profile?.dov_document_4_size || null,
      uploadedAt: user?.profile?.dov_document_4_uploaded_at || null,
      needsApostille: true
    },
    {
      id: 5,
      name: 'Перевод аттестата на итальянский',
      status: user?.profile?.dov_document_5_uploaded ? 'uploaded' : 'pending',
      required: true,
      size: user?.profile?.dov_document_5_size || null,
      uploadedAt: user?.profile?.dov_document_5_uploaded_at || null,
      needsApostille: false
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
      case 'pending': return 'Ожидает загрузки';
      case 'not_required': return 'Не требуется';
      default: return 'Ошибка';
    }
  };

  const totalSteps = steps.filter(step => step.required).length;

  return (
    <Box className="p-6">
      <Stack gap="xl">
        {/* Header */}
        <Box>
          <Text size="xl" fw={700} c="dark">
            DOV (Dichiarazione di Valore)
          </Text>
          <Text size="md" c="dimmed">
            Легализация документов об образовании для Италии
          </Text>
        </Box>

        {/* Important Notice */}
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Важная информация"
          color="orange"
        >
          DOV необходим для признания вашего образования в Италии. 
          Процесс может занять 4-8 недель. Начните подготовку заранее!
        </Alert>

        {/* Progress Overview */}
        <Paper className="p-6" shadow="sm" style={{ background: 'var(--app-color-surface)' }}>
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="md">
                <Group justify="space-between" align="center">
                  <Text size="lg" fw={600}>
                    Прогресс получения: {completedSteps}/{totalSteps} шагов
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
                  <IconFileText size={48} color="var(--mantine-color-blue-6)" />
                  <Text size="lg" fw={700} c="blue">
                    {dovProgress}%
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
        <Paper className="p-6" shadow="sm" style={{ background: 'var(--app-color-surface)' }}>
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
                    ) : step.required ? (
                      <Badge color="yellow" variant="light">
                        Требуется
                      </Badge>
                    ) : (
                      <Badge color="gray" variant="light">
                        Опционально
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant={step.completed ? 'subtle' : 'filled'}
                      color="dark"
                      onClick={() => toggleStep(step.id, !step.completed)}
                      loading={markingStep === step.id}
                      leftSection={step.completed ? <IconEye size={16} /> : <IconCheck size={16} />}
                    >
                      {step.completed ? 'Отменить' : 'Отметить'}
                    </Button>
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>
        </Paper>

        {/* Documents */}
        <Paper className="p-6" shadow="sm" style={{ background: 'var(--app-color-surface)' }}>
          <Group justify="space-between" align="center" className="mb-4">
            <Text size="lg" fw={600}>
              Документы
            </Text>
            <Button
              leftSection={<IconUpload size={16} />}
              onClick={() => setOpened(true)}
            >
              Загрузить документ
            </Button>
          </Group>
          
          <Stack gap="sm">
            {documents.map((doc) => (
              <Card key={doc.id} shadow="sm" padding="md" radius="md" withBorder style={{ background: 'var(--app-color-surface)' }}>
                <Group justify="space-between" align="center">
                  <Group>
                    <IconFileText size={20} color="var(--mantine-color-gray-6)" />
                    <Box>
                      <Text size="md" fw={500}>
                        {doc.name}
                      </Text>
                      {doc.uploadedAt && (
                        <Text size="xs" c="dimmed">
                          Загружено: {new Date(doc.uploadedAt).toLocaleDateString('ru-RU')} • {doc.size}
                        </Text>
                      )}
                      {doc.needsApostille && (
                        <Badge size="xs" color="orange" variant="light" className="mt-1">
                          Требует апостиль
                        </Badge>
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

        {/* Video Instructions */}
        <Paper className="p-6" shadow="sm" style={{ background: 'var(--app-color-surface)' }}>
          <Text size="lg" fw={600} className="mb-4">
            Видео-инструкции
          </Text>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder style={{ background: 'var(--app-color-surface)' }}>
                <Stack gap="md">
                  <Group>
                    <IconPlayerPlay size={24} color="var(--mantine-color-blue-6)" />
                    <Text size="md" fw={600}>
                      Как получить апостиль
                    </Text>
                  </Group>
                  <Text size="sm" c="dimmed">
                    Инструкция по апостилированию документов
                  </Text>
                  <Button
                    color="dark"
                    variant="outline"
                    fullWidth
                    component="a"
                    href="https://www.youtube.com/results?search_query=apostille+aja+convention+documents"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Смотреть видео
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder style={{ background: 'var(--app-color-surface)' }}>
                <Stack gap="md">
                  <Group>
                    <IconPlayerPlay size={24} stroke={1.5} color="#111111" />
                    <Text size="md" fw={600}>
                      Подача документов в консульство
                    </Text>
                  </Group>
                  <Text size="sm" c="dimmed">
                    Пошаговая инструкция по подаче документов
                  </Text>
                  <Button
                    color="dark"
                    variant="outline"
                    fullWidth
                    component="a"
                    href="https://www.youtube.com/results?search_query=dichiarazione+di+valore+come+ottenere"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Смотреть видео
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* External Links */}
        <Paper className="p-6" shadow="sm" style={{ background: 'var(--app-color-surface)' }}>
          <Text size="lg" fw={600} className="mb-4">
            Полезные ссылки
          </Text>
          <Stack gap="sm">
            <Button
              variant="outline"
              color="dark"
              leftSection={<IconExternalLink size={16} stroke={1.5} />}
              fullWidth
              justify="flex-start"
              component="a"
              href="https://www.esteri.it/en/servizi-consolari-e-visti/italiani-all-estero/legalizzazione/"
              target="_blank"
              rel="noopener noreferrer"
            >
              MAECI — Апостиль и легализация
            </Button>
            <Button
              variant="outline"
              color="dark"
              leftSection={<IconExternalLink size={16} stroke={1.5} />}
              fullWidth
              justify="flex-start"
              component="a"
              href="https://www.esteri.it/en/servizi-consolari-e-visti/italiani-all-estero/dichiarazione-di-valore/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Официальная страница Dichiarazione di Valore
            </Button>
            <Button
              variant="outline"
              color="dark"
              leftSection={<IconExternalLink size={16} stroke={1.5} />}
              fullWidth
              justify="flex-start"
              component="a"
              href="https://www.universitaly.it/index.php/registration/firststep"
              target="_blank"
              rel="noopener noreferrer"
            >
              Реестр аккредитованных переводчиков
            </Button>
          </Stack>
        </Paper>
      </Stack>

      {/* Upload Modal */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Загрузить документ"
        size="md"
      >
        <Stack gap="md">
          <FileInput
            label="Выберите файл"
            placeholder="Нажмите для выбора файла"
            value={selectedFile}
            onChange={setSelectedFile}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          <Text size="sm" c="dimmed">
            Поддерживаемые форматы: PDF, DOC, DOCX, JPG, PNG
          </Text>
          {uploadError && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" radius="md">{uploadError}</Alert>
          )}
          <Group>
            <Button onClick={handleUpload} disabled={!selectedFile || uploading} loading={uploading}>
              Загрузить
            </Button>
            <Button variant="outline" onClick={() => setOpened(false)}>
              Отмена
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
};

export default DOVSection;
