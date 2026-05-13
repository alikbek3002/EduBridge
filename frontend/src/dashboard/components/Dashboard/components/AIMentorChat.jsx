import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Stack, Text, Group, Textarea, Avatar, ScrollArea, ThemeIcon, Card } from '@mantine/core';
import { IconRobot, IconSend, IconChecks, IconBulb, IconMessageCircle } from '@tabler/icons-react';
import styles from '../RightPanel.module.css';
import api, { API_BASE_URL } from '../../../../shared/services/api';
import { useAuth } from '../../../../shared/hooks/useAuth';

const MODEL = 'claude-haiku-4-5-20251001';

const AIMentorChat = ({ showHeader = false, title = 'Чат с AIMentor', fullHeight = true, initialMessage = '' }) => {
  const { user } = useAuth();

  const [aiMessage, setAiMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (initialMessage) setAiMessage(initialMessage);
  }, [initialMessage]);

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

  // Persist chat to localStorage only
  useEffect(() => {
    const key = user?.id ? `aimentor_chat_${user.id}` : 'aimentor_chat_guest';
    try {
      localStorage.setItem(key, JSON.stringify(chatHistory));
    } catch {
      // Ignore localStorage write failures.
    }
  }, [chatHistory, user?.id]);

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
    const updatedHistory = [...chatHistory, { id: now, role: 'user', content: message, timestamp: now }];
    setChatHistory(updatedHistory);
    setAiMessage('');

    setIsTyping(true);
    try {
      const payload = {
        messages: updatedHistory.map((m) => ({ role: m.role, content: m.content })),
        model: MODEL,
        temperature: 0.7,
        max_tokens: 600,
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
