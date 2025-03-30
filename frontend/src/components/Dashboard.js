import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Paper } from '@mui/material';
import VideoFeed from './VideoFeed';
import { keyframes } from '@mui/system';

// Glow animation
const glowPulse = keyframes`
  0% { box-shadow: 0 0 10px rgba(0, 255, 200, 0.5); }
  50% { box-shadow: 0 0 20px rgba(0, 255, 200, 0.8); }
  100% { box-shadow: 0 0 10px rgba(0, 255, 200, 0.5); }
`;

const drones = [
  { id: 1, threatLevel: 'HIGH', videoSrc: '/test_videos/1.mp4', location: 'Sector A-1', status: 'Active', detections: 15, confidence: 98.2 },
  { id: 2, threatLevel: 'MEDIUM', videoSrc: '/test_videos/2.mp4', location: 'Sector B-2', status: 'Active', detections: 8, confidence: 92.5 },
  { id: 3, threatLevel: 'LOW', videoSrc: '/test_videos/3.mp4', location: 'Sector C-3', status: 'Active', detections: 3, confidence: 95.8 },
  { id: 4, threatLevel: 'HIGH', videoSrc: '/test_videos/VIDEO-2025-03-29-17-41-29.mp4', location: 'Sector D-4', status: 'Active', detections: 12, confidence: 97.1 },
  { id: 5, threatLevel: 'MEDIUM', videoSrc: '/test_videos/VIDEO-2025-03-29-17-44-27.mp4', location: 'Sector E-5', status: 'Active', detections: 6, confidence: 93.4 },
  { id: 6, threatLevel: 'LOW', videoSrc: '/test_videos/VIDEO-2025-03-29-17-28-58.mp4', location: 'Sector F-6', status: 'Active', detections: 2, confidence: 96.7 }
];

const Dashboard = () => {
  const [stats, setStats] = useState({
    systemStatus: 92.3,
    activeThreats: 4,
    networkLatency: 46.8,
    detectionRate: 97.3,
    totalDetections: 46,
    averageConfidence: 95.8,
    uptime: '23h 45m',
    activeAlerts: 7
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        systemStatus: (90 + Math.random() * 10).toFixed(1),
        networkLatency: (40 + Math.random() * 10).toFixed(1),
        detectionRate: (97 + Math.random() * 2).toFixed(1),
        activeThreats: Math.floor(3 + Math.random() * 4),
        activeAlerts: Math.floor(5 + Math.random() * 5)
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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
    <Box sx={{ p: 3, bgcolor: '#0A0A0A', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            color: '#fff',
            textTransform: 'uppercase',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textAlign: 'center',
            mb: 1,
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
          SENTRY WAR ROOM
        </Typography>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
            letterSpacing: '0.2em',
            fontFamily: 'monospace'
          }}
        >
          CLASSIFIED - TOP SECRET
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <StatBox
            title="System Status"
            value={stats.systemStatus}
            unit="%"
            color="#10B981"
            icon={<span role="img" aria-label="status">⚡</span>}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatBox
            title="Active Threats"
            value={stats.activeThreats}
            unit=""
            color="#EF4444"
            icon={<span role="img" aria-label="threats">⚠️</span>}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatBox
            title="Network Latency"
            value={stats.networkLatency}
            unit="ms"
            color="#3B82F6"
            icon={<span role="img" aria-label="network">📡</span>}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatBox
            title="Detection Rate"
            value={stats.detectionRate}
            unit="%"
            color="#10B981"
            icon={<span role="img" aria-label="detection">🎯</span>}
          />
        </Grid>
      </Grid>

      {/* Additional Stats Row */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              bgcolor: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>
              TOTAL DETECTIONS
            </Typography>
            <Typography variant="h6" sx={{ color: '#A78BFA', fontFamily: 'monospace' }}>
              {stats.totalDetections}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              bgcolor: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>
              AVG. CONFIDENCE
            </Typography>
            <Typography variant="h6" sx={{ color: '#A78BFA', fontFamily: 'monospace' }}>
              {stats.averageConfidence}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              bgcolor: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>
              SYSTEM UPTIME
            </Typography>
            <Typography variant="h6" sx={{ color: '#A78BFA', fontFamily: 'monospace' }}>
              {stats.uptime}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              bgcolor: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>
              ACTIVE ALERTS
            </Typography>
            <Typography variant="h6" sx={{ color: '#A78BFA', fontFamily: 'monospace' }}>
              {stats.activeAlerts}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Video Grid Container */}
      <Box 
        sx={{ 
          position: 'relative',
          height: 'calc(100vh - 340px)',
          display: 'grid',
          gridTemplateRows: '1fr 1fr',
          gap: 2,
          mb: 2
        }}
      >
        {/* Top Row */}
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2,
            height: '100%'
          }}
        >
          {drones.slice(0, 3).map((drone) => (
            <Box
              key={drone.id}
              sx={{
                position: 'relative',
                height: '100%',
                minHeight: '250px'
              }}
            >
              <VideoFeed
                id={drone.id}
                threatLevel={drone.threatLevel}
                videoSrc={drone.videoSrc}
                location={drone.location}
                status={drone.status}
                detections={drone.detections}
                confidence={drone.confidence}
              />
            </Box>
          ))}
        </Box>
        
        {/* Bottom Row */}
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2,
            height: '100%'
          }}
        >
          {drones.slice(3).map((drone) => (
            <Box
              key={drone.id}
              sx={{
                position: 'relative',
                height: '100%',
                minHeight: '250px'
              }}
            >
              <VideoFeed
                id={drone.id}
                threatLevel={drone.threatLevel}
                videoSrc={drone.videoSrc}
                location={drone.location}
                status={drone.status}
                detections={drone.detections}
                confidence={drone.confidence}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
