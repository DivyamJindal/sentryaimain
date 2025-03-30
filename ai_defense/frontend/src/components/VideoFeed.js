import React, { useState, useEffect } from 'react';
import { Box, Typography, Dialog, IconButton } from '@mui/material';
import { keyframes } from '@mui/system';
import { useNavigate } from 'react-router-dom';

const glowPulse = keyframes`
  0% { box-shadow: 0 0 10px rgba(255, 0, 0, 0.5); }
  50% { box-shadow: 0 0 20px rgba(255, 0, 0, 0.8); }
  100% { box-shadow: 0 0 10px rgba(255, 0, 0, 0.5); }
`;

const VideoFeed = ({ id, threatLevel, videoSrc, location, status, detections, confidence }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const navigate = useNavigate();

  const handleVideoError = (e) => {
    console.error('Video error:', e);
    setError(true);
    setLoading(false);
  };

  const handleVideoLoad = (e) => {
    console.log('Video loaded:', videoSrc);
    setLoading(false);
    setError(false);
    e.target.play().catch(err => {
      console.error('Error playing video:', err);
      setError(true);
    });
  };

  const handleClick = () => {
    navigate(`/drone/${id}`);
  };

  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [videoSrc]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        console.log('Retrying video:', videoSrc);
        setRetryCount(prev => prev + 1);
        setError(false);
        setLoading(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, videoSrc]);

  const getGlowStyles = () => {
    switch (threatLevel) {
      case 'HIGH':
        return {
          color: '#EF4444',
          shadow: '0 0 15px rgba(239, 68, 68, 0.5)'
        };
      case 'MEDIUM':
        return {
          color: '#F59E0B',
          shadow: '0 0 15px rgba(245, 158, 11, 0.5)'
        };
      case 'LOW':
        return {
          color: '#10B981',
          shadow: '0 0 15px rgba(16, 185, 129, 0.5)'
        };
      default:
        return {
          color: '#6B7280',
          shadow: '0 0 15px rgba(107, 114, 128, 0.5)'
        };
    }
  };

  const glowStyles = getGlowStyles();

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: '4px',
          overflow: 'hidden',
          backgroundColor: '#1A1A1A',
          border: `2px solid ${glowStyles.color}`,
          boxShadow: glowStyles.shadow,
          animation: threatLevel === 'HIGH' ? `${glowPulse} 2s ease-in-out infinite` : 'none',
          cursor: 'pointer',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.02)'
          },
          '&::before': {
            content: '""',
            display: 'block',
            paddingTop: '56.25%', // 16:9 aspect ratio
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <video
            key={`${videoSrc}-${retryCount}`}
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={handleVideoLoad}
            onError={handleVideoError}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: loading || error ? 0 : 1,
              transition: 'opacity 0.3s ease'
            }}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>

          {/* Title Bar */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              padding: '8px 12px',
              background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
              zIndex: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 500, fontFamily: 'monospace' }}>
              {location}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: glowStyles.color,
                  fontWeight: 'bold',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  border: `1px solid ${glowStyles.color}`,
                  fontFamily: 'monospace'
                }}
              >
                {threatLevel}
              </Typography>
            </Box>
          </Box>

          {/* Stats Overlay */}
          <Box
            className="video-overlay"
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '8px 12px',
              background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
              zIndex: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              opacity: 0.7,
              transition: 'opacity 0.3s ease'
            }}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>
              DETECTIONS: {detections}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>
              CONF: {confidence}%
            </Typography>
          </Box>

          {/* Loading State */}
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.7)',
                zIndex: 4
              }}
            >
              <Typography sx={{ color: '#10B981', fontFamily: 'monospace' }}>
                INITIALIZING FEED...
              </Typography>
            </Box>
          )}

          {/* Error State */}
          {error && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.7)',
                zIndex: 4
              }}
            >
              <Typography sx={{ color: '#EF4444', fontFamily: 'monospace' }}>
                FEED ERROR - RECONNECTING...
              </Typography>
            </Box>
          )}

          {/* Status Indicator */}
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: status === 'Active' ? '#10B981' : '#EF4444',
              boxShadow: `0 0 8px ${status === 'Active' ? '#10B981' : '#EF4444'}`,
              zIndex: 3
            }}
          />
        </Box>
      </Box>

      {/* Fullscreen Dialog */}
      <Dialog
        fullScreen
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        sx={{
          '& .MuiDialog-paper': {
            bgcolor: '#000'
          }
        }}
      >
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
          <IconButton
            onClick={() => setFullscreen(false)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)'
              }
            }}
          >
            ✕
          </IconButton>
        </Box>
      </Dialog>
    </>
  );
};

export default VideoFeed;
