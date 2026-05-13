import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../../../../store/educationSlice';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { educationAPI } from '../../../../shared/services/api';
import {
  Box,
  Grid,
  Card,
  Text,
  Group,
  Badge,
  Button,
  Stack,
  Modal,
  TextInput,
  Textarea,
  Skeleton,
  Alert,
  Paper,
  Progress,
  ThemeIcon,
} from '@mantine/core';
import { useMantineTheme } from '@mantine/core';
import { Calendar, DateInput } from '@mantine/dates';
import { IconClock, IconTrash, IconFlame, IconTarget, IconTrophy, IconLanguage } from '@tabler/icons-react';
import PullToRefresh from '../../../../shared/components/Mobile/PullToRefresh.jsx';

import CircularProgress from '../../../../shared/components/Animations/CircularProgress';

const VOCAB_ITEMS = [
  { word: 'Immatricolazione', translation: 'Зачисление в университет', context: 'La immatricolazione è il primo passo.' },
  { word: 'Tassa universitaria', translation: 'Университетский взнос', context: 'La tassa si paga ogni anno.' },
  { word: 'Laurea triennale', translation: 'Степень бакалавра (3 года)', context: 'Ho conseguito la laurea triennale.' },
  { word: 'Laurea magistrale', translation: 'Степень магистра', context: 'Studio per la laurea magistrale.' },
  { word: 'Modulo di domanda', translation: 'Форма заявки', context: 'Compila il modulo di domanda online.' },
  { word: 'Borsa di studio', translation: 'Стипендия', context: 'Ho vinto una borsa di studio.' },
  { word: 'Dichiarazione di Valore', translation: 'Декларация о ценности диплома', context: 'La DOV è richiesta per l\'iscrizione.' },
  { word: 'Piano di studi', translation: 'Учебный план', context: 'Il piano di studi è approvato.' },
  { word: 'Libretto universitario', translation: 'Зачётная книжка', context: 'Il libretto registra gli esami.' },
  { word: 'Crediti formativi', translation: 'Кредиты / Зачётные единицы', context: 'Ogni esame vale dei crediti formativi.' },
  { word: 'Propedeutico', translation: 'Вводный / подготовительный курс', context: 'Il corso propedeutico è obbligatorio.' },
  { word: 'Ateneo', translation: 'Университет', context: 'L\'ateneo è molto rinomato.' },
];

const MainPage = ({ isMobile = false, isTablet = false }) => {
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === 'dark';
  const dispatch = useDispatch();
  const { user } = useAuth();
  const _mainPageRef = useRef(null);
  
  // Redux state
  const { loading, error, dashboardStats } = useSelector((state) => state.education);
  const [deadlines, _setDeadlines] = useState([]);
  const [_deadlinesLoading, _setDeadlinesLoading] = useState(false);
  const [_deadlinesError, _setDeadlinesError] = useState(null);
  
  // Адаптивные значения
  const getResponsiveValue = (mobile, tablet, desktop) => {
    if (isMobile) return mobile;
    if (isTablet) return tablet;
    return desktop;
  };
  
  // Theme aware design tokens
  const colors = {
    page: isDark ? '#0b1220' : '#f8fafc',
    surface: isDark ? '#0f172a' : theme.white,
    surfaceAlt: isDark ? '#1f2937' : '#f1f5f9',
    surfaceMuted: isDark ? '#1e293b' : '#eef2f6',
    textPrimary: isDark ? theme.white : '#1f2937',
    textSecondary: isDark ? '#cbd5e1' : '#475569',
    textDimmed: isDark ? '#94a3b8' : '#64748b',
    divider: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
    cardBorder: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
    timeCardBg: isDark ? '#1e293b' : '#ffffff',
    timeCardNumber: isDark ? theme.white : '#1f2937',
    deadlineDot: isDark ? theme.colors.red[6] : theme.colors.red[5],
    eventCardBg: isDark ? '#1e293b' : '#ffffff',
    eventCardTitle: isDark ? theme.white : '#111827',
    eventCardDate: isDark ? '#94a3b8' : '#64748b',
    progressCardBg: isDark ? '#0f172a' : '#ffffff'
  };

  const calculateStatusText = (progress) => {
    if (progress === 100) return "Completed";
    if (progress > 0) return "In progress";
    return "Not started";
  };

  // Вычисляем общий прогресс на основе заполненности профиля
  const calculateOverallProgress = () => {
    if (!user || !user.profile) return 0;
    
    const fields = [
      user.phone,
      user.country,
      user.city,
      user.profile.education_background,
      user.profile.interests?.length > 0,
      user.profile.goals?.length > 0,
      Object.keys(user.profile.language_levels || {}).length > 0,
      user.profile.preferred_countries?.length > 0,
      user.profile.budget_range,
      user.profile.study_duration
    ];
    
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const overallProgress = calculateOverallProgress();

  // Пользовательские события
  const [userEvents, setUserEvents] = useState([]);
  const [eventsError, setEventsError] = useState(null);
  const [savingEvent, setSavingEvent] = useState(false);
  
  useEffect(() => {
    let cancelled = false;
    const loadUserEvents = async () => {
      try {
        const res = await educationAPI.listEvents();
        const arr = Array.isArray(res?.data) ? res.data : [];
        const mapped = arr
          .map((e) => ({ id: e.id, title: e.title, date: new Date(e.date), type: 'note' }))
          .filter((e) => e.date && !isNaN(e.date));
        mapped.sort((a, b) => a.date - b.date);
        if (!cancelled) { setUserEvents(mapped); setEventsError(null); }
      } catch (err) {
        console.error('Failed to load user events', err);
        if (!cancelled) setEventsError('Не удалось загрузить события');
      }
    };
    loadUserEvents();
    return () => { cancelled = true; };
  }, []);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [focusedEventId, setFocusedEventId] = useState(null);
  const [_now, setNow] = useState(new Date());
  
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');
  const toYMD = useCallback((d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, []);
  
  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Merge deadlines + user events
  const allEvents = useMemo(() => {
    const merged = [
      ...deadlines.map((d) => ({ ...d, type: d.type || 'deadline' })),
      ...userEvents.map((e) => ({ ...e, type: 'note' })),
    ]
      .filter((e) => e?.date instanceof Date && !isNaN(e.date))
      .sort((a, b) => a.date - b.date);
    return merged;
  }, [deadlines, userEvents]);

  const deadlineDatesSet = useMemo(() => new Set(allEvents.map((d) => toYMD(d.date))), [allEvents, toYMD]);

  const safeSelectedDate = useMemo(() => {
    const v = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
    return Number.isNaN(v.getTime()) ? new Date() : v;
  }, [selectedDate]);

  const selectedDayEvents = useMemo(() => {
    const key = toYMD(safeSelectedDate);
    return allEvents.filter((d) => toYMD(d.date) === key);
  }, [allEvents, safeSelectedDate, toYMD]);

  // Modal для добавления события
  const [opened, setOpened] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date());
  const canSave = newTitle.trim().length > 0 && newDate;

  const onSaveNote = async () => {
    if (!canSave) return;
    setSavingEvent(true);
    try {
      const res = await educationAPI.createEvent({
        title: newTitle.trim(),
        date: newDate.toISOString(),
      });
      const item = {
        id: res?.data?.id || Date.now(),
        title: newTitle.trim(),
        date: newDate,
        type: 'note',
      };
      setUserEvents((prev) => [...prev, item].sort((a, b) => a.date - b.date));
      setSelectedDate(item.date);
      setFocusedEventId(item.id);
      setEventsError(null);
    } catch (e) {
      console.error('Failed to create user event', e);
      setEventsError('Не удалось сохранить событие');
      return;
    } finally {
      setSavingEvent(false);
    }
    setOpened(false);
    setNewTitle('');
  };

  const removeNote = async (id) => {
    try {
      await educationAPI.deleteEvent(id);
    } catch (e) {
      console.error('Failed to delete user event', e);
    }
    setUserEvents((prev) => prev.filter((e) => e.id !== id));
    setFocusedEventId((curr) => (curr === id ? null : curr));
  };

  // Обновление данных
  const handleRefresh = async () => {
    try {
      await dispatch(fetchDashboardStats()).unwrap();
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  // Show loading state
  if (loading.dashboardStats && !user) {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <Card key={i} withBorder p="md" radius="md" mb="md">
            <Skeleton height={120} />
          </Card>
        ))}
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <Alert color="red" title="Error" mb="xl" radius="md">
        {error}
      </Alert>
    );
  }

  const content = (
    <>
      {/* Header */}
      <Group mb={getResponsiveValue('md', 'lg', 'xl')}>
        <Text 
          size={getResponsiveValue('lg', 'xl', 'xl')} 
          fw={800} 
          style={{
            background: 'linear-gradient(90deg, #3b82f6 0%, #0ea5e9 50%, #14b8a6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
            fontSize: getResponsiveValue('20px', '24px', '28px'),
            lineHeight: getResponsiveValue(1.3, 1.4, 1.5)
          }}
        >
          Добро пожаловать, {user?.first_name || 'Пользователь'}!
        </Text>
      </Group>

      {/* Learning Overview */}
      <Grid mb={getResponsiveValue('sm', 'md', 'md')} gutter="sm">
        <Grid.Col span={{ base: 12, xs: 4 }}>
          <Paper withBorder radius="md" p="md" style={{ background: isDark ? '#1e293b' : '#fff7ed' }}>
            <Group gap="sm" align="center">
              <ThemeIcon size={40} radius="md" color="orange" variant="light">
                <IconFlame size={22} />
              </ThemeIcon>
              <Box>
                <Text size="xl" fw={800} style={{ color: isDark ? '#fdba74' : '#ea580c' }}>
                  {dashboardStats?.current_streak ?? 0}
                </Text>
                <Text size="xs" c="dimmed">дней подряд</Text>
              </Box>
            </Group>
            <Text size="xs" c="dimmed" mt={6}>Учебная серия</Text>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 4 }}>
          <Paper withBorder radius="md" p="md" style={{ background: isDark ? '#1e293b' : '#eff6ff' }}>
            <Group gap="sm" align="center">
              <ThemeIcon size={40} radius="md" color="blue" variant="light">
                <IconTarget size={22} />
              </ThemeIcon>
              <Box style={{ flex: 1 }}>
                <Text size="xl" fw={800} style={{ color: isDark ? '#93c5fd' : '#2563eb' }}>
                  {dashboardStats?.weekly_progress ?? 0}
                  <Text span size="sm" fw={400} c="dimmed"> / {dashboardStats?.weekly_goal ?? 20}</Text>
                </Text>
                <Text size="xs" c="dimmed">задач на неделе</Text>
              </Box>
            </Group>
            <Progress
              value={Math.round(((dashboardStats?.weekly_progress ?? 0) / (dashboardStats?.weekly_goal ?? 20)) * 100)}
              color="blue" size="xs" mt={8} radius="xl"
            />
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 4 }}>
          <Paper withBorder radius="md" p="md" style={{ background: isDark ? '#1e293b' : '#fefce8' }}>
            <Group gap="sm" align="center">
              <ThemeIcon size={40} radius="md" color="yellow" variant="light">
                <IconTrophy size={22} />
              </ThemeIcon>
              <Box>
                <Text size="xl" fw={800} style={{ color: isDark ? '#fde047' : '#ca8a04' }}>
                  {dashboardStats?.achievements_unlocked ?? 0}
                </Text>
                <Text size="xs" c="dimmed">достижений</Text>
              </Box>
            </Group>
            <Text size="xs" c="dimmed" mt={6}>Получено наград</Text>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Vocabulary of the Day */}
      {(() => {
        const vocab = VOCAB_ITEMS[new Date().getDate() % VOCAB_ITEMS.length];
        return (
          <Card withBorder radius="md" p="md" mb={getResponsiveValue('sm', 'md', 'md')}
            style={{ background: isDark ? '#0f172a' : '#f0fdf4', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#86efac' }}>
            <Group gap="sm" mb={8}>
              <ThemeIcon size={32} radius="md" color="green" variant="light">
                <IconLanguage size={18} />
              </ThemeIcon>
              <Text size="sm" fw={600} c="green">Слово дня</Text>
            </Group>
            <Text size="xl" fw={800} mb={4} style={{ color: isDark ? '#86efac' : '#15803d' }}>{vocab.word}</Text>
            <Text size="md" fw={500} mb={2}>{vocab.translation}</Text>
            <Text size="sm" c="dimmed" fs="italic">{vocab.context}</Text>
          </Card>
        );
      })()}

      {/* Calendar Card */}
      <Card 
        withBorder 
        p={getResponsiveValue('sm', 'md', 'md')} 
        radius="md" 
        style={{ 
          background: colors.surface, 
          color: colors.textPrimary, 
          transition: 'background 150ms ease,color 150ms ease',
          marginBottom: getResponsiveValue('sm', 'md', 'lg')
        }}
        className={isMobile ? 'mobile-card' : isTablet ? 'tablet-card' : ''}
      >
        <Group position="apart" mb="sm">
          <Text 
            size={getResponsiveValue('md', 'lg', 'lg')} 
            weight={800} 
            style={{ 
              letterSpacing: 1.1, 
              fontFamily: 'Nunito Sans, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif', 
              color: colors.textPrimary 
            }}
          >
            Календарь
          </Text>
        </Group>
        
        <Calendar
          value={safeSelectedDate}
          onChange={(v) => setSelectedDate(v ?? new Date())}
          locale="ru"
          style={{ 
            width: '100%',
            maxWidth: '100%',
            fontSize: isMobile ? '14px' : '16px'
          }}
          size={getResponsiveValue('sm', 'md', 'md')}
          minDate={startOfToday}
          getDayProps={(date) => {
            const value = date instanceof Date ? date : new Date(date);
            const isPast = value < startOfToday;
            const hasDeadline = deadlineDatesSet.has(toYMD(value));
            return {
              style: {
                color: isPast ? colors.textDimmed : hasDeadline ? colors.deadlineDot : colors.textPrimary,
                backgroundColor: toYMD(value) === toYMD(safeSelectedDate) ? colors.surfaceMuted : undefined,
                fontWeight: hasDeadline ? 700 : 400,
                position: 'relative'
              }
            };
          }}
        />
        
        <Box mt="md">
          <Text size="md" weight={600} style={{ color: colors.textPrimary }} mb="sm">
            События на {toYMD(safeSelectedDate)}
          </Text>
          {selectedDayEvents.length === 0 ? (
            <Text size="sm" style={{ color: colors.textSecondary }}>Нет событий</Text>
          ) : (
            <Stack spacing="xs">
              {selectedDayEvents.map((event, index) => (
                <Card
                  key={`${event.id}-${index}`}
                  withBorder
                  p="xs"
                  radius="sm"
                  style={{
                    background: event.type === 'note' ? colors.surfaceAlt : colors.eventCardBg,
                    borderColor: event.id === focusedEventId ? colors.deadlineDot : colors.divider,
                    borderWidth: event.id === focusedEventId ? 2 : 1,
                    cursor: 'pointer'
                  }}
                  onClick={() => setFocusedEventId(event.id === focusedEventId ? null : event.id)}
                >
                  <Group position="apart" align="flex-start">
                    <Box style={{ flex: 1 }}>
                      <Text size="sm" weight={600} style={{ color: colors.eventCardTitle }}>
                        {event.title}
                      </Text>
                      <Text size="xs" style={{ color: colors.eventCardDate }}>
                        {event.type === 'note' ? 'Заметка' : 'Дедлайн'} • {event.date.toLocaleDateString('ru')}
                      </Text>
                    </Box>
                    {event.type === 'note' && (
                      <Button
                        variant="subtle"
                        color="red"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNote(event.id);
                        }}
                        style={{
                          padding: '2px 6px',
                          minHeight: 'auto',
                          fontSize: '11px'
                        }}
                      >
                        Удалить
                      </Button>
                    )}
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
          <Group position="right" mt="sm">
            <Button onClick={() => { 
              const init = safeSelectedDate instanceof Date ? new Date(safeSelectedDate) : new Date(); 
              setNewDate(init); 
              setOpened(true); 
            }}>
              Добавить событие
            </Button>
          </Group>
        </Box>
      </Card>

      {/* Progress Card */}
      <Card 
        withBorder 
        p="md" 
        radius="md" 
        style={{ 
          background: colors.surface, 
          transition: 'background 150ms ease'
        }}
        className={isMobile ? 'mobile-card' : isTablet ? 'tablet-card' : ''}
      >
        <Group position="apart" mb="sm">
          <Text size="lg" weight={700} style={{ color: colors.textPrimary }}>Прогресс профиля</Text>
          <Badge color="green">{calculateStatusText(overallProgress)}</Badge>
        </Group>
        
        <Group align="center" spacing="md" wrap="nowrap" style={{ 
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '16px' : undefined
        }}>
          <CircularProgress 
            value={overallProgress} 
            size={getResponsiveValue(140, 180, 220)} 
            strokeWidth={getResponsiveValue(10, 12, 14)} 
            color="#37B34A" 
            textColor={isDark ? '#ffffff' : '#000000'} 
          />
          <Stack spacing={6} style={{ 
            minWidth: isMobile ? '100%' : getResponsiveValue(180, 200, 220),
            maxWidth: '100%'
          }}>
            <Group position="apart">
              <Text size="sm" style={{ color: colors.textPrimary }}>Личные данные</Text>
              <Badge color={user?.phone && user?.country && user?.city ? 'green' : 'gray'}>
                {user?.phone && user?.country && user?.city ? 'Заполнено' : 'Не заполнено'}
              </Badge>
            </Group>
            <Group position="apart">
              <Text size="sm" style={{ color: colors.textPrimary }}>Образование</Text>
              <Badge color={user?.profile?.education_background ? 'green' : 'gray'}>
                {user?.profile?.education_background ? 'Заполнено' : 'Не заполнено'}
              </Badge>
            </Group>
            <Group position="apart">
              <Text size="sm" style={{ color: colors.textPrimary }}>Интересы и цели</Text>
              <Badge color={user?.profile?.interests?.length > 0 && user?.profile?.goals?.length > 0 ? 'green' : 'gray'}>
                {user?.profile?.interests?.length > 0 && user?.profile?.goals?.length > 0 ? 'Заполнено' : 'Не заполнено'}
              </Badge>
            </Group>
            <Group position="apart">
              <Text size="sm" style={{ color: colors.textPrimary }}>Языковые навыки</Text>
              <Badge color={Object.keys(user?.profile?.language_levels || {}).length > 0 ? 'green' : 'gray'}>
                {Object.keys(user?.profile?.language_levels || {}).length > 0 ? 'Заполнено' : 'Не заполнено'}
              </Badge>
            </Group>
            <Group position="apart">
              <Text size="sm" style={{ color: colors.textPrimary }}>Предпочтения</Text>
              <Badge color={user?.profile?.preferred_countries?.length > 0 && user?.profile?.budget_range && user?.profile?.study_duration ? 'green' : 'gray'}>
                {user?.profile?.preferred_countries?.length > 0 && user?.profile?.budget_range && user?.profile?.study_duration ? 'Заполнено' : 'Не заполнено'}
              </Badge>
            </Group>
          </Stack>
        </Group>
      </Card>

      <Modal opened={opened} onClose={() => setOpened(false)} title="Новая заметка" centered withinPortal>
        <Stack>
          <TextInput 
            label="Заголовок" 
            placeholder="Например: Подготовить документы" 
            value={newTitle} 
            onChange={(e) => setNewTitle(e.currentTarget.value)} 
            required 
          />
          <DateInput 
            label="Дата" 
            value={newDate} 
            onChange={(v) => setNewDate(v ?? new Date())} 
            minDate={startOfToday} 
            required 
            locale="ru" 
          />
          {eventsError && <Alert color="red">{eventsError}</Alert>}
          <Group position="right" mt="sm">
            <Button variant="default" onClick={() => setOpened(false)}>Отмена</Button>
            <Button onClick={onSaveNote} disabled={!canSave || savingEvent} loading={savingEvent}>
              Сохранить
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );

  return isMobile ? (
    <PullToRefresh onRefresh={handleRefresh}>
      {content}
    </PullToRefresh>
  ) : (
    content
  );
};

export default MainPage;
