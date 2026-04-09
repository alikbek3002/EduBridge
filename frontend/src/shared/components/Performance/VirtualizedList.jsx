import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Box, ScrollArea } from '@mantine/core';

const VirtualizedList = ({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className,
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    if (scrollTop > items.length * itemHeight) {
      setScrollTop(0);
    }
  }, [scrollTop, items.length, itemHeight]);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );
    return { start: Math.max(0, start - overscan), end };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      ...item,
      index: visibleRange.start + index
    }));
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return (
    <Box className={className} {...props}>
      <ScrollArea
        ref={scrollAreaRef}
        h={containerHeight}
        onScrollPositionChange={({ y }) => setScrollTop(y)}
      >
        <Box style={{ height: totalHeight, position: 'relative' }}>
          <Box
            style={{
              transform: `translateY(${offsetY}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0
            }}
          >
            {visibleItems.map((item) => (
              <Box
                key={item.id || item.index}
                style={{
                  height: itemHeight,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {renderItem(item, item.index)}
              </Box>
            ))}
          </Box>
        </Box>
      </ScrollArea>
    </Box>
  );
};

export default VirtualizedList;
