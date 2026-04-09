import React from 'react';
import { Box } from '@mantine/core';
import AIMentorChat from '../components/AIMentorChat.jsx';

const AIMentorSection = () => {
  return (
    <Box style={{ height: '100vh', padding: 0, margin: 0 }}>
      <AIMentorChat fullHeight />
    </Box>
  );
};

export default AIMentorSection;
