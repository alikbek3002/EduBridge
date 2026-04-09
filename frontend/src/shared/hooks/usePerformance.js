import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRef } from 'react';

// Хук для дебаунса
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Хук для троттлинга
export const useThrottle = (value, delay) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const [lastExecuted, setLastExecuted] = useState(Date.now());

  useEffect(() => {
    if (Date.now() >= lastExecuted + delay) {
      setThrottledValue(value);
      setLastExecuted(Date.now());
    } else {
      const timer = setTimeout(() => {
        setThrottledValue(value);
        setLastExecuted(Date.now());
      }, delay - (Date.now() - lastExecuted));

      return () => clearTimeout(timer);
    }
  }, [value, delay, lastExecuted]);

  return throttledValue;
};

// Хук для ленивой загрузки
export const useLazyLoad = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, threshold]);

  return [setRef, isVisible];
};

// Хук для мемоизации дорогих вычислений
export const useMemoizedCallback = (callback) => {
  return useCallback(callback, [callback]);
};

// Хук для отслеживания производительности
export const usePerformanceMonitor = (_componentName) => {
  void _componentName;
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0
  });

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setMetrics(prev => {
        const newRenderCount = prev.renderCount + 1;
        const newAverageRenderTime = 
          (prev.averageRenderTime * prev.renderCount + renderTime) / newRenderCount;
        
        return {
          renderCount: newRenderCount,
          lastRenderTime: renderTime,
          averageRenderTime: newAverageRenderTime
        };
      });
    };
  });

  return metrics;
};

// Хук для оптимизации ре-рендеров
export const useStableCallback = (callback) => {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback((...args) => {
    return callbackRef.current(...args);
  }, []);
};

// Хук для виртуализации
export const useVirtualization = (items, itemHeight, containerHeight, overscan = 5) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );
    return { start: Math.max(0, start - overscan), end };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  };
};

// Хук для кэширования API запросов
export const useApiCache = (key, fetcher, ttl = 5 * 60 * 1000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cacheKey = `api_cache_${key}`;

  const fetchData = useCallback(async () => {
    // Проверяем кэш
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data: cachedData, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < ttl) {
        setData(cachedData);
        return cachedData;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      
      // Сохраняем в кэш
      localStorage.setItem(cacheKey, JSON.stringify({
        data: result,
        timestamp: Date.now()
      }));
      
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetcher, ttl, cacheKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Хук для оптимизации изображений
export const useImageOptimization = (src, options = {}) => {
  const [optimizedSrc, setOptimizedSrc] = useState(src);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const {
    quality = 80,
    format = 'webp',
    width,
    height,
    placeholder: _placeholder = 'blur'
  } = options;

  useEffect(() => {
    if (!src) return;

    setLoading(true);
    setError(false);

    // Здесь можно добавить логику оптимизации изображений
    // Например, использование сервиса типа Cloudinary или ImageKit
    const optimizedUrl = src; // Заглушка

    setOptimizedSrc(optimizedUrl);
    setLoading(false);
  }, [src, quality, format, width, height]);

  return { optimizedSrc, loading, error };
};
