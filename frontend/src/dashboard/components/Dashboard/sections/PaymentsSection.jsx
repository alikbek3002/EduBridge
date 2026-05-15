import React, { useState, useEffect } from 'react';
import {
  Box, Stack, Text, Grid, Card, Badge, Button, Group,
  Paper, Progress, Skeleton, Alert, Modal, Select, Divider,
  ThemeIcon, List, Title
} from '@mantine/core';
import {
  IconCreditCard, IconCheck, IconAlertCircle, IconReceipt,
  IconCrown, IconRocket, IconStar, IconCalendar, IconClock
} from '@tabler/icons-react';
import { paymentAPI } from '../../../../shared/services/api';

const PLAN_ICONS = {
  0: IconRocket,
  1: IconStar,
  2: IconCrown,
};
const PLAN_COLORS = ['blue', 'violet', 'yellow'];

const STATUS_COLORS = {
  completed: 'green',
  pending: 'yellow',
  failed: 'red',
  cancelled: 'gray',
};
const STATUS_LABELS = {
  completed: 'Оплачено',
  pending: 'В обработке',
  failed: 'Ошибка',
  cancelled: 'Отменён',
};

const PaymentsSection = () => {
  const isDark = document.documentElement.getAttribute('data-mantine-color-scheme') === 'dark';

  const [plans, setPlans] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);
  const [payMethod, setPayMethod] = useState('card');
  const [paySuccess, setPaySuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [plansRes, paymentsRes, invoicesRes] = await Promise.all([
          paymentAPI.listPlans().catch(() => ({ data: [] })),
          paymentAPI.listPayments().catch(() => ({ data: [] })),
          paymentAPI.listInvoices().catch(() => ({ data: [] })),
        ]);
        setPlans(plansRes.data || []);
        setPayments(paymentsRes.data || []);
        setInvoices(invoicesRes.data || []);

        const subRes = await paymentAPI.currentSubscription().catch(() => null);
        setCurrentSub(subRes?.data || null);
      } catch (e) {
        setError('Не удалось загрузить данные о подписке');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handlePay = async () => {
    if (!selectedPlan) return;
    setPaying(true);
    setPayError(null);
    try {
      await paymentAPI.create({ plan_id: selectedPlan.id, payment_method: payMethod });
      const [subRes, paymentsRes, invoicesRes] = await Promise.all([
        paymentAPI.currentSubscription().catch(() => null),
        paymentAPI.listPayments().catch(() => ({ data: [] })),
        paymentAPI.listInvoices().catch(() => ({ data: [] })),
      ]);
      setCurrentSub(subRes?.data || null);
      setPayments(paymentsRes.data || []);
      setInvoices(invoicesRes.data || []);
      setPaySuccess(true);
      setTimeout(() => {
        setPayModalOpen(false);
        setPaySuccess(false);
        setSelectedPlan(null);
      }, 1800);
    } catch (e) {
      const backendMsg = e?.response?.data?.error;
      const status = e?.response?.status;
      // Stripe / payment gateway пока не подключён — показываем дружелюбный fallback
      if (status === 501 || status === 502 || status === 503 || /not implemented|stripe|gateway/i.test(backendMsg || '')) {
        setPayError('Оплата временно недоступна. Свяжитесь с менеджером EduBridge для активации подписки.');
      } else {
        setPayError(backendMsg || 'Оплата временно недоступна. Свяжитесь с менеджером EduBridge.');
      }
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <Stack gap="md" p="md">
        <Skeleton height={100} radius="lg" />
        <Grid>
          {[1, 2, 3].map((i) => <Grid.Col key={i} span={{ base: 12, sm: 4 }}><Skeleton height={220} radius="lg" /></Grid.Col>)}
        </Grid>
        <Skeleton height={150} radius="lg" />
      </Stack>
    );
  }

  return (
    <Stack gap="xl" p="md">
      {/* Header */}
      <Group>
        <ThemeIcon size={44} radius="md" variant="gradient" gradient={{ from: 'violet', to: 'blue' }}>
          <IconCreditCard size={24} />
        </ThemeIcon>
        <Box>
          <Title order={2} fw={700}>Подписка и оплата</Title>
          <Text c="dimmed" size="sm">Управление подпиской и история платежей</Text>
        </Box>
      </Group>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" radius="md">{error}</Alert>
      )}

      {/* Current Subscription */}
      <Paper
        withBorder
        radius="lg"
        p="xl"
        bg={isDark ? 'dark.6' : currentSub ? 'green.0' : 'gray.0'}
      >
        <Group justify="space-between" align="flex-start">
          <Box>
            <Text fw={600} size="lg" mb={4}>Текущая подписка</Text>
            {currentSub ? (
              <>
                <Badge color="green" size="lg" mb="sm">{currentSub.plan?.name || 'Активна'}</Badge>
                <Text size="sm" c="dimmed">
                  Действует до: {currentSub.end_date ? new Date(currentSub.end_date).toLocaleDateString('ru-RU') : '—'}
                </Text>
              </>
            ) : (
              <>
                <Badge color="gray" size="lg" mb="sm">Нет активной подписки</Badge>
                <Text size="sm" c="dimmed">Выберите план ниже для активации</Text>
              </>
            )}
          </Box>
          {currentSub && (
            <ThemeIcon size={48} radius="xl" color="green" variant="light">
              <IconCheck size={24} />
            </ThemeIcon>
          )}
        </Group>
      </Paper>

      {/* Plans */}
      <Box>
        <Text fw={600} size="lg" mb="md">Планы подписки</Text>
        {plans.length === 0 ? (
          <Paper withBorder radius="lg" p="xl" ta="center">
            <Text c="dimmed">Планы пока не доступны</Text>
          </Paper>
        ) : (
          <Grid>
            {plans.map((plan, idx) => {
              const Icon = PLAN_ICONS[idx % 3] || IconStar;
              const color = PLAN_COLORS[idx % 3];
              const isActive = currentSub?.plan?.id === plan.id;
              const features = Array.isArray(plan.features)
                ? plan.features
                : typeof plan.features === 'object' && plan.features !== null
                  ? Object.values(plan.features)
                  : [];

              return (
                <Grid.Col key={plan.id} span={{ base: 12, sm: 4 }}>
                  <Card
                    withBorder
                    shadow={isActive ? 'lg' : 'sm'}
                    radius="lg"
                    h="100%"
                    style={{
                      borderColor: isActive ? `var(--mantine-color-${color}-5)` : undefined,
                      borderWidth: isActive ? 2 : 1,
                    }}
                  >
                    <Stack gap="md" h="100%">
                      <Group>
                        <ThemeIcon size={40} radius="md" color={color} variant="light">
                          <Icon size={22} />
                        </ThemeIcon>
                        <Box>
                          <Text fw={700}>{plan.name}</Text>
                          {isActive && <Badge color={color} size="xs">Активен</Badge>}
                        </Box>
                      </Group>

                      <Group align="flex-end" gap={4}>
                        <Text size="2rem" fw={800} lh={1}>{plan.price}</Text>
                        <Text c="dimmed" mb={4}>{plan.currency} / {plan.duration_days} дн.</Text>
                      </Group>

                      <Text size="sm" c="dimmed">{plan.description}</Text>

                      {features.length > 0 && (
                        <List size="sm" spacing={4} center icon={
                          <ThemeIcon size={16} radius="xl" color={color} variant="light">
                            <IconCheck size={10} />
                          </ThemeIcon>
                        }>
                          {features.map((feat, fi) => (
                            <List.Item key={fi}>{feat}</List.Item>
                          ))}
                        </List>
                      )}

                      <Box mt="auto">
                        <Button
                          fullWidth
                          color={color}
                          variant={isActive ? 'light' : 'filled'}
                          disabled={isActive}
                          onClick={() => { setSelectedPlan(plan); setPayModalOpen(true); }}
                        >
                          {isActive ? 'Текущий план' : 'Выбрать план'}
                        </Button>
                      </Box>
                    </Stack>
                  </Card>
                </Grid.Col>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* Payment History */}
      {payments.length > 0 && (
        <Box>
          <Text fw={600} size="lg" mb="md">История платежей</Text>
          <Paper withBorder radius="lg" p="md">
            <Stack gap="sm">
              {payments.map((payment) => (
                <Group key={payment.id} justify="space-between" p="xs"
                  style={{ borderRadius: 8, background: isDark ? 'var(--mantine-color-dark-7)' : 'var(--mantine-color-gray-0)' }}>
                  <Group gap="sm">
                    <ThemeIcon size={32} radius="md" color={STATUS_COLORS[payment.status] || 'gray'} variant="light">
                      <IconCreditCard size={16} />
                    </ThemeIcon>
                    <Box>
                      <Text size="sm" fw={500}>{payment.description || 'Подписка'}</Text>
                      <Text size="xs" c="dimmed">
                        {payment.created_at ? new Date(payment.created_at).toLocaleDateString('ru-RU') : '—'}
                      </Text>
                    </Box>
                  </Group>
                  <Group gap="sm">
                    <Text fw={600}>{payment.amount} {payment.currency}</Text>
                    <Badge color={STATUS_COLORS[payment.status] || 'gray'} size="sm">
                      {STATUS_LABELS[payment.status] || payment.status}
                    </Badge>
                  </Group>
                </Group>
              ))}
            </Stack>
          </Paper>
        </Box>
      )}

      {/* Invoices */}
      {invoices.length > 0 && (
        <Box>
          <Text fw={600} size="lg" mb="md">Счета</Text>
          <Paper withBorder radius="lg" p="md">
            <Stack gap="sm">
              {invoices.map((inv) => (
                <Group key={inv.id} justify="space-between" p="xs"
                  style={{ borderRadius: 8, background: isDark ? 'var(--mantine-color-dark-7)' : 'var(--mantine-color-gray-0)' }}>
                  <Group gap="sm">
                    <ThemeIcon size={32} radius="md" color={inv.is_paid ? 'green' : 'yellow'} variant="light">
                      <IconReceipt size={16} />
                    </ThemeIcon>
                    <Box>
                      <Text size="sm" fw={500}>{inv.invoice_number}</Text>
                      <Text size="xs" c="dimmed">
                        Срок: {inv.due_date ? new Date(inv.due_date).toLocaleDateString('ru-RU') : '—'}
                      </Text>
                    </Box>
                  </Group>
                  <Badge color={inv.is_paid ? 'green' : 'yellow'} size="sm">
                    {inv.is_paid ? 'Оплачен' : 'Ожидает'}
                  </Badge>
                </Group>
              ))}
            </Stack>
          </Paper>
        </Box>
      )}

      {/* Payment Modal */}
      <Modal
        opened={payModalOpen}
        onClose={() => { setPayModalOpen(false); setPayError(null); setPaySuccess(false); }}
        title={<Text fw={700} size="lg">Оформление подписки</Text>}
        radius="lg"
        centered
      >
        <Stack gap="md">
          {paySuccess ? (
            <Stack align="center" gap="md" py="xl">
              <ThemeIcon size={64} radius="xl" color="green">
                <IconCheck size={32} />
              </ThemeIcon>
              <Text fw={600} size="lg" ta="center">Подписка активирована!</Text>
              <Text c="dimmed" ta="center" size="sm">
                Вы успешно подключили план «{selectedPlan?.name}»
              </Text>
            </Stack>
          ) : (
            <>
              {selectedPlan && (
                <Paper withBorder radius="md" p="md" bg={isDark ? 'dark.6' : 'blue.0'}>
                  <Group>
                    <Box>
                      <Text fw={600}>{selectedPlan.name}</Text>
                      <Text size="sm" c="dimmed">{selectedPlan.description}</Text>
                    </Box>
                    <Text fw={800} size="xl" ml="auto">
                      {selectedPlan.price} {selectedPlan.currency}
                    </Text>
                  </Group>
                </Paper>
              )}

              <Select
                label="Способ оплаты"
                value={payMethod}
                onChange={setPayMethod}
                data={[
                  { value: 'card', label: 'Банковская карта' },
                  { value: 'paypal', label: 'PayPal' },
                  { value: 'bank_transfer', label: 'Банковский перевод' },
                ]}
                radius="md"
              />

              {payError && (
                <Alert icon={<IconAlertCircle size={16} />} color="red" radius="md">{payError}</Alert>
              )}

              <Button
                fullWidth
                loading={paying}
                onClick={handlePay}
                size="md"
                radius="md"
                gradient={{ from: 'violet', to: 'blue' }}
                variant="gradient"
              >
                Оплатить {selectedPlan?.price} {selectedPlan?.currency}
              </Button>
            </>
          )}
        </Stack>
      </Modal>
    </Stack>
  );
};

export default PaymentsSection;
