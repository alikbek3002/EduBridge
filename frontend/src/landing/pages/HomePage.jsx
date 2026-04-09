import React from 'react';
import { Box } from '@mantine/core';
import HeroSimple from '../components/Home/HeroSimple';
import AboutSimple from '../components/Home/AboutSimple';
import StepsSimple from '../components/Home/StepsSimple';
import ProgramsSimple from '../components/Home/ProgramsSimple';
import UniversitiesSlider from '../components/Home/UniversitiesSlider';
import ContactSimple from '../components/Home/ContactSimple';
import FooterSimple from '../components/Home/FooterSimple';
import './HomePage.css';
import './landing-overrides.css';

const HomePage = () => {
  return (
    <Box className="home-page">
      <HeroSimple />
      <AboutSimple />
      <StepsSimple />
      <ProgramsSimple />
      <UniversitiesSlider />
      <ContactSimple />
      <FooterSimple />
    </Box>
  );
};

export default HomePage;
