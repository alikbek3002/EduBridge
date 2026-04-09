import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Group,
  Button,
  Badge,
  Modal,
  Text,
  Stack,
  ScrollArea,
  Box,
  Avatar,
  Card,
  Skeleton,
  Alert,
  ActionIcon,
  Divider,
  Paper
} from '@mantine/core';
import {
  IconBell,
  IconRobot,
  IconX,
  IconCheck,
  IconAlertCircle,
  IconBulb
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { fetchAIRecommendations } from '../../../store/educationSlice';
import useNotificationsStore from '../../../store/notificationsStore';
import { useAuth } from '../../../shared/hooks/useAuth';
import styles from './TopActionButtons.module.css';

const MotionDiv = motion.div;

const TopActionButtons = ({ isMobile = false, isTablet = false }) => {
  const [notificationsOpened, setNotificationsOpened] = useState(false);
  const [aiRecommendationsOpened, setAiRecommendationsOpened] = useState(false);
  
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  
  // Redux state for AI recommendations
  const { 
    aiRecommendations = [],
    loading: loadingEdu, 
    error: errorEdu 
  } = useSelector(state => state.education);
  
  // Zustand state for notifications
  const notifications = useNotificationsStore((s) => s.notifications) || [];
  const unreadCount = useNotificationsStore((s) => s.unreadCount) || 0;
  const loadingNotif = useNotificationsStore((s) => s.loading?.notifications);
  const errorNotif = useNotificationsStore((s) => s.errors?.notifications);
  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications);
  const fetchUnreadCount = useNotificationsStore((s) => s.fetchUnreadCount);
  const markAllAsReadZ = useNotificationsStore((s) => s.markAllAsRead);
  const markAsReadZ = useNotificationsStore((s) => s.markAsRead);

  // Load data on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchAIRecommendations());
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [dispatch, isAuthenticated, fetchNotifications, fetchUnreadCount]);

  const isLoadingAI = Boolean(loadingEdu?.aiRecommendations);
  const isLoadingNotif = Boolean(loadingNotif);
  const hasError = errorEdu || errorNotif;

  const handleMarkAsRead = (id) => {
    markAsReadZ(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadZ();
  };

  // Определяем размеры для разных устройств
  const buttonSize = isMobile ? 'sm' : 'md';
  const modalSize = isMobile ? '90%' : isTablet ? '70%' : 'md';

  return (
    <>
      {/* Кнопки в верхней части */}
      <Group position="right" spacing="sm" className={styles.topButtons}>
        {/* Кнопка уведомлений */}
        <Button
          variant="light"
          color="blue"
          size={buttonSize}
          leftIcon={<IconBell size={isMobile ? 16 : 18} />}
          onClick={() => setNotificationsOpened(true)}
          className={styles.actionButton}
        >
          {!isMobile && 'Уведомления'}
          {unreadCount > 0 && (
            <Badge size="xs" color="red" variant="filled" className={styles.badge} ml="xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* Кнопка AI рекомендаций */}
        <Button
          variant="light"
          color="grape"
          size={buttonSize}
          leftIcon={<IconRobot size={isMobile ? 16 : 18} />}
          onClick={() => setAiRecommendationsOpened(true)}
          className={styles.actionButton}
        >
          {!isMobile && 'AI Рекомендации'}
          {aiRecommendations.length > 0 && (
            <Badge size="xs" color="grape" variant="filled" className={styles.badge} ml="xs">
              {aiRecommendations.length}
            </Badge>
          )}
        </Button>
      </Group>

      {/* Модальное окно уведомлений */}
      <Modal
        opened={notificationsOpened}
        onClose={() => setNotificationsOpened(false)}
        title={
          <Group position="apart" style={{ width: '100%' }}>
            <Text size="lg" fw={600}>Уведомления</Text>
            <Group spacing="xs">
              <Badge color="red" radius="sm" variant="light">{unreadCount}</Badge>
              <ActionIcon 
                size="sm" 
                variant="light" 
                onClick={handleMarkAllAsRead}
                title="Отметить все как прочитанные"
              >
                <IconCheck size={14} />
              </ActionIcon>
            </Group>
          </Group>
        }
        size={modalSize}
        centered={!isMobile}
        padding="lg"
        className={styles.modal}
      >
        {hasError && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Ошибка" 
            color="red"
            radius="md"
            mb="md"
          >
            Произошла ошибка при загрузке уведомлений.
          </Alert>
        )}

        {isLoadingNotif && notifications.length === 0 ? (
          <Stack spacing="sm">
            <Skeleton height={60} radius="sm" />
            <Skeleton height={60} radius="sm" />
            <Skeleton height={60} radius="sm" />
          </Stack>
        ) : (
          <ScrollArea style={{ maxHeight: isMobile ? '60vh' : '400px' }}>
            <Stack spacing="sm">
              {!notifications.length ? (
                <Text c="dimmed" ta="center" size="sm" py="xl">
                  Нет новых уведомлений
                </Text>
              ) : (
                notifications.map((notification, index) => (
                  <MotionDiv
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Paper
                      p="md"
                      style={{
                        backgroundColor: notification.is_read 
                          ? 'transparent' 
                          : 'var(--mantine-color-blue-0)',
                        border: `1px solid ${notification.is_read 
                          ? 'var(--mantine-color-gray-2)'
                          : 'var(--mantine-color-blue-2)'}`,
                        cursor: 'pointer'
                      }}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <Group align="flex-start" spacing="sm">
                        <Avatar size="sm" color="blue">
                          <IconBell size={14} />
                        </Avatar>
                        <Box style={{ flex: 1 }}>
                          <Text size="sm" fw={500} mb="xs">
                            {notification.title}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {notification.message}
                          </Text>
                          {notification.created_at && (
                            <Text size="xs" c="dimmed" mt="xs">
                              {new Date(notification.created_at).toLocaleDateString('ru-RU')}
                            </Text>
                          )}
                        </Box>
                        {!notification.is_read && (
                          <Badge size="xs" color="red">
                            Новое
                          </Badge>
                        )}
                      </Group>
                    </Paper>
                  </MotionDiv>
                ))
              )}
            </Stack>
          </ScrollArea>
        )}
      </Modal>

      {/* Модальное окно AI рекомендаций */}
      <Modal
        opened={aiRecommendationsOpened}
        onClose={() => setAiRecommendationsOpened(false)}
        title={
          <Group position="apart" style={{ width: '100%' }}>
            <Text size="lg" fw={600}>AI Рекомендации</Text>
            <Badge radius="sm" variant="light" color="grape">{aiRecommendations.length}</Badge>
          </Group>
        }
        size={modalSize}
        centered={!isMobile}
        padding="lg"
        className={styles.modal}
      >
        {hasError && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Ошибка" 
            color="red"
            radius="md"
            mb="md"
          >
            Произошла ошибка при загрузке AI рекомендаций.
          </Alert>
        )}

        {isLoadingAI && aiRecommendations.length === 0 ? (
          <Stack spacing="sm">
            <Skeleton height={80} radius="sm" />
            <Skeleton height={80} radius="sm" />
            <Skeleton height={80} radius="sm" />
          </Stack>
        ) : (
          <ScrollArea style={{ maxHeight: isMobile ? '60vh' : '400px' }}>
            <Stack spacing="sm">
              {!aiRecommendations.length ? (
                <Text c="dimmed" ta="center" size="sm" py="xl">
                  Нет доступных рекомендаций
                </Text>
              ) : (
                aiRecommendations.map((rec, index) => (
                  <MotionDiv
                    key={rec.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      p="md"
                      withBorder
                      style={{
                        backgroundColor: 'var(--mantine-color-grape-0)',
                        borderColor: 'var(--mantine-color-grape-2)'
                      }}
                    >
                      <Group align="flex-start" spacing="sm">
                        <Avatar size="sm" color="grape">
                          <IconBulb size={14} />
                        </Avatar>
                        <Box style={{ flex: 1 }}>
                          <Text size="sm" fw={500} mb="xs">
                            {rec.title}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {rec.content}
                          </Text>
                          {rec.created_at && (
                            <Text size="xs" c="dimmed" mt="xs">
                              {new Date(rec.created_at).toLocaleDateString('ru-RU')}
                            </Text>
                          )}
                        </Box>
                      </Group>
                    </Card>
                  </MotionDiv>
                ))
              )}
            </Stack>
          </ScrollArea>
        )}
      </Modal>
    </>
  );
};

export default TopActionButtons;
