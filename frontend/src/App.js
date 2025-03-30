import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import DronePage from './components/DronePage';
import SonarDetection from './components/SonarDetection';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1E40AF', // Royal blue
    },
    background: {
      default: '#0A0A0A',
      paper: '#141414',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h2: {
      fontWeight: 800,
      letterSpacing: '-0.025em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(20, 20, 20, 0.95)',
          borderRadius: '12px',
          border: '1px solid rgba(30, 64, 175, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: '#1E40AF',
          '&:hover': {
            backgroundColor: '#2563EB',
          },
          borderRadius: '8px',
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 500,
          padding: '12px 24px',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/drone/:id" element={<DronePage />} />
          <Route path="/sonar" element={<SonarDetection />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
