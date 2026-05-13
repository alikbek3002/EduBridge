import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  Button,
  Radio,
  Card,
  Progress,
  Alert,
  Loader,
  Center,
  Badge,
  ThemeIcon,
  ScrollArea,
} from '@mantine/core';
import { IconCheck, IconX, IconAlertCircle, IconTrophy, IconRefresh } from '@tabler/icons-react';
import { educationAPI } from '../../../../shared/services/api';

const IELTSTestRunner = ({ testId, opened, onClose, onCompleted }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({}); // { [questionId]: "A" }
  const [result, setResult] = useState(null); // { score, total, band_score, correct }

  // Reset state whenever the modal is reopened with a different test
  useEffect(() => {
    if (!opened) return;
    setError(null);
    setResult(null);
    setAnswers({});
    setTest(null);
    if (!testId) return;
    let cancelled = false;
    setLoading(true);
    educationAPI
      .getIELTSTest(testId)
      .then((res) => {
        if (cancelled) return;
        setTest(res.data || null);
      })
      .catch((e) => {
        if (cancelled) return;
        setError('Не удалось загрузить тест. Попробуйте позже.');
        console.error('Failed to load IELTS test', e);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [opened, testId]);

  const questions = test?.questions || [];
  const answeredCount = Object.keys(answers).filter((k) => answers[k]).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!testId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await educationAPI.submitIELTSAttempt(testId, answers);
      setResult(res.data);
      if (typeof onCompleted === 'function') onCompleted(res.data);
    } catch (e) {
      console.error('Failed to submit IELTS attempt', e);
      setError('Не удалось отправить ответы. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setAnswers({});
  };

  const headerTitle = test?.title || 'IELTS тест';

  const resultColor = useMemo(() => {
    if (!result) return 'gray';
    const band = result.band_score || 0;
    if (band >= 7) return 'green';
    if (band >= 5.5) return 'blue';
    if (band >= 4) return 'yellow';
    return 'red';
  }, [result]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={headerTitle}
      size="xl"
      centered
      overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
      transitionProps={{ transition: 'pop', duration: 200 }}
    >
      {loading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}

      {error && !loading && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md" radius="md">
          {error}
        </Alert>
      )}

      {!loading && test && !result && (
        <Stack gap="md">
          {test.description && (
            <Text size="sm" c="dimmed">
              {test.description}
            </Text>
          )}
          <Group justify="space-between">
            <Badge color="blue" variant="light" radius="sm">
              {test.duration_minutes} мин
            </Badge>
            <Text size="sm" c="dimmed">
              Отвечено {answeredCount} из {questions.length}
            </Text>
          </Group>
          <Progress value={(answeredCount / Math.max(questions.length, 1)) * 100} radius="md" />

          <ScrollArea.Autosize mah={500} offsetScrollbars>
            <Stack gap="md">
              {questions.map((q, idx) => (
                <Card key={q.id} withBorder radius="md" p="md">
                  <Stack gap="sm">
                    <Text fw={600} size="sm">
                      {idx + 1}. {q.text}
                    </Text>
                    <Radio.Group
                      value={answers[q.id] || ''}
                      onChange={(value) => handleAnswer(q.id, value)}
                    >
                      <Stack gap={6} mt={4}>
                        {(q.options || []).map((opt) => {
                          const key = opt.key || opt.value || opt;
                          const label = opt.label || opt.text || opt;
                          return (
                            <Radio
                              key={key}
                              value={key}
                              label={`${key}. ${label}`}
                            />
                          );
                        })}
                      </Stack>
                    </Radio.Group>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </ScrollArea.Autosize>

          <Group justify="space-between" mt="sm">
            <Button variant="light" onClick={onClose} radius="md">
              Отмена
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              loading={submitting}
              radius="md"
            >
              {allAnswered ? 'Завершить тест' : `Ответьте на все (${questions.length - answeredCount} осталось)`}
            </Button>
          </Group>
        </Stack>
      )}

      {!loading && result && (
        <Stack gap="md" align="center" py="md">
          <ThemeIcon size={72} radius="xl" color={resultColor} variant="light">
            <IconTrophy size={40} />
          </ThemeIcon>
          <Text size="xl" fw={700}>
            Band {result.band_score.toFixed(1)}
          </Text>
          <Text c="dimmed">
            Правильно {result.score} из {result.total}
          </Text>

          <ScrollArea.Autosize mah={350} w="100%" offsetScrollbars>
            <Stack gap="xs" w="100%">
              {questions.map((q, idx) => {
                const userAnswer = answers[q.id];
                const correctAnswer = result.correct?.[String(q.id)];
                const isCorrect = userAnswer === correctAnswer;
                return (
                  <Card key={q.id} withBorder radius="md" p="sm">
                    <Group gap="sm" align="flex-start" wrap="nowrap">
                      <ThemeIcon
                        size="md"
                        radius="xl"
                        color={isCorrect ? 'green' : 'red'}
                        variant="light"
                      >
                        {isCorrect ? <IconCheck size={14} /> : <IconX size={14} />}
                      </ThemeIcon>
                      <Stack gap={2} style={{ flex: 1 }}>
                        <Text size="sm" fw={500}>
                          {idx + 1}. {q.text}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Ваш ответ: <b>{userAnswer || '—'}</b>
                          {!isCorrect && (
                            <>
                              {' '}· Правильный: <b>{correctAnswer || '—'}</b>
                            </>
                          )}
                        </Text>
                      </Stack>
                    </Group>
                  </Card>
                );
              })}
            </Stack>
          </ScrollArea.Autosize>

          <Group justify="center" mt="sm">
            <Button variant="light" leftSection={<IconRefresh size={16} />} onClick={handleRetry} radius="md">
              Пройти ещё раз
            </Button>
            <Button onClick={onClose} radius="md">
              Закрыть
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
};

export default IELTSTestRunner;
