import React, { useState } from 'react';
import { Box, Stack, Paper, Text, Group, TextInput, Textarea, Button, Card, Badge, Anchor } from '@mantine/core';
import { IconHelp, IconSearch, IconMail, IconBug, IconBook } from '@tabler/icons-react';

const faqs = [
  // Платформа
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
    a: 'Настройки → 2FA: сгенерируйте секрет/QR, добавьте в приложение Google Authenticator и подтвердите кодом. Отключить можно там же.',
    tags: ['безопасность', '2fa']
  },
  {
    q: 'Как сменить пароль?',
    a: 'Настройки → Безопасность → Сменить пароль. Введите текущий и новый пароль (минимум 8 символов, должен содержать цифры и буквы).',
    tags: ['безопасность', 'пароль']
  },
  // IELTS
  {
    q: 'Сколько времени готовиться к IELTS?',
    a: 'В среднем 3-6 месяцев при ежедневной практике 1-2 часа. Для повышения с 6.0 до 7.0 нужно около 200-300 часов целенаправленных занятий.',
    tags: ['ielts', 'подготовка']
  },
  {
    q: 'Какой минимальный балл IELTS нужен для итальянских ВУЗов?',
    a: 'Обычно 6.0-6.5 для бакалавриата на английском, 6.5-7.0 для магистратуры. Bocconi и Politecnico часто требуют 7.0+.',
    tags: ['ielts', 'университеты', 'требования']
  },
  {
    q: 'Сколько действителен сертификат IELTS?',
    a: 'IELTS сертификат действителен 2 года с даты экзамена. Некоторые университеты принимают только сертификаты не старше 1 года.',
    tags: ['ielts', 'сертификат']
  },
  // TOLC
  {
    q: 'Что такое TOLC и кому он нужен?',
    a: 'TOLC (Test On-Line CISIA) — обязательный вступительный тест для большинства итальянских бакалаврских программ: TOLC-I (инженерия), TOLC-E (экономика), TOLC-F (фармация) и др.',
    tags: ['tolc', 'поступление']
  },
  {
    q: 'Сколько раз можно сдавать TOLC?',
    a: 'Один раз в месяц на одну и ту же специальность. Засчитывается лучший результат за последние 12 месяцев.',
    tags: ['tolc', 'экзамен']
  },
  // Документы
  {
    q: 'Что такое Dichiarazione di Valore (DOV)?',
    a: 'DOV — это документ итальянского консульства, подтверждающий уровень и легитимность вашего диплома. Без DOV большинство университетов не принимает заявку.',
    tags: ['dov', 'документы']
  },
  {
    q: 'Сколько времени делается DOV?',
    a: 'От 2 недель до 2 месяцев в зависимости от консульства. Подавайте документы заранее, желательно за 3-4 месяца до дедлайна.',
    tags: ['dov', 'сроки']
  },
  {
    q: 'Что такое Codice Fiscale и где его получить?',
    a: 'Codice Fiscale — итальянский налоговый код, нужен для аренды жилья, открытия счёта, оформления страховки. Получить можно в Agenzia delle Entrate или в итальянском консульстве у себя в стране.',
    tags: ['codice', 'налоги']
  },
  {
    q: 'Нужен ли апостиль на аттестат?',
    a: 'Да, для стран Гаагской конвенции нужен апостиль. Для стран вне конвенции (например, Россия после выхода) — консульская легализация.',
    tags: ['апостиль', 'легализация']
  },
  // Universitaly
  {
    q: 'Что такое Universitaly?',
    a: 'Universitaly.it — официальный портал министерства образования Италии для предварительной регистрации (pre-iscrizione) иностранных студентов. Подача заявок открыта обычно с апреля по июль.',
    tags: ['universitaly', 'портал']
  },
  {
    q: 'В сколько университетов можно подать через Universitaly?',
    a: 'Через Universitaly вы выбираете один университет и одну программу. На дополнительные программы нужно подавать напрямую в университет.',
    tags: ['universitaly', 'заявки']
  },
  // Виза
  {
    q: 'Какая виза нужна для учёбы в Италии?',
    a: 'Долгосрочная учебная виза тип D (Visto di studio). Подаётся в итальянское консульство после получения письма-приглашения от университета.',
    tags: ['виза', 'd-тип']
  },
  {
    q: 'Можно ли работать во время учёбы в Италии?',
    a: 'Да, до 20 часов в неделю в учебный период и full-time на каникулах. Нужен permesso di soggiorno.',
    tags: ['работа', 'виза']
  },
  // Финансы
  {
    q: 'Сколько стоит учёба в государственном итальянском ВУЗе?',
    a: 'От €500 до €4000 в год в зависимости от семейного дохода (ISEE). Иностранцы без ISEE платят полную ставку (€2500-4000).',
    tags: ['стоимость', 'tasse']
  },
  {
    q: 'Что такое ISEE и нужен ли он?',
    a: 'ISEE — декларация о доходах семьи. С её помощью можно платить льготную stoimostь обучения и получать стипендии. Оформляется в Италии через CAF.',
    tags: ['isee', 'финансы']
  },
  {
    q: 'Какие стипендии доступны иностранцам?',
    a: 'Региональные стипендии (DSU/EDISU), стипендии MAECI, университетские merit-based стипендии. Подача — обычно в августе-сентябре.',
    tags: ['стипендия', 'borsa di studio']
  },
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


