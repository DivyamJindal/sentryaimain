import React from 'react';
import { Box, Typography } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { keyframes } from '@mui/system';

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
`;

const AlertLevel = ({ level = 'MEDIUM', detectionCount = 0 }) => {
  const getAlertColor = () => {
    switch (level) {
      case 'CRITICAL':
        return '#FF3B3B';
      case 'HIGH':
        return '#FF9500';
      case 'MEDIUM':
        return '#FFD60A';
      case 'LOW':
        return '#32D74B';
      default:
        return '#0A84FF';
    }
  };

  const color = getAlertColor();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        bgcolor: '#111111',
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            bgcolor: color,
            opacity: 0.15,
            borderRadius: '50%',
            animation: `${pulse} 2s ease-in-out infinite`
          }}
        />
        <WarningIcon
          sx={{
            fontSize: '2rem',
            color: color,
            animation: level === 'CRITICAL' ? `${pulse} 1s ease-in-out infinite` : 'none'
          }}
        />
      </Box>

      <Box>
        <Typography
          sx={{
            color: color,
            fontWeight: 600,
            fontSize: '1.1rem',
            letterSpacing: '-0.02em',
            mb: 0.5
          }}
        >
          {level} ALERT LEVEL
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.9rem'
          }}
        >
          {detectionCount} objects detected
        </Typography>
      </Box>
    </Box>
  );
};

export default AlertLevel;
