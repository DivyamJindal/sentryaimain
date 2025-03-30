import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const getThreatColor = (level) => {
  const levels = {
    LOW: '#4caf50',
    MEDIUM: '#ff9800',
    HIGH: '#f44336',
    CRITICAL: '#d32f2f'
  };
  return levels[level] || '#757575';
};

const getThreatIcon = (level) => {
  switch (level) {
    case 'LOW':
      return <CheckCircleIcon sx={{ fontSize: 40 }} />;
    case 'MEDIUM':
      return <WarningIcon sx={{ fontSize: 40 }} />;
    case 'HIGH':
    case 'CRITICAL':
      return <ErrorIcon sx={{ fontSize: 40 }} />;
    default:
      return null;
  }
};

const ThreatLevel = ({ level, description }) => {
  const color = getThreatColor(level);
  const icon = getThreatIcon(level);

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Box sx={{ color: color, mr: 2 }}>
          {icon}
        </Box>
        <Typography variant="h5" component="h2" sx={{ color }}>
          {level} THREAT LEVEL
        </Typography>
      </Box>
      <Typography variant="body1">
        {description}
      </Typography>
    </Paper>
  );
};

export default ThreatLevel;
