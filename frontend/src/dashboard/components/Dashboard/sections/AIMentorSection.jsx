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
  'Какие документы нужны для DOV?',
  'Как получить Codice Fiscale?',
  'Чем отличаются TOLC-I и TOLC-E?',
  'Сколько стоит обучение в Италии?',
  'Какой минимальный балл IELTS нужен для Politecnico di Milano?',
  'Как подать заявку через Universitaly?',
  'Как оформить студенческую визу type D?',
  'Можно ли работать во время учёбы в Италии?',
  'Что такое ISEE и нужен ли он мне?',
];

const RESOURCES = [
  { icon: IconBook, label: 'IELTS.org — официальные материалы', desc: 'Образцы заданий и советы по подготовке', url: 'https://www.ielts.org/for-test-takers/sample-test-questions' },
  { icon: IconBrandYoutube, label: 'IELTS Liz / E2 IELTS — YouTube', desc: 'Бесплатные видео-уроки по всем секциям', url: 'https://www.youtube.com/@IELTSLizOfficial' },
  { icon: IconHeadphones, label: 'BBC Learning English', desc: 'Подкасты и упражнения на восприятие на слух', url: 'https://www.bbc.co.uk/learningenglish' },
  { icon: IconBulb, label: 'Quizlet — академическая лексика', desc: 'Карточки Oxford AWL и IELTS-словарь', url: 'https://quizlet.com/subject/ielts-academic-vocabulary/' },
  { icon: IconExternalLink, label: 'Universitaly — официальный портал', desc: 'Подача заявок в итальянские университеты', url: 'https://www.universitaly.it/' },
  { icon: IconExternalLink, label: 'MAECI — Dichiarazione di Valore', desc: 'Информация по DOV от МИД Италии', url: 'https://www.esteri.it/en/servizi-consolari-e-visti/italiani-all-estero/dichiarazione-di-valore/' },
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
                  <ThemeIcon size={22} radius="md" color="gray" variant="light">
                    <Icon size={13} stroke={1.5} />
                  </ThemeIcon>
                }
              >
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Text size="sm" fw={500}>{r.label}</Text>
                  <Text size="xs" c="dimmed">{r.desc}</Text>
                </a>
              </List.Item>
            );
          })}
        </List>
      </Paper>
    </Stack>
  );
};

export default AIMentorSection;
