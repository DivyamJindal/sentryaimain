import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { keyframes } from '@mui/system';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VideocamIcon from '@mui/icons-material/Videocam';
import TimelineIcon from '@mui/icons-material/Timeline';
import BarChartIcon from '@mui/icons-material/BarChart';

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
`;

const objectColors = {
  person: '#FF3B3B',
  truck: '#FF9500',
  car: '#FFD60A',
  boat: '#32D74B',
  bird: '#0A84FF',
  horse: '#BF5AF2',
  default: '#64D2FF'
};

const DetectionStats = ({ detectionData }) => {
  if (!detectionData) return null;

  const getObjectColor = (objectName) => {
    return objectColors[objectName.toLowerCase()] || objectColors.default;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Objects Section */}
      <Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2,
          pb: 2,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <VisibilityIcon sx={{ color: '#64D2FF', mr: 1 }} />
          <Typography variant="h6" sx={{ 
            color: 'white',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            flex: 1
          }}>
            Detected Objects
          </Typography>
          <TimelineIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />
        </Box>
        <Grid container spacing={2}>
          {Object.entries(detectionData.unique_objects || {}).map(([object, count]) => {
            const color = getObjectColor(object);
            return (
              <Grid item xs={6} sm={4} md={3} key={object}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: 'rgba(0,0,0,0.4)',
                    border: `1px solid ${color}40`,
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: `${color}80`,
                      '& .gradient-bg': {
                        opacity: 0.2
                      }
                    }
                  }}
                >
                  <Box
                    className="gradient-bg"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(135deg, ${color}20, transparent)`,
                      opacity: 0.1,
                      transition: 'opacity 0.3s ease'
                    }}
                  />
                  <Typography variant="h4" sx={{ 
                    color: color,
                    fontWeight: 600,
                    textAlign: 'center',
                    mb: 1,
                    position: 'relative',
                    textShadow: `0 0 20px ${color}40`
                  }}>
                    {count}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.7)',
                      textTransform: 'capitalize',
                      textAlign: 'center',
                      position: 'relative',
                      fontSize: '0.85rem',
                      letterSpacing: '0.02em'
                    }}
                  >
                    {object}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Video Info Section */}
      <Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2,
          pb: 2,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <VideocamIcon sx={{ color: '#64D2FF', mr: 1 }} />
          <Typography variant="h6" sx={{ 
            color: 'white',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            flex: 1
          }}>
            Video Information
          </Typography>
          <BarChartIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />
        </Box>
        <Grid container spacing={2}>
          {Object.entries(detectionData.video_info || {}).map(([key, value]) => {
            if (key === 'input_path' || key === 'output_path') return null;
            
            let displayValue = value;
            if (key === 'total_frames') {
              displayValue = value.toLocaleString();
            } else if (key === 'fps') {
              displayValue = `${value} FPS`;
            }

            return (
              <Grid item xs={6} sm={3} key={key}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(100, 210, 255, 0.2)',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: 'rgba(100, 210, 255, 0.4)',
                      '& .value': {
                        color: '#64D2FF',
                        textShadow: '0 0 20px rgba(100, 210, 255, 0.4)'
                      }
                    }
                  }}
                >
                  <Typography 
                    className="value"
                    variant="body1" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: 500,
                      textAlign: 'center',
                      mb: 0.5,
                      fontSize: '1.25rem',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {displayValue}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.5)',
                      textTransform: 'capitalize',
                      display: 'block',
                      textAlign: 'center',
                      letterSpacing: '0.02em',
                      fontSize: '0.75rem'
                    }}
                  >
                    {key.replace(/_/g, ' ')}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};

export default DetectionStats;
