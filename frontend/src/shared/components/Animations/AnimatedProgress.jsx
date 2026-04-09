import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Progress, Text } from '@mantine/core';

const MotionDiv = motion.div;

const AnimatedProgress = ({ 
  value, 
  color = 'blue', 
  size = 'md',
  showPercentage = true,
  label,
  animated = true,
  ...props 
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayValue(value);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, animated]);

  return (
    <div>
      {label && (
        <Text size="sm" fw={500} className="mb-2">
          {label}
        </Text>
      )}
      <MotionDiv
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ transformOrigin: 'left' }}
      >
        <Progress
          value={displayValue}
          color={color}
          size={size}
          radius="xl"
          className="relative overflow-hidden"
          {...props}
        >
          <MotionDiv
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </Progress>
      </MotionDiv>
      {showPercentage && (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-2"
        >
          <Text size="sm" c="dimmed" ta="center">
            {Math.round(displayValue)}%
          </Text>
        </MotionDiv>
      )}
    </div>
  );
};

export default AnimatedProgress;
