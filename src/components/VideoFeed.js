import React, { useState } from 'react';
import { Box, Typography, IconButton, Dialog, Paper } from '@mui/material';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseIcon from '@mui/icons-material/Close';

const VideoFeed = ({ droneId }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          borderRadius: '8px',
          overflow: 'visible',
          transform: 'scale(1)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'scale(1.02)',
            '& .video-container': {
              boxShadow: '0 0 25px rgba(59, 130, 246, 0.5)',
            },
            zIndex: 1,
          },
        }}
      >
        <Paper 
          className="video-container"
          elevation={3} 
          sx={{ 
            position: 'relative',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '8px',
            overflow: 'hidden',
            transition: 'box-shadow 0.3s ease-in-out',
            boxShadow: '0 0 0 rgba(59, 130, 246, 0)',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              paddingTop: '56.25%', // 16:9 Aspect Ratio
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: '#0A0A0A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                Live Feed - Drone {droneId}
              </Typography>
            </Box>
            <IconButton
              onClick={handleOpen}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: 'white',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease-in-out',
                zIndex: 2,
              }}
            >
              <OpenInFullIcon />
            </IconButton>
          </Box>
        </Paper>
      </Box>

      {/* Expanded view dialog */}
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            backgroundColor: '#0A0A0A',
            backgroundImage: 'none',
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography 
              variant="h4"
              className="gradient-text"
              sx={{
                fontWeight: 600,
              }}
            >
              Drone {droneId} - Detailed Analysis
            </Typography>
            <IconButton
              onClick={handleClose}
              sx={{ color: '#FFFFFF' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 3 }}>
            {/* Video feed */}
            <Box
              sx={{
                flex: 2,
                backgroundColor: '#141414',
                borderRadius: '12px',
                height: '70vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                Live Feed - Drone {droneId}
              </Typography>
            </Box>

            {/* Analysis panel */}
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                p: 3,
                backgroundColor: 'rgba(20, 20, 20, 0.95)',
                borderRadius: '12px',
                border: '1px solid rgba(30, 64, 175, 0.1)',
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom
                className="gradient-text"
                sx={{
                  fontWeight: 600,
                  fontSize: '1.5rem',
                  mb: 3,
                }}
              >
                Analysis
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: 1.7,
                }}
              >
                [Awaiting LLM assessment...]
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export default VideoFeed;
