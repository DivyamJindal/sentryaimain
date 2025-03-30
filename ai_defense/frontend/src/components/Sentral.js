import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography, List, ListItem } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Sentral = ({ detectionData }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user', timestamp: new Date() }]);
      
      setTimeout(() => {
        let response = "Analyzing feed data...";
        if (detectionData?.unique_objects) {
          const objects = detectionData.unique_objects;
          const totalObjects = Object.values(objects).reduce((a, b) => a + b, 0);
          response = `I've detected ${totalObjects} objects in this feed. The most frequent objects are: ${
            Object.entries(objects)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 3)
              .map(([obj, count]) => `${obj} (${count})`)
              .join(', ')
          }.`;
        }
        
        setMessages(prev => [...prev, {
          text: response,
          sender: 'ai',
          timestamp: new Date()
        }]);
      }, 1000);
      
      setInput('');
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#000000',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        <SmartToyIcon sx={{ color: '#FFFFFF' }} />
        <Typography sx={{ 
          color: '#FFFFFF', 
          fontWeight: 600,
          letterSpacing: '-0.02em',
          fontSize: '1.1rem'
        }}>
          Sentral AI
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column-reverse',
          p: 2,
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
        }}
      >
        <List sx={{ width: '100%' }}>
          {messages.map((msg, index) => (
            <ListItem
              key={index}
              sx={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 2,
                px: 0
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  maxWidth: '85%',
                  alignItems: 'flex-start'
                }}
              >
                {msg.sender === 'ai' && (
                  <SmartToyIcon sx={{ 
                    color: '#4F46E5',
                    bgcolor: '#1E1E1E',
                    p: 1,
                    borderRadius: 1,
                    boxSizing: 'content-box'
                  }} />
                )}
                
                <Box>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: msg.sender === 'user' ? '#1E1E1E' : '#111111',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <Typography sx={{ 
                      color: '#FFFFFF',
                      fontSize: '0.95rem',
                      lineHeight: 1.5,
                      letterSpacing: '-0.01em'
                    }}>
                      {msg.text}
                    </Typography>
                  </Box>
                  <Typography 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: '0.75rem',
                      mt: 0.5,
                      ml: 0.5
                    }}
                  >
                    {msg.sender === 'user' ? 'You' : 'Sentral'} • {msg.timestamp.toLocaleTimeString()}
                  </Typography>
                </Box>

                {msg.sender === 'user' && (
                  <AccountCircleIcon sx={{ 
                    color: '#4F46E5',
                    bgcolor: '#1E1E1E',
                    p: 1,
                    borderRadius: 1,
                    boxSizing: 'content-box'
                  }} />
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>

      <Box
        sx={{
          p: 2,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          gap: 1.5,
          bgcolor: '#000000'
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Message Sentral..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#111111',
              color: '#FFFFFF',
              fontSize: '0.95rem',
              borderRadius: 2,
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.1)',
                transition: 'border-color 0.2s'
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#4F46E5',
              }
            },
            '& .MuiOutlinedInput-input': {
              '&::placeholder': {
                color: 'rgba(255, 255, 255, 0.5)',
                opacity: 1
              }
            }
          }}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          endIcon={<SendIcon />}
          sx={{
            minWidth: 'auto',
            px: 3,
            bgcolor: '#4F46E5',
            color: '#FFFFFF',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              bgcolor: '#4338CA',
            }
          }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default Sentral;
