import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUniversities } from '../../../../store/educationSlice';
import { useAuth } from '../../../../shared/hooks/useAuth';
import {
  Box,
  Stack,
  Text,
  Paper,
  Group,
  Badge,
  Button,
  Card,
  Grid,
  TextInput,
  Select,
  NumberInput,
  Pagination,
  Skeleton,
  Alert,
  ActionIcon,
  Modal,
  Progress,
  Image,
  Avatar,
} from '@mantine/core';
import {
  IconSearch,
  IconMapPin,
  IconUsers,
  IconCalendar,
  IconEye,
  IconHeart,
  IconShare,
  IconDownload,
  IconExternalLink,
  IconPlus,
  IconAlertCircle,
  IconTrophy,
} from '@tabler/icons-react';

// Статических данных больше нет; компонента полагается только на API

const downloadTextFile = (filename, content) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const UniversitiesSection = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  
  // Получаем данные из Redux store
  const universities = useSelector((state) => state.education.universities);
  const loading = useSelector((state) => state.education.loading.universities);

  // Прогресс поиска убран
    
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [opened, setOpened] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  // Helper: format ISO date to ru-RU (DD.MM.YYYY)
  const formatDate = (dateLike) => {
    if (!dateLike) return '';
    try {
      const dt = new Date(dateLike);
      if (Number.isNaN(dt.getTime())) return '';
      return dt.toLocaleDateString('ru-RU');
    } catch {
      return '';
    }
  };

  // Helpers: normalize level to 0-100 and map to color (low=green → high=red)
  const getLogoSrc = (u) => {
    const val = (u?.logo_url || u?.logo || '').trim?.() || '';
    if (!val) return '';
    // Basic sanitize: ensure it looks like a URL
    if (val.startsWith('http://') || val.startsWith('https://')) return val;
    return val; // allow relative path if any (backend/media)
  };

  const parseLevelToPercent = (level) => {
    if (level === null || level === undefined) return null;
    if (typeof level === 'number') {
      let v = level;
  if (v < 1) v = v * 100; // 0-1 scale (strictly <1)
      else if (v <= 10) v = v * 10; // 0-10 scale
      // else assume 0-100
      return Math.max(0, Math.min(100, v));
    }
    const s = String(level).toLowerCase().trim();
    // Try to extract a number first (e.g., "70%", "7.5")
    const m = s.match(/(\d+(?:[.,]\d+)?)/);
    if (m) {
      let v = parseFloat(m[1].replace(',', '.'));
  if (v < 1) v = v * 100; // 0-1 (strictly <1)
      else if (v <= 10) v = v * 10; // 0-10
      return Math.max(0, Math.min(100, v));
    }
    // Keyword mapping
    const easy = ['easy', 'низкая', 'легкая', 'лёгкая'];
    const medium = ['medium', 'средняя'];
    const hard = ['hard', 'высокая', 'сложная'];
    if (easy.includes(s)) return 20;
    if (medium.includes(s)) return 60;
    if (hard.includes(s)) return 90;
    return null;
  };

  const getLevelColor = (percent) => {
    if (percent == null) return 'gray';
    if (percent < 35) return 'green';
    if (percent < 65) return 'yellow';
    if (percent < 85) return 'orange';
    return 'red';
  };

  // Используем тестовые данные, если нет данных из API
  const displayUniversities = universities || [];

  // Загружаем университеты при монтировании компонента
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUniversities());
    }
  }, [dispatch, isAuthenticated]);

  // Фильтрация университетов (учитываем город/описание и отсутствие полей)
  const filteredUniversities = displayUniversities?.filter((university) => {
    const term = (searchTerm || '').toLowerCase().trim();
    const name = (university.name || '').toLowerCase();
    const city = (university.city || '').toLowerCase();
    const description = (university.description || '').toLowerCase();
    const programsList = (university.programs || []).map(p => (p || '').toLowerCase());
    const level = (university.level || '').toLowerCase();

    const matchesSearch = !term ||
      name.includes(term) ||
      city.includes(term) ||
      description.includes(term) ||
      programsList.some(p => p.includes(term));

    const matchesProgram = !selectedProgram || programsList.some(p => p === (selectedProgram || '').toLowerCase());
    const matchesLevel = !selectedLevel || level === (selectedLevel || '').toLowerCase();

    return matchesSearch && matchesProgram && matchesLevel;
  }) || [];

  // Значения для выпадающих списков без пустых элементов
  const programs = [...new Set((displayUniversities?.flatMap(u => u.programs || [])?.filter(Boolean)) || [])];
  const levels = [...new Set((displayUniversities?.map(u => u.level)?.filter(Boolean)) || [])];

  const handleViewDetails = (university) => {
    setSelectedUniversity(university);
    setOpened(true);
  };

  const handleToggleFavorite = (universityId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(universityId)) {
        newFavorites.delete(universityId);
      } else {
        newFavorites.add(universityId);
      }
      return newFavorites;
    });
  };

  const handleDownloadInfo = (university) => {
    const details = [
      `Name: ${university.name || ''}`,
      `City: ${university.city || ''}`,
      `Deadline: ${formatDate(university.deadline) || ''}`,
      `Website: ${university.website || ''}`,
      `Description: ${university.description || ''}`,
    ].join('\n');
    const safeName = (university.name || 'university').replace(/[^\w.-]+/g, '_');
    downloadTextFile(`${safeName}.txt`, details);
  };

  const handleShare = async (university) => {
    const shareData = {
      title: university.name || 'University',
      text: university.description || university.name || 'University',
      url: university.website || window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // ignore user-cancelled share dialogs
      }
      return;
    }

    if (navigator.clipboard?.writeText) {
      const fallbackText = university.website || university.name || '';
      if (fallbackText) {
        try {
          await navigator.clipboard.writeText(fallbackText);
        } catch {
          // ignore clipboard permission errors
        }
      }
    }
  };

  const handleApply = (university) => {
    if (university.website) {
      window.open(university.website, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <Box style={{ padding: 'var(--app-spacing-md)' }}>
        <Text size="xl" fw={600} mb="md">Поиск и выбор университетов</Text>
        <Grid>
          {[1, 2, 3, 4].map((i) => (
            <Grid.Col key={i} span={{ base: 12, md: 6, lg: 4 }}>
              <Skeleton height={200} />
            </Grid.Col>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box style={{ padding: 'var(--app-spacing-md)' }}>
      <Text
        size="xl"
        fw={800}
        mb="sm"
        style={{
          background: 'linear-gradient(90deg, #1e3a8a 0%, #0ea5e9 50%, #14b8a6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '0.2px'
        }}
      >
        Поиск и выбор университетов
      </Text>
      
      {/* Фильтры */}
      <Paper p="var(--app-spacing-md)" mb="var(--app-spacing-md)" withBorder style={{
        background: 'var(--app-color-surface)',
        borderRadius: 'var(--app-radius-lg)',
        boxShadow: 'var(--app-shadow-sm)',
        borderColor: 'var(--app-color-border)'
      }}>
        <Group justify="space-between" mb="sm">
          <Text fw={600}>Фильтры поиска</Text>
          <Badge variant="light" color="blue">{(universities || []).length} записей</Badge>
        </Group>
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              placeholder="Поиск по названию, городу или программе..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftSection={<IconSearch size={16} color="#2563eb" />}
              size="md"
              radius="md"
              variant="filled"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Select
              placeholder="Выберите программу"
              value={selectedProgram}
              onChange={setSelectedProgram}
              data={programs.map(program => ({ value: program, label: program }))}
              clearable
              size="md"
              radius="md"
              variant="filled"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Select
              placeholder="Сложность поступления"
              value={selectedLevel}
              onChange={setSelectedLevel}
              data={levels.map(level => ({ value: level, label: level }))}
              clearable
              size="md"
              radius="md"
              variant="filled"
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Результаты поиска */}
      <Box>
        <Group justify="space-between" mb="md">
          <Text fw={500}>
            Найдено университетов: {filteredUniversities.length}
          </Text>
          <Group>
            <Button variant="light" leftSection={<IconDownload size={16} />}>
              Экспорт
            </Button>
            <Button leftSection={<IconPlus size={16} />}>
              Добавить в избранное
            </Button>
          </Group>
        </Group>

        {filteredUniversities.length === 0 ? (
          <Alert icon={<IconAlertCircle size={16} />} title="Университеты не найдены" color="blue" radius="md">
            Попробуйте изменить параметры поиска
          </Alert>
        ) : (
          <Grid gutter="lg">
            {filteredUniversities.map((university) => (
              <Grid.Col key={university.id} span={{ base: 12, md: 6, lg: 4 }}>
                <Card
                  shadow="var(--app-shadow-md)"
                  padding="var(--app-spacing-lg)"
                  radius="var(--app-radius-lg)"
                  withBorder
                  style={{
                    background: 'var(--app-color-surface)',
                    borderColor: 'var(--app-color-border)',
                    transition: 'transform 150ms ease, box-shadow 150ms ease',
                    boxShadow: 'var(--app-shadow-sm)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--app-shadow-md)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
                >
                  {(() => {
                    const src = getLogoSrc(university);
                    return (
                      <Card.Section
                        inheritPadding={false}
                        style={{
                          position: 'relative',
                          height: 140,
                          backgroundImage: src ? `url(${src})` : 'linear-gradient(135deg, #1e3a8a 0%, #0ea5e9 50%, #14b8a6 100%)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          borderTopLeftRadius: 'var(--app-radius-lg)',
                          borderTopRightRadius: 'var(--app-radius-lg)',
                          overflow: 'hidden'
                        }}
                      >
                        <Box style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 100%)' }} />
                        <Group justify="space-between" style={{ position: 'absolute', left: 12, right: 12, bottom: 10 }}>
                          <Group gap="sm" align="center" style={{ flex: 1, minWidth: 0 }}>
                            <Text fw={800} size="lg" style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.5)', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                              {university.name}
                            </Text>
                          </Group>
                          <ActionIcon
                            variant="light"
                            onClick={() => handleToggleFavorite(university.id)}
                            style={{
                              background: 'rgba(255,255,255,0.2)',
                              color: '#fff',
                              border: '1px solid rgba(255,255,255,0.35)'
                            }}
                            title={favorites.has(university.id) ? 'Убрать из избранного' : 'В избранное'}
                          >
                            <IconHeart size={16} color={favorites.has(university.id) ? '#ef4444' : '#ffffff'} />
                          </ActionIcon>
                        </Group>
                      </Card.Section>
                    );
                  })()}

                  <Stack gap="xs" mt="md">
                    {/* Местоположение */}
                    <Group gap="xs">
                      <IconMapPin size={16} />
                      <Text size="sm" c="dimmed">{university.city || '—'}</Text>
                    </Group>

                    {/* Сложность поступления */}
                    {(() => {
                      const p = parseLevelToPercent(university.level);
                      return (
                        <Stack gap={4} style={{ width: '100%' }}>
                          <Group gap="xs">
                            <IconTrophy size={16} />
                            <Text size="sm" c="dimmed">Сложность</Text>
                            <Text size="xs" c="dimmed">{p == null ? '—' : `${Math.round(p)}%`}</Text>
                          </Group>
                          <Progress value={p || 0} color={getLevelColor(p ?? 0)} size="sm" radius="xl" />
                        </Stack>
                      );
                    })()}

                    {/* Кол-во студентов */}
                    {(() => {
                      const val = university.students ?? university.student_count;
                      const shown = (val === null || val === undefined)
                        ? '—'
                        : (() => { const num = Number(val); return isNaN(num) ? String(val) : num.toLocaleString(); })();
                      return (
                        <Group gap="xs">
                          <IconUsers size={16} />
                          <Text size="sm" c="dimmed">{shown} студентов</Text>
                        </Group>
                      );
                    })()}

                    {/* Дедлайн */}
                    <Group gap="xs">
                      <IconCalendar size={16} color="var(--mantine-color-blue-6)" />
                      <Text size="sm" c="dimmed">Дедлайн: {formatDate(university.deadline) || '—'}</Text>
                    </Group>
                  </Stack>

                  <Group gap="xs" mt="md">
                    {(university.programs || []).slice(0, 2).map((program, index) => (
                      <Badge key={index} variant="light" size="sm">
                        {program}
                      </Badge>
                    ))}
                    {(university.programs || []).length > 2 && (
                      <Badge variant="light" size="sm">
                        +{(university.programs || []).length - 2}
                      </Badge>
                    )}
                  </Group>

                  <Group justify="space-between" mt="md">
                    <Button
                      variant="light"
                      size="sm"
                      leftSection={<IconEye size={16} />}
                      onClick={() => handleViewDetails(university)}
                      radius="md"
                    >
                      Подробнее
                    </Button>
                    <Group gap="xs">
                      <Button
                        variant="subtle"
                        size="sm"
                        leftSection={<IconExternalLink size={14} />}
                        onClick={() => university.website && window.open(university.website, '_blank')}
                        disabled={!university.website}
                        title={university.website ? 'Открыть сайт' : 'Сайт не указан'}
                        radius="md"
                      >
                        Сайт
                      </Button>
                      <ActionIcon
                        variant="light"
                        size="sm"
                        onClick={() => handleDownloadInfo(university)}
                      >
                        <IconDownload size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        size="sm"
                        onClick={() => handleShare(university)}
                      >
                        <IconShare size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}

        {/* Пагинация */}
        {filteredUniversities.length > 0 && (
          <Group justify="center" mt="xl">
            <Pagination
              value={currentPage}
              onChange={setCurrentPage}
              total={Math.ceil(filteredUniversities.length / 12)}
              color="blue"
              radius="md"
            />
          </Group>
        )}
      </Box>

      {/* Модальное окно с деталями университета */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={selectedUniversity?.name}
        size="lg"
        centered
        overlayProps={{ backgroundOpacity: 0.45, blur: 3 }}
        transitionProps={{ transition: 'pop', duration: 200 }}
      >
        {selectedUniversity && (
          <Stack gap="md">
            {(() => {
              const src = getLogoSrc(selectedUniversity);
              return src ? (
                <Group justify="center">
                  <Image src={src} alt={selectedUniversity.name} h={80} fit="contain" radius="md" withPlaceholder />
                </Group>
              ) : null;
            })()}
            <Group>
              <IconMapPin size={16} />
              <Text>{selectedUniversity.city || '—'}</Text>
            </Group>
            {(() => {
              const p = parseLevelToPercent(selectedUniversity.level);
              return (
                <Stack gap={4} style={{ width: '100%' }}>
                  <Group>
                    <IconTrophy size={16} />
                    <Text>Сложность</Text>
                    <Text size="sm" c="dimmed">{p == null ? '—' : `${Math.round(p)}%`}</Text>
                  </Group>
                  <Progress value={p || 0} color={getLevelColor(p ?? 0)} size="sm" radius="xl" />
                </Stack>
              );
            })()}
            
            <Group>
              <IconUsers size={16} />
              <Text>{(selectedUniversity.students ?? selectedUniversity.student_count ?? 0).toLocaleString()} студентов</Text>
            </Group>
            
            <Group>
              <IconCalendar size={16} />
              <Text>Дедлайн: {selectedUniversity.deadline || '—'}</Text>
            </Group>
            
            {(selectedUniversity.programs && selectedUniversity.programs.length > 0) && (
              <>
                <Text fw={500}>Программы:</Text>
                <Group gap="xs">
                  {(selectedUniversity.programs || []).map((program, index) => (
                    <Badge key={index} variant="light">
                      {program}
                    </Badge>
                  ))}
                </Group>
              </>
            )}
            
            <Text fw={500}>Описание:</Text>
            <Text size="sm" c="dimmed">
              {selectedUniversity.description || 'Описание недоступно'}
            </Text>
            
            <Group justify="space-between" mt="md">
              <Button
                leftSection={<IconDownload size={16} />}
                onClick={() => handleDownloadInfo(selectedUniversity)}
              >
                Скачать информацию
              </Button>
              <Button
                leftSection={<IconExternalLink size={16} />}
                onClick={() => handleApply(selectedUniversity)}
              >
                Подать заявку
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Box>
  );
};

export default UniversitiesSection;
