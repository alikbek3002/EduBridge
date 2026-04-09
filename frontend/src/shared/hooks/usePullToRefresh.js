import { useRef, useState, useCallback } from 'react';

const usePullToRefresh = (onRefresh, threshold = 80) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartRef = useRef(null);
  const scrollElementRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    const scrollTop = scrollElementRef.current?.scrollTop || 0;
    if (scrollTop === 0) {
      touchStartRef.current = {
        y: e.touches[0].clientY,
        time: Date.now()
      };
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!touchStartRef.current) return;

    const scrollTop = scrollElementRef.current?.scrollTop || 0;
    if (scrollTop > 0) {
      touchStartRef.current = null;
      setPullDistance(0);
      return;
    }

    const currentY = e.touches[0].clientY;
    const startY = touchStartRef.current.y;
    const distance = Math.max(0, currentY - startY);

    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance * 0.5, threshold * 1.5));
    }
  }, [threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!touchStartRef.current) return;

    if (pullDistance >= threshold && onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    touchStartRef.current = null;
    setPullDistance(0);
  }, [pullDistance, threshold, onRefresh]);

  const bindEvents = useCallback((element) => {
    if (!element) return;

    scrollElementRef.current = element;
    
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    pullDistance,
    isRefreshing,
    bindEvents
  };
};

export default usePullToRefresh;