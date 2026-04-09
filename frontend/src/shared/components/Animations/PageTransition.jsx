import React from 'react';
import { motion } from 'framer-motion';
import { Box } from '@mantine/core';

const MotionDiv = motion.div;

const PageTransition = ({ children, direction = 'right' }) => {
  const variants = {
    enter: (direction) => ({
      x: direction === 'right' ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction === 'right' ? -300 : 300,
      opacity: 0
    })
  };

  return (
    <MotionDiv
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }}
    >
      <Box>
        {children}
      </Box>
    </MotionDiv>
  );
};

export default PageTransition;
