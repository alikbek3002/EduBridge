import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Stack, Text, Group, Textarea, ActionIcon, Avatar, ScrollArea, Alert, ThemeIcon, Card } from '@mantine/core';
import { IconRobot, IconSend, IconChecks, IconAlertCircle, IconBulb, IconMessageCircle, IconX } from '@tabler/icons-react';
import styles from '../RightPanel.module.css';
import api, { API_BASE_URL } from '../../../../shared/services/api';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { useDashboardStore } from '../../../../store/dashboardStore';
import { fetchAIRecommendations, fetchAchievements, fetchDashboardStats, fetchUniversities } from '../../../../store/educationSlice';

const AIMentorChat = ({ showHeader = false, title = 'Чат с AIMentor', fullHeight = true }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useAuth();

  // Redux state used for building student context
  const { 
    aiRecommendations = [],
    achievements = [],
    dashboardStats = null,
    universities = [],
    error: errorEdu
  } = useSelector((state) => state.education);

  // From zustand dashboard store
  const selectedUniversitiesSet = useDashboardStore((s) => s.selectedUniversities);
  const deadlines = useDashboardStore((s) => s.deadlines) || [];

  // Local chat state
  const [aiMessage, setAiMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState(null);
  const messagesEndRef = useRef(null);

  // Load persisted chat from localStorage
  useEffect(() => {
    const key = user?.id ? `aimentor_chat_${user.id}` : 'aimentor_chat_guest';
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setChatHistory(parsed);
      }
    } catch {
      // Ignore corrupted local cache.
    }
  }, [user?.id]);

  // Persist chat to localStorage and best-effort backend save
  useEffect(() => {
    const key = user?.id ? `aimentor_chat_${user.id}` : 'aimentor_chat_guest';
    try {
      localStorage.setItem(key, JSON.stringify(chatHistory));
    } catch {
      // Ignore localStorage write failures.
    }
    // Optional backend persistence (ignore errors)
    const save = async () => {
      try {
        await api.post('/api/education/ai/conversations/save/', { messages: chatHistory });
      } catch {
        // Backend persistence is best-effort only.
      }
    };
    if (chatHistory.length) save();
  }, [chatHistory, user?.id]);

  // Ensure base data exists
  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(fetchAIRecommendations());
    dispatch(fetchAchievements());
    dispatch(fetchDashboardStats());
  }, [dispatch, isAuthenticated]);

  // If user selected universities and none loaded, fetch list to resolve names
  useEffect(() => {
    if (!isAuthenticated) return;
    const hasSelected = selectedUniversitiesSet && selectedUniversitiesSet.size > 0;
    if (hasSelected && (!Array.isArray(universities) || universities.length === 0)) {
      dispatch(fetchUniversities());
    }
  }, [dispatch, isAuthenticated, selectedUniversitiesSet, universities]);

  // Auto-scroll on updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isTyping]);

  const userAvatarSrc = useMemo(() => {
    const avatarRaw = user?.avatar || '';
    return avatarRaw
      ? ((avatarRaw.startsWith('http://') || avatarRaw.startsWith('https://'))
          ? avatarRaw
          : `${API_BASE_URL}${avatarRaw.startsWith('/') ? '' : '/'}${avatarRaw}`)
      : undefined;
  }, [user?.avatar]);

  const handleSendMessage = async () => {
    const message = aiMessage.trim();
    if (!message || isTyping) return;
    setChatError(null);

    const now = Date.now();
    setChatHistory((prev) => [...prev, { id: now, role: 'user', content: message, timestamp: now }]);
    setAiMessage('');

    // Build student context (ported from right panel)
    const studentContext = (() => {
      if (!isAuthenticated) return '';
      const prof = user?.profile || {};
      const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username || user?.email || 'Студент';
      const firstName = (user?.first_name || fullName.split(' ')[0] || 'Студент').trim();
      let age = undefined;
      let birthDateStr = undefined;
      if (user?.date_of_birth) {
        const dob = new Date(user.date_of_birth);
        if (!isNaN(dob.getTime())) {
          const diffMs = Date.now() - dob.getTime();
          const ageDate = new Date(diffMs);
          age = Math.abs(ageDate.getUTCFullYear() - 1970);
          birthDateStr = dob.toLocaleDateString('ru-RU');
        }
      }
      const ieltsCurrent = prof?.ielts_current_score ?? undefined;
      const ieltsTarget = prof?.ielts_target_score ?? undefined;
      const tolcCurrent = prof?.tolc_current_score ?? undefined;
      const tolcTarget = prof?.tolc_target_score ?? undefined;
      const examDateRaw = prof?.ielts_exam_date || prof?.exam_date;
      let examDate = undefined;
      if (examDateRaw) {
        const d = new Date(examDateRaw);
        if (!isNaN(d.getTime())) examDate = d.toLocaleDateString();
      }
      const tolcExamRaw = prof?.tolc_exam_date;
      let tolcExamDate = undefined;
      if (tolcExamRaw) {
        const td = new Date(tolcExamRaw);
        if (!isNaN(td.getTime())) tolcExamDate = td.toLocaleDateString();
      }
      const overall = (dashboardStats && (dashboardStats.overall_progress ?? dashboardStats.progress)) ?? undefined;
      const stats = dashboardStats || {};
      const upcoming = Array.isArray(deadlines) ? deadlines.slice(0, 3).map((d) => {
        const due = d?.due_date ? new Date(d.due_date).toLocaleDateString() : '—';
        const days = typeof d?.days === 'number' ? `${d.days} дн.` : '';
        return `${d?.title || 'Задача'} — до ${due}${days ? ` (${days})` : ''}`;
      }) : [];
      const applications = [];
      const submittedFirst = applications.find(a => a.status === 'submitted' || a.status === 'under_review' || a.status === 'accepted');
      const latestApp = submittedFirst || applications[0];
      const targetUniv = latestApp?.university?.name || '';
      const targetMajor = latestApp?.major?.name || '';
      const selectedIds = Array.from(selectedUniversitiesSet || []);
      const selectedNames = (Array.isArray(universities) ? universities : [])
        .filter(u => selectedIds.includes(u.id))
        .map(u => u.name);
      const docSummary = '';
      return [
        'Контекст студента:',
        `- Имя: ${fullName} (обращайся только по имени: ${firstName})`,
        ...(birthDateStr ? [`- Дата рождения: ${birthDateStr}`] : []),
        ...(age !== undefined ? [`- Возраст: ${age}`] : []),
        `- IELTS текущий: ${ieltsCurrent ?? 'не указано'}`,
        `- IELTS цель: ${ieltsTarget ?? 'не указано'}`,
        `- Дата экзамена IELTS: ${examDate ?? 'не указана'}`,
        `- TOLC текущий: ${tolcCurrent ?? 'не указано'}`,
        `- TOLC цель: ${tolcTarget ?? 'не указано'}`,
        `- Дата экзамена TOLC: ${tolcExamDate ?? 'не указана'}`,
        `- Общий прогресс: ${overall ?? '—'}${typeof overall === 'number' ? '%' : ''}`,
        `- IELTS сдан: ${stats.ielts_completed === true ? 'да' : 'нет'}`,
        `- Университет выбран: ${stats.universities_selected === true ? 'да' : 'нет'}`,
        `- Регистрация Universitaly: ${stats.universitaly_registration === true ? 'есть' : 'нет'}`,
        `- Виза: ${stats.visa_obtained === true ? 'получена' : 'нет'}`,
        `- Целевой университет: ${targetUniv || (selectedNames[0] || 'не выбран')}`,
        `- Факультет/специальность: ${targetMajor || 'не выбран'}`,
        `${selectedNames.length ? `- Выбранные университеты: ${selectedNames.join(', ')}` : ''}`,
        `- Документы загружены: ${docSummary || 'пока нет'}`,
        `- Достижений: ${Array.isArray(achievements) ? achievements.length : 0}`,
        `- Рекомендаций ИИ: ${Array.isArray(aiRecommendations) ? aiRecommendations.length : 0}`,
        `- Ближайшие дедлайны: ${upcoming.length ? upcoming.join('; ') : 'нет'}`,
        `Правила ответа: обращайся к пользователю строго по имени "${firstName}"; учитывай указанные цели/сроки/статусы (экзамены, виза, документы, университет/факультет). Предлагай конкретные следующие шаги. Отвечай кратко.`
      ].join('\n');
    })();

    setIsTyping(true);
    try {
      const payload = {
        messages: [
          { role: 'system', content: 'Ты — дружелюбный помощник по учебе. Отвечай кратко и по делу. Обращайся по имени.' },
          ...(studentContext ? [{ role: 'system', content: studentContext }] : []),
          ...chatHistory.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: message }
        ],
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 1650,
      };
      const res = await api.post('/api/education/ai/chat/', payload);
      const assistant = res.data?.content || 'Не удалось получить ответ.';
      const ts = Date.now();
      setChatHistory((prev) => [...prev, { id: ts, role: 'assistant', content: assistant, timestamp: ts }]);
    } catch {
      const fallback = 'Произошла ошибка сервиса ИИ. Попробуйте позже.';
      const ts = Date.now();
      setChatHistory((prev) => [...prev, { id: ts, role: 'assistant', content: fallback, timestamp: ts }]);
      setChatError('Ошибка запроса к ИИ. Проверьте, что бэкенд запущен (порт 8000).');
    } finally {
      setIsTyping(false);
    }
  };

  const containerHeight = fullHeight ? 'calc(100vh - 140px)' : 520;

  return (
    <Card shadow="md" p="lg" radius="lg" withBorder style={{ background: 'var(--app-color-surface)', height: fullHeight ? '100vh' : undefined, display: 'flex', flexDirection: 'column' }}>
      {showHeader && (
        <Group position="apart" mb="md">
          <Text size="lg" fw={600}>{title}</Text>
          <ThemeIcon size="lg" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
            <IconBulb size={20} />
          </ThemeIcon>
        </Group>
      )}

      {errorEdu && (
        <Alert icon={<IconAlertCircle size={16} />} title="Ошибка" color="red" radius="md" mb="md">
          Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.
        </Alert>
      )}

      <Box className={styles.chatContainer} style={{ display: 'flex', flexDirection: 'column', height: containerHeight, flex: 1, width: '100%' }}>
        <ScrollArea offsetScrollbars className={styles.chatMessages} style={{ flex: 1, height: '100%' }}>
          <Stack spacing="sm">
            {chatHistory.length === 0 && (
              <Text size="sm" c="dimmed" ta="center">
                Начните диалог — задайте вопрос в поле ниже
              </Text>
            )}
            {chatHistory.map((msg) => (
              <div key={msg.id} className={`${styles.messageRow} ${msg.role === 'user' ? styles.messageRight : styles.messageLeft}`}>
                {msg.role !== 'user' && (
                  <div className={styles.msgAvatar}>
                    <Avatar radius="xl" size={64} color="green" src={null} style={{ background:'#e0f7fa' }}>
                      <IconRobot size={20} />
                    </Avatar>
                  </div>
                )}
                <Box className={`${styles.bubble} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`} p="sm">
                  <Text size="lg" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</Text>
                  <Group gap={6} align="center" style={{ marginTop: 4, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    {msg.role !== 'user' && <IconRobot size={14} color="#16a34a" />}
                    <Text size="xs" c="dimmed">
                      {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    {msg.role === 'user' && <IconChecks size={14} color="#60a5fa" />}
                  </Group>
                </Box>
                {msg.role === 'user' && (
                  <div className={styles.msgAvatar}>
                    <Avatar radius="xl" size={64} color="blue" src={userAvatarSrc} style={{ background:'#e3f2fd' }}>
                      <IconMessageCircle size={20} />
                    </Avatar>
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <Group position="left" spacing={8} align="flex-end">
                <Avatar radius="xl" size={64} color="green" src={null} style={{ background:'#e0f7fa' }}>
                  <IconRobot size={20} />
                </Avatar>
                <Box className={styles.aiMessage} p="sm">
                  <Text size="md" c="dimmed">Печатает…</Text>
                </Box>
              </Group>
            )}
            <div ref={messagesEndRef} />
          </Stack>
        </ScrollArea>

        <Box className={styles.chatInputBar} style={{ width: '100%' }}>
          <div className={styles.telegramInput} style={{ width: '100%' }}>
            <Textarea
              value={aiMessage}
              onChange={(e) => setAiMessage(e.target.value)}
              placeholder="Напишите сообщение..."
              autosize
              minRows={1}
              maxRows={4}
              classNames={{ input: styles.telegramTextarea, root: { width: '100%' } }}
              style={{ width: '100%' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <div 
              className={styles.telegramSendBtn}
              onClick={handleSendMessage}
              style={{ opacity: !aiMessage.trim() || isTyping ? 0.6 : 1 }}
            >
              <IconSend size={18} />
            </div>
          </div>
        </Box>
      </Box>

      {chatError && (
        <Text size="xs" c="red" mt="xs">
          {chatError}
        </Text>
      )}
    </Card>
  );
};

export default AIMentorChat;


