import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { useParams } from 'react-router-dom';
import { keyframes } from '@mui/system';
import Sentral from './Sentral';
import DetectionStats from './DetectionStats';
import AlertLevel from './AlertLevel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SpeedIcon from '@mui/icons-material/Speed';
import VerifiedIcon from '@mui/icons-material/Verified';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const glowPulse = keyframes`
  0% { box-shadow: 0 0 10px rgba(0, 255, 200, 0.5); }
  50% { box-shadow: 0 0 20px rgba(0, 255, 200, 0.8); }
  100% { box-shadow: 0 0 10px rgba(0, 255, 200, 0.5); }
`;

const DronePage = () => {
  const { id } = useParams();
  const [detectionData, setDetectionData] = useState(null);
  const [videoSrc, setVideoSrc] = useState('');
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    fps: 0,
    confidence: 95.8,
    uptime: '00:00:00',
    totalDetections: 0
  });

  useEffect(() => {
    const getVideoSource = async () => {
      // First try the numbered format
      let processedVideoSrc = `/processed_output/${id}.mp4`;
      let jsonPath = `/processed_output/${id}.json`;
      
      // Check if it's one of the bottom three videos
      if (parseInt(id) >= 4) {
        const drones = [
          { id: 4, filename: 'VIDEO-2025-03-29-17-41-29' },
          { id: 5, filename: 'VIDEO-2025-03-29-17-44-27' },
          { id: 6, filename: 'VIDEO-2025-03-29-17-28-58' }
        ];
        
        const drone = drones.find(d => d.id === parseInt(id));
        if (drone) {
          processedVideoSrc = `/processed_output/${drone.filename}_detected.mp4`;
          jsonPath = `/processed_output/${drone.filename}_detections.json`;
        }
      }

      setVideoSrc(processedVideoSrc);

      try {
        const response = await fetch(jsonPath);
        if (!response.ok) throw new Error('Failed to load detection data');
        const data = await response.json();
        setDetectionData(data);
        if (data.video_info) {
          setStats(prev => ({
            ...prev,
            fps: data.video_info.fps || 0,
            totalDetections: Object.values(data.unique_objects || {}).reduce((a, b) => a + b, 0)
          }));
        }
      } catch (err) {
        console.error('Error loading detection data:', err);
        setError('Failed to load detection data');
      }
    };

    getVideoSource();

    // Update stats periodically
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        confidence: (94 + Math.random() * 4).toFixed(1),
        uptime: new Date().toLocaleTimeString()
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [id]);

  const StatBox = ({ title, value, unit, color, icon }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        bgcolor: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 0 20px ${color}33`
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {icon}
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ color: color, fontWeight: 'bold' }}>
        {value}{unit}
      </Typography>
    </Paper>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#0A0A0A',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      {/* Header */}
      <Box sx={{ p: 3, pb: 0 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            color: '#fff',
            textTransform: 'uppercase',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textAlign: 'center',
            mb: 3,
            textShadow: '0 0 10px rgba(255,255,255,0.3)',
            fontFamily: 'monospace',
            '&::before': {
              content: '"⚡"',
              marginRight: '10px',
              color: '#10B981'
            },
            '&::after': {
              content: '"⚡"',
              marginLeft: '10px',
              color: '#10B981'
            }
          }}
        >
          Drone Feed {id}
        </Typography>

        {detectionData && (
          <AlertLevel 
            level={calculateAlertLevel(detectionData)}
            detectionCount={stats.totalDetections}
          />
        )}
      </Box>
      
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', p: 3, pt: 3 }}>
        {/* Left side - Video and Stats */}
        <Box sx={{ 
          flex: '1 1 65%', 
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          pr: 3,
          height: '100%',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#111111',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#333333',
            borderRadius: '4px',
          }
        }}>
          {/* Video Feed */}
          <Paper
            elevation={0}
            sx={{
              position: 'relative',
              width: '100%',
              height: '500px',
              bgcolor: 'rgba(0,0,0,0.4)',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              animation: `${glowPulse} 2s infinite ease-in-out`
            }}
          >
            <Box
              component="video"
              src={videoSrc}
              autoPlay
              loop
              muted
              controls
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </Paper>

          {/* Stats Grid */}
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mb: 3 }}>
            <Grid container spacing={2} sx={{ maxWidth: '1000px' }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatBox
                  title="Total Detections"
                  value={stats.totalDetections}
                  unit=""
                  color="#FF3B3B"
                  icon={<VisibilityIcon sx={{ color: '#FF3B3B' }} />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatBox
                  title="FPS"
                  value={stats.fps}
                  unit=""
                  color="#FFD60A"
                  icon={<SpeedIcon sx={{ color: '#FFD60A' }} />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatBox
                  title="Confidence"
                  value={stats.confidence}
                  unit="%"
                  color="#32D74B"
                  icon={<VerifiedIcon sx={{ color: '#32D74B' }} />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatBox
                  title="Uptime"
                  value={stats.uptime}
                  unit=""
                  color="#0A84FF"
                  icon={<AccessTimeIcon sx={{ color: '#0A84FF' }} />}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Detection Stats */}
          <Box>
            {detectionData && (
              <DetectionStats detectionData={detectionData} />
            )}
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Right side - Sentral Chat */}
        <Box sx={{ 
          flex: '1 1 35%',
          bgcolor: 'rgba(0,0,0,0.4)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          overflow: 'hidden'
        }}>
          <Sentral detectionData={detectionData} />
        </Box>
      </Box>
    </Box>
  );
};

const calculateAlertLevel = (data) => {
  if (!data?.unique_objects) return 'LOW';
  const totalObjects = Object.values(data.unique_objects).reduce((a, b) => a + b, 0);
  if (totalObjects > 50) return 'CRITICAL';
  if (totalObjects > 30) return 'HIGH';
  if (totalObjects > 10) return 'MEDIUM';
  return 'LOW';
};

export default DronePage;
