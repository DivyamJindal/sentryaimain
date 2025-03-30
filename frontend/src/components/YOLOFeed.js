import React from 'react';
import { Box, Typography } from '@mui/material';

const YOLOFeed = ({ droneId }) => {
  return (
    <Box
      sx={{
        backgroundColor: '#0A0A0A',
        borderRadius: '16px',
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* This is a placeholder. In a real implementation, this would be replaced with actual YOLO video feed */}
      <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
        YOLO Detection Feed - Drone {droneId}
      </Typography>

      {/* Overlay for detected objects (placeholder) */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          '& .detection-box': {
            position: 'absolute',
            border: '2px solid #00ff00',
            backgroundColor: 'rgba(0, 255, 0, 0.1)',
          }
        }}
      />
    </Box>
  );
};

export default YOLOFeed;
