import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import VideoFeed from './VideoFeed';

const Dashboard = () => {
  // Simulated drone data for top row
  const topRowDrones = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
  ];

  // Simulated drone data for bottom row
  const bottomRowDrones = [
    { id: 4 },
    { id: 5 },
    { id: 6 },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#0A0A0A',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            component="h1"
            className="gradient-text"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            }}
          >
            Threat Analysis Dashboard
          </Typography>
        </Box>

        <Box
          sx={{
            backgroundColor: 'rgba(20, 20, 20, 0.95)',
            borderRadius: '16px',
            border: '1px solid rgba(30, 64, 175, 0.1)',
            p: 3,
          }}
        >
          {/* Top Row */}
          <Box sx={{ mb: 3 }}>
            <Grid 
              container 
              spacing={3}
              sx={{
                width: '100%',
                margin: 0,
                flexWrap: 'nowrap',
              }}
            >
              {topRowDrones.map((drone) => (
                <Grid 
                  item
                  key={drone.id}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <VideoFeed droneId={drone.id} />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Bottom Row */}
          <Box>
            <Grid 
              container 
              spacing={3}
              sx={{
                width: '100%',
                margin: 0,
                flexWrap: 'nowrap',
              }}
            >
              {bottomRowDrones.map((drone) => (
                <Grid 
                  item
                  key={drone.id}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <VideoFeed droneId={drone.id} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
