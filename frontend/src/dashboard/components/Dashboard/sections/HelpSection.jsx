import React, { useState } from 'react';
import { Box, Stack, Paper, Text, Group, TextInput, Textarea, Button, Card, Badge, Anchor } from '@mantine/core';
import { IconHelp, IconSearch, IconMail, IconBug, IconBook } from '@tabler/icons-react';

const faqs = [
  {
    q: 'Как изменить тему и язык интерфейса?',
    a: 'Откройте раздел Настройки → Предпочтения. Тема применяется сразу и сохраняется автоматически.',
    tags: ['настройки', 'тема', 'язык']
  },
  {
    q: 'Как загрузить фото профиля?',
    a: 'В Настройках в блоке «Личная информация» нажмите «Загрузить фото». Изменения сохраняются по кнопке Сохранить.',
    tags: ['профиль', 'аватар']
  },
  {
    q: 'Как включить 2FA?',
    a: 'Настройки → 2FA: сгенерируйте секрет/QR, добавьте в приложение и подтвердите кодом. Отключить можно там же.',
    tags: ['безопасность', '2fa']
  },
  {
    q: 'Почему некоторые карточки светлые в тёмной теме?',
    a: 'Мы постепенно переводим все блоки на дизайн‑токены. Обновите страницу; если осталось — сообщите через форму ниже.',
    tags: ['тема', 'ui']
  }
];

export default function HelpSection() {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const filtered = faqs.filter((f) => {
    const s = (query || '').toLowerCase();
    if (!s) return true;
    return f.q.toLowerCase().includes(s) || f.a.toLowerCase().includes(s) || (f.tags || []).some(t => t.includes(s));
  });

  return (
    <Box>
      <Stack gap="md">
        <Group align="center" gap="xs">
          <IconHelp size={18} />
          <Text size="lg" fw={600}>Помощь и поддержка</Text>
        </Group>

        <Paper p="var(--app-spacing-md)" withBorder shadow="sm" style={{ background: 'var(--app-color-surface)' }}>
          <Text fw={600} mb="sm">Поиск по FAQ</Text>
          <TextInput
            placeholder="Введите вопрос: 2FA, тема, профиль..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftSection={<IconSearch size={16} />}
          />
        </Paper>

        <Stack>
          {filtered.map((f, i) => (
            <Card key={i} withBorder radius="md" shadow="sm" style={{ background: 'var(--app-color-surface)' }}>
              <Text fw={600} mb={4}>{f.q}</Text>
              <Text c="dimmed" size="sm">{f.a}</Text>
              <Group gap={6} mt={8}>
                {(f.tags || []).map((t) => (
                  <Badge key={t} size="xs" variant="light">{t}</Badge>
                ))}
              </Group>
            </Card>
          ))}
        </Stack>

        <Paper p="var(--app-spacing-md)" withBorder shadow="sm" style={{ background: 'var(--app-color-surface)' }}>
          <Text fw={600} mb="sm">Не нашли ответ? Напишите нам</Text>
          <Stack gap="sm">
            <TextInput
              label="Тема сообщения"
              placeholder="Коротко о проблеме"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              leftSection={<IconBug size={16} />}
            />
            <Textarea
              label="Сообщение"
              placeholder="Опишите что произошло, шаги для повторения, скриншоты..."
              minRows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Group justify="flex-end">
              <Button leftSection={<IconMail size={16} />} disabled={!subject || !message} onClick={() => {
                // В MVP отправим на почту через mailto или переиспользуем бекенд позже
                const body = encodeURIComponent(message);
                const subj = encodeURIComponent(`[Support] ${subject}`);
                window.location.href = `mailto:support@aiedu.local?subject=${subj}&body=${body}`;
              }}>Отправить</Button>
            </Group>
            <Text size="xs" c="dimmed">
              Также смотрите документацию и гайды в разделе <Anchor href="#" onClick={(e)=>e.preventDefault()}>«Руководство пользователя»</Anchor>.
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}


