import React, { useRef, useEffect } from 'react';
import { Box, Loader, Text, Group } from '@mantine/core';
import { IconArrowDown, IconRefresh } from '@tabler/icons-react';
import usePullToRefresh from '../../hooks/usePullToRefresh';

const PullToRefreshIndicator = ({ pullDistance, isRefreshing, threshold = 80 }) => {
  const progress = Math.min(pullDistance / threshold, 1);
  const shouldShowIcon = pullDistance > 20;
  const isReady = pullDistance >= threshold;

  if (isRefreshing) {
    return (
      <Box
        style={{
          padding: '16px',
          textAlign: 'center',
          backgroundColor: 'var(--app-color-surface)',
          borderBottom: '1px solid var(--mantine-color-gray-3)'
        }}
      >
        <Group justify="center" gap="xs">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">Обновление...</Text>
        </Group>
      </Box>
    );
  }

  if (!shouldShowIcon) return null;

  return (
    <Box
      style={{
        padding: '16px',
        textAlign: 'center',
        backgroundColor: 'var(--app-color-surface)',
        borderBottom: '1px solid var(--mantine-color-gray-3)',
        transform: `translateY(${pullDistance - threshold}px)`,
        opacity: progress,
        transition: isReady ? 'none' : 'opacity 0.2s ease'
      }}
    >
      <Group justify="center" gap="xs">
        <Box
          style={{
            transform: `rotate(${progress * 180}deg)`,
            transition: 'transform 0.2s ease',
            color: isReady ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-gray-6)'
          }}
        >
          {isReady ? <IconRefresh size={20} /> : <IconArrowDown size={20} />}
        </Box>
        <Text 
          size="sm" 
          c={isReady ? 'blue' : 'dimmed'}
          weight={isReady ? 600 : 400}
        >
          {isReady ? 'Отпустите для обновления' : 'Потяните для обновления'}
        </Text>
      </Group>
    </Box>
  );
};

const PullToRefresh = ({ children, onRefresh, threshold = 80, disabled = false }) => {
  const containerRef = useRef(null);
  const { pullDistance, isRefreshing, bindEvents } = usePullToRefresh(
    disabled ? null : onRefresh, 
    threshold
  );

  useEffect(() => {
    if (disabled || !containerRef.current) return;
    return bindEvents(containerRef.current);
  }, [bindEvents, disabled]);

  return (
    <Box
      ref={containerRef}
      style={{
        height: '100%',
        overflow: 'auto',
        position: 'relative',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <PullToRefreshIndicator
        pullDistance={pullDistance}
        isRefreshing={isRefreshing}
        threshold={threshold}
      />
      
      <Box
        style={{
          transform: `translateY(${Math.max(0, pullDistance - threshold)}px)`,
          transition: pullDistance === 0 ? 'transform 0.3s ease' : 'none',
          minHeight: '100%'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default PullToRefresh;