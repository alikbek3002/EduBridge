import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@mantine/core';

const MotionDiv = motion.div;

const AnimatedCard = ({ 
  children, 
  delay = 0, 
  duration = 0.3,
  hoverScale = 1.02,
  hoverShadow: _hoverShadow = 'lg',
  ...props 
}) => {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration, 
        delay,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: hoverScale,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        style={{
          transition: 'box-shadow 0.2s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `var(--mantine-shadow-${hoverScale > 1 ? _hoverShadow : 'sm'})`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'var(--mantine-shadow-sm)';
        }}
        {...props}
      >
        {children}
      </Card>
    </MotionDiv>
  );
};

export default AnimatedCard;
