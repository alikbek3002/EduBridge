import React, { useState, useRef, useEffect } from 'react';
import { Box, Skeleton, Image } from '@mantine/core';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

const LazyImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className, 
  placeholder = '/images/placeholder.jpg',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <Box
      ref={imgRef}
      className={className}
      style={{ width, height, position: 'relative', overflow: 'hidden' }}
      {...props}
    >
      {!isInView ? (
        <Skeleton height={height} width={width} radius="md" />
      ) : (
        <>
          {!isLoaded && (
            <Skeleton height={height} width={width} radius="md" />
          )}
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <Image
              src={hasError ? placeholder : src}
              alt={alt}
              width={width}
              height={height}
              onLoad={handleLoad}
              onError={handleError}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </MotionDiv>
        </>
      )}
    </Box>
  );
};

export default LazyImage;
