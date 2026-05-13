import React, { useState } from 'react';
import { Box, Stack, Paper, Text, Group, Button, ThemeIcon, List, Badge } from '@mantine/core';
import {
  IconRobot, IconBulb, IconExternalLink, IconBrandYoutube,
  IconBook, IconHeadphones,
} from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import AIMentorChat from '../components/AIMentorChat.jsx';

const QUICK_QUESTIONS = [
  'Как улучшить IELTS Listening?',
  'Что нужно для поступления в Bocconi?',
  'Объясни структуру мотивационного письма',
];

const RESOURCES = [
  { icon: IconBook, label: 'IELTS.org — официальные материалы', desc: 'Образцы заданий и советы по подготовке' },
  { icon: IconBrandYoutube, label: 'Кейти Энгл — IELTS на YouTube', desc: 'Бесплатные видео-уроки по всем секциям' },
  { icon: IconHeadphones, label: 'BBC Learning English', desc: 'Подкасты и упражнения на восприятие на слух' },
  { icon: IconBulb, label: 'Quizlet — академическая лексика', desc: 'Карточки Oxford AWL и IELTS-словарь' },
];

const AIMentorSection = () => {
  const isDark = document.documentElement.getAttribute('data-mantine-color-scheme') === 'dark';
  const { user } = useSelector((state) => state.auth);
  const [quickMsg, setQuickMsg] = useState('');

  return (
    <Stack gap={0} style={{ height: '100%' }}>
      {/* Educational Header */}
      <Paper
        withBorder
        radius="md"
        p="md"
        mb="sm"
        style={{ background: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-blue-0)' }}
      >
        <Group gap="sm" mb={8}>
          <ThemeIcon size={40} radius="md" color="blue" variant="light">
            <IconRobot size={22} />
          </ThemeIcon>
          <Box>
            <Text fw={700} size="md">
              AI Ментор{user?.first_name ? `, здравствуйте, ${user.first_name}!` : '!'}
            </Text>
            <Text size="xs" c="dimmed">Задайте вопрос о поступлении, IELTS или жизни в Италии</Text>
          </Box>
        </Group>

        {/* Quick Questions */}
        <Text size="xs" fw={600} c="dimmed" mb={6}>Быстрые вопросы:</Text>
        <Group gap="xs" wrap="wrap">
          {QUICK_QUESTIONS.map((q) => (
            <Button
              key={q}
              size="xs"
              variant={quickMsg === q ? 'filled' : 'light'}
              color="blue"
              radius="xl"
              onClick={() => setQuickMsg(q)}
            >
              {q}
            </Button>
          ))}
        </Group>
      </Paper>

      {/* Chat (fills remaining space) */}
      <Box style={{ flex: 1, minHeight: 0 }}>
        <AIMentorChat fullHeight initialMessage={quickMsg} />
      </Box>

      {/* Learning Resources */}
      <Paper
        withBorder
        radius="md"
        p="md"
        mt="sm"
        style={{ background: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)' }}
      >
        <Text size="sm" fw={700} mb={10}>Ресурсы для подготовки</Text>
        <List
          spacing={8}
          size="sm"
          icon={
            <ThemeIcon size={20} radius="xl" color="teal" variant="light">
              <IconExternalLink size={12} />
            </ThemeIcon>
          }
        >
          {RESOURCES.map((r) => {
            const Icon = r.icon;
            return (
              <List.Item
                key={r.label}
                icon={
                  <ThemeIcon size={22} radius="md" color="teal" variant="light">
                    <Icon size={13} />
                  </ThemeIcon>
                }
              >
                <Text size="sm" fw={500}>{r.label}</Text>
                <Text size="xs" c="dimmed">{r.desc}</Text>
              </List.Item>
            );
          })}
        </List>
      </Paper>
    </Stack>
  );
};

export default AIMentorSection;
