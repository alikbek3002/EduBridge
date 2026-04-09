import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Box,
  Stack,
  Text,
  Card,
  Group,
  Badge,
  ActionIcon,
  ScrollArea,
  Skeleton,
  Alert,
  Avatar,
} from '@mantine/core';
import {
  IconBell,
  IconCheck,
  IconAlertCircle,
  IconBulb,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import { fetchAIRecommendations } from '../../../store/educationSlice';
import useNotificationsStore from '../../../store/notificationsStore';
import { useAuth } from '../../../shared/hooks/useAuth';
import styles from './RightPanel.module.css';

const MotionDiv = motion.div;

const RightPanel = ({
  activeSection: _activeSection,
  currentProgress: _currentProgress,
  isMobile: _isMobile = false,
  activeTab: _activeTab = 'ai',
}) => {
  void _activeSection;
  void _currentProgress;
  void _isMobile;
  void _activeTab;
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const {
    aiRecommendations = [],
    loading: loadingEdu,
    error: errorEdu,
  } = useSelector((state) => state.education);

  const notifications = useNotificationsStore((s) => s.notifications) || [];
  const unreadCount = useNotificationsStore((s) => s.unreadCount) || 0;
  const loadingNotif = useNotificationsStore((s) => s.loading?.notifications);
  const errorNotif = useNotificationsStore((s) => s.errors?.notifications);
  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications);
  const fetchUnreadCount = useNotificationsStore((s) => s.fetchUnreadCount);
  const markAllAsRead = useNotificationsStore((s) => s.markAllAsRead);
  const markAsRead = useNotificationsStore((s) => s.markAsRead);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    dispatch(fetchAIRecommendations());
    fetchNotifications();
    fetchUnreadCount();
  }, [dispatch, isAuthenticated, fetchNotifications, fetchUnreadCount]);

  const isLoadingAI = Boolean(loadingEdu?.aiRecommendations);
  const isLoadingNotif = Boolean(loadingNotif);
  const hasError = errorEdu || errorNotif;

  return (
    <div className={`${styles.rightPanelWrapper} ${isCollapsed ? styles.collapsed : ''}`}>
      <div
        className={styles.rightPanelHandle}
        role="button"
        aria-label={isCollapsed ? 'Открыть панель' : 'Скрыть панель'}
        onClick={() => setIsCollapsed((value) => !value)}
      >
        {isCollapsed ? <IconChevronLeft size={18} /> : <IconChevronRight size={18} />}
        <span className={styles.handleLabel}>AI</span>
      </div>

      <Box className={styles.rightPanel}>
        <Text size="xl" fw={800} mb="xl" className={styles.gradientText}>
          AI Ассистент
        </Text>

        {hasError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Ошибка"
            color="red"
            radius="md"
            mb="md"
          >
            Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.
          </Alert>
        )}

        <Stack gap="lg">
          <Card shadow="md" p="lg" radius="lg" withBorder style={{ background: 'var(--app-color-surface)' }}>
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <Avatar size="sm" color="grape">
                  <IconBulb size={14} />
                </Avatar>
                <Text size="lg" fw={600}>AI рекомендации</Text>
              </Group>
              <Badge radius="sm" variant="light" color="blue">
                {aiRecommendations.length}
              </Badge>
            </Group>

            {isLoadingAI && aiRecommendations.length === 0 ? (
              <Stack gap="sm">
                <Skeleton height={50} radius="sm" />
                <Skeleton height={50} radius="sm" />
                <Skeleton height={50} radius="sm" />
              </Stack>
            ) : (
              <ScrollArea h={220} offsetScrollbars>
                <Stack gap="sm">
                  {!aiRecommendations.length ? (
                    <Text c="dimmed" ta="center" size="sm">
                      Нет доступных рекомендаций
                    </Text>
                  ) : (
                    aiRecommendations.map((rec, index) => (
                      <MotionDiv
                        key={rec.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                      >
                        <Box
                          p="sm"
                          style={{
                            backgroundColor: 'var(--mantine-color-gray-0)',
                            borderRadius: 'var(--mantine-radius-sm)',
                            border: '1px solid var(--mantine-color-gray-2)',
                          }}
                        >
                          <Text size="sm" fw={500} mb="xs">{rec.title}</Text>
                          <Text size="xs" c="dimmed" lineClamp={3}>
                            {rec.content}
                          </Text>
                        </Box>
                      </MotionDiv>
                    ))
                  )}
                </Stack>
              </ScrollArea>
            )}
          </Card>

          <Card shadow="md" p="lg" radius="lg" withBorder style={{ background: 'var(--app-color-surface)' }}>
            <Group justify="space-between" mb="md">
              <Text size="lg" fw={600}>Уведомления</Text>
              <Group gap="xs">
                <Badge color="red" radius="sm" variant="light">{unreadCount}</Badge>
                <ActionIcon
                  size="sm"
                  variant="light"
                  onClick={markAllAsRead}
                  title="Отметить все как прочитанные"
                >
                  <IconCheck size={14} />
                </ActionIcon>
              </Group>
            </Group>

            {isLoadingNotif && notifications.length === 0 ? (
              <Stack gap="sm">
                <Skeleton height={50} radius="sm" />
                <Skeleton height={50} radius="sm" />
                <Skeleton height={50} radius="sm" />
              </Stack>
            ) : (
              <ScrollArea h={220} offsetScrollbars>
                <Stack gap="sm">
                  {!notifications.length ? (
                    <Text c="dimmed" ta="center" size="sm">
                      Нет новых уведомлений
                    </Text>
                  ) : (
                    notifications.map((notification, index) => (
                      <MotionDiv
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                      >
                        <Group
                          p="sm"
                          style={{
                            backgroundColor: notification.is_read ? 'transparent' : 'var(--mantine-color-blue-0)',
                            borderRadius: 'var(--mantine-radius-sm)',
                            border: `1px solid ${
                              notification.is_read
                                ? 'var(--mantine-color-gray-2)'
                                : 'var(--mantine-color-blue-2)'
                            }`,
                            cursor: 'pointer',
                          }}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Avatar size="sm" color="blue">
                            <IconBell size={14} />
                          </Avatar>
                          <Box style={{ flex: 1 }}>
                            <Text size="sm" fw={500}>
                              {notification.title}
                            </Text>
                            <Text size="xs" c="dimmed" lineClamp={1}>
                              {notification.message}
                            </Text>
                          </Box>
                          {!notification.is_read && (
                            <Badge size="xs" color="red">
                              Новое
                            </Badge>
                          )}
                        </Group>
                      </MotionDiv>
                    ))
                  )}
                </Stack>
              </ScrollArea>
            )}
          </Card>
        </Stack>
      </Box>
    </div>
  );
};

export default RightPanel;
