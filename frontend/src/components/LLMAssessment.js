import React from 'react';
import { Paper, Typography } from '@mui/material';

const LLMAssessment = ({ threatLevel }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        p: 3,
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
        borderRadius: '16px',
        border: '1px solid rgba(30, 64, 175, 0.1)',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Threat Analysis
      </Typography>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          color: threatLevel === 'HIGH' ? '#ef4444' : 
                 threatLevel === 'MEDIUM' ? '#f59e0b' : '#22c55e',
          mb: 3,
        }}
      >
        {threatLevel} THREAT LEVEL
      </Typography>
      <Typography variant="body1">
        [LLM Threat Assessment]
      </Typography>
    </Paper>
  );
};

export default LLMAssessment;
