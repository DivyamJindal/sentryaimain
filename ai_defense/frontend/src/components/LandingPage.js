import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Container, Grid, Paper, AppBar, Toolbar,
  Link, Snackbar, Alert 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import RadarIcon from '@mui/icons-material/Radar';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import WarningIcon from '@mui/icons-material/Warning';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShieldIcon from '@mui/icons-material/Shield';
import SpeedIcon from '@mui/icons-material/Speed';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import { keyframes } from '@mui/system';
import { motion } from 'framer-motion';

// Keyframe definitions
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.5;
    box-shadow: 0 0 20px rgba(147, 51, 234, 0.5);
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
    box-shadow: 0 0 30px rgba(147, 51, 234, 0.7);
  }
  100% {
    transform: scale(1);
    opacity: 0.5;
    box-shadow: 0 0 20px rgba(147, 51, 234, 0.5);
  }
`;

const glowPulse = keyframes`
  0% {
    box-shadow: 0 0 5px #1E40AF, 0 0 10px #1E40AF, 0 0 15px #1E40AF;
  }
  50% {
    box-shadow: 0 0 10px #1E40AF, 0 0 20px #1E40AF, 0 0 30px #1E40AF;
  }
  100% {
    box-shadow: 0 0 5px #1E40AF, 0 0 10px #1E40AF, 0 0 15px #1E40AF;
  }
`;

const LandingPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeThreats: 0,
    detectionRate: 0,
    networkLatency: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        activeThreats: Math.floor(Math.random() * 5),
        detectionRate: 95 + Math.floor(Math.random() * 5),
        networkLatency: 15 + Math.floor(Math.random() * 10)
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const features = [
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: "Advanced Threat Detection",
      description: "Real-time monitoring and analysis of potential security threats using AI."
    },
    {
      icon: <RadarIcon sx={{ fontSize: 40 }} />,
      title: "Sonar Analysis",
      description: "Cutting-edge sonar technology for underwater threat detection and classification."
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      title: "Data Analytics",
      description: "Comprehensive data analysis and visualization of security metrics."
    }
  ];

  const stats_items = [
    {
      icon: <WarningIcon />,
      value: stats.activeThreats,
      label: "Active Threats"
    },
    {
      icon: <SpeedIcon />,
      value: `${stats.detectionRate}%`,
      label: "Detection Rate"
    },
    {
      icon: <NotificationsActiveIcon />,
      value: `${stats.networkLatency}ms`,
      label: "Network Latency"
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Navigation Bar */}
      <AppBar position="static" sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
        <Toolbar>
          <ShieldIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI Defense System
          </Typography>
          <Button 
            color="inherit" 
            onClick={() => handleNavigation('/dashboard')}
            startIcon={<DashboardIcon />}
          >
            Dashboard
          </Button>
          <Button 
            color="inherit" 
            onClick={() => handleNavigation('/sonar')}
            startIcon={<RadarIcon />}
          >
            Sonar Detection
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container>
        <Box sx={{ 
          pt: 8,
          pb: 6,
          textAlign: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at center, rgba(30, 64, 175, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
            zIndex: 0
          }
        }}>
          <Typography
            component="h1"
            variant="h2"
            sx={{
              mb: 4,
              background: 'linear-gradient(45deg, #60A5FA, #3B82F6)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Next-Gen AI Defense System
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Protecting critical infrastructure with advanced AI and sonar technology
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => handleNavigation('/dashboard')}
              sx={{
                mr: 2,
                animation: `${pulse} 2s infinite`,
              }}
            >
              View Dashboard
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => handleNavigation('/sonar')}
            >
              Try Sonar Detection
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Features Section */}
      <Container sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                component={motion.div}
                whileHover={{ scale: 1.05 }}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Box sx={{ 
                  color: 'primary.main',
                  mb: 2,
                  animation: `${glowPulse} 2s infinite`
                }}>
                  {feature.icon}
                </Box>
                <Typography variant="h5" component="h2" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats Section */}
      <Container sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {stats_items.map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {item.icon}
                </Box>
                <Typography variant="h3" component="h2" gutterBottom>
                  {item.value}
                </Typography>
                <Typography color="text.secondary">
                  {item.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: 'background.paper',
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body1" align="center">
            2025 AI Defense System. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Link href="https://github.com" color="inherit" sx={{ mx: 1 }}>
              <GitHubIcon />
            </Link>
            <Link href="https://linkedin.com" color="inherit" sx={{ mx: 1 }}>
              <LinkedInIcon />
            </Link>
            <Link href="https://twitter.com" color="inherit" sx={{ mx: 1 }}>
              <TwitterIcon />
            </Link>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;