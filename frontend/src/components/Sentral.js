import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Paper, Typography, List, ListItem, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';

const Sentral = ({ detectionData, videoId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  // Clean up function
  useEffect(() => {
    return () => {
      // Stop any ongoing recording when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleListening = async () => {
    try {
      if (isListening) {
        console.log('Stopping audio recording');
        // Stop recording
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
        
        // Stop microphone access
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        setIsListening(false);
      } else {
        console.log('Starting audio recording');
        // Request microphone permission
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Create media recorder
        const mediaRecorder = new MediaRecorder(streamRef.current);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        
        // Set up event handlers
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorder.onstop = async () => {
          console.log('MediaRecorder stopped, processing audio');
          if (audioChunksRef.current.length === 0) {
            console.log('No audio data recorded');
            return;
          }
          
          // Create audio blob from recorded chunks
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
          audioChunksRef.current = [];
          
          // Process the recorded audio
          await handleAudioUpload(audioBlob);
        };
        
        // Start recording
        mediaRecorder.start();
        setIsListening(true);
      }
    } catch (error) {
      console.error('Error toggling audio recording:', error);
      if (error.name === 'NotAllowedError') {
        setMessages(prev => [...prev, {
          text: "Please allow microphone access to use voice chat.",
          sender: 'system',
          timestamp: new Date()
        }]);
      } else {
        setMessages(prev => [...prev, {
          text: "Error accessing microphone. Please check your permissions and try again.",
          sender: 'system',
          timestamp: new Date()
        }]);
      }
      setIsListening(false);
    }
  };

  const handleAudioUpload = async (audioBlob) => {
    try {
      // Show user that we're processing their audio
      setMessages(prev => [...prev, {
        text: "Processing your voice input...",
        sender: 'system',
        timestamp: new Date()
      }]);
      
      // Create FormData and append the audio blob
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.mp3');
      
      // Add threat data if available
      if (detectionData) {
        formData.append('threatData', JSON.stringify(detectionData));
      }
      
      // Send to our custom endpoint
      const response = await fetch('http://localhost:5003/api/voice-upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add transcription to chat
        setMessages(prev => prev.filter(msg => 
          msg.text !== "Processing your voice input..." || msg.sender !== 'system'
        ));
        
        setMessages(prev => [...prev, {
          text: data.transcription,
          sender: 'user',
          timestamp: new Date()
        }]);
        
        // Add AI response to chat
        setMessages(prev => [...prev, {
          text: data.response,
          sender: 'ai',
          timestamp: new Date()
        }]);
        
        // Speak the response
        const utterance = new SpeechSynthesisUtterance(data.response);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error in audio upload:', error);
      setMessages(prev => prev.filter(msg => 
        msg.text !== "Processing your voice input..." || msg.sender !== 'system'
      ));
      
      setMessages(prev => [...prev, {
        text: "Sorry, I encountered an error processing your voice input.",
        sender: 'system',
        timestamp: new Date()
      }]);
    }
  };

  const handleVoiceChat = async (userMessage) => {
    if (!userMessage.trim()) return;

    // Add user message to chat
    setMessages(prev => [...prev, {
      text: userMessage,
      sender: 'user',
      timestamp: new Date()
    }]);

    try {
      const response = await fetch('http://localhost:5003/api/voice-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          threatData: detectionData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Add AI response to chat
        setMessages(prev => [...prev, {
          text: data.response,
          sender: 'ai',
          timestamp: new Date()
        }]);

        // Speak the response
        const utterance = new SpeechSynthesisUtterance(data.response);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error in voice chat:', error);
      setMessages(prev => [...prev, {
        text: "Sorry, I encountered an error processing your request.",
        sender: 'system',
        timestamp: new Date()
      }]);
    }
  };

  const handleSend = () => {
    if (input.trim()) {
      handleVoiceChat(input);
      setInput('');
    }
  };

  useEffect(() => {
    // When detectionData changes, fetch and display the analysis
    if (detectionData) {
      // Simulate fetching analysis from the text file
      const analysisText = `THREAT ANALYSIS:
      1. THREAT IDENTIFICATION:
      - High Threat Objects: ${Object.entries(detectionData.unique_objects)
        .filter(([obj]) => ['Mines', 'Drone', 'boat'].includes(obj))
        .map(([obj, count]) => `${obj} (${count})`).join(', ')}
      - Medium Threat Objects: ${Object.entries(detectionData.unique_objects)
        .filter(([obj]) => ['truck', 'car', 'airplane', 'person'].includes(obj))
        .map(([obj, count]) => `${obj} (${count})`).join(', ')}
      
      2. RISK ASSESSMENT:
      - Overall Threat Level: ${Object.keys(detectionData.unique_objects).some(obj => 
        ['Mines', 'Drone', 'boat'].includes(obj)) ? 'HIGH' : 'MEDIUM'}
      - Video Duration: ${detectionData.video_info.total_frames / detectionData.video_info.fps} seconds
      - Resolution: ${detectionData.video_info.resolution}

      3. RECOMMENDATIONS:
      ${Object.keys(detectionData.unique_objects).some(obj => 
        ['Mines', 'Drone', 'boat'].includes(obj)) ? 
        '- IMMEDIATE ACTIONS:\n  * Alert maritime security forces\n  * Deploy rapid response team\n  * Establish 1000m safety perimeter' :
        '- STANDARD PROCEDURES:\n  * Continue monitoring\n  * Document observations'}`;

      setMessages([{
        text: analysisText,
        sender: 'ai',
        timestamp: new Date(),
        isAnalysis: true
      }]);
    }
  }, [detectionData]);

  const handleEmergencyCall = async () => {
    const emergencyMessage = "🚨 EMERGENCY SERVICES NOTIFIED 🚨\nImmediate response teams have been alerted and are being dispatched to your location.\n\nPriority: HIGH\nResponse Units: Maritime Security, Coast Guard\nETA: 8-12 minutes\nAction Required: Maintain safe distance, continue monitoring";
    
    setMessages(prev => [...prev, {
      text: emergencyMessage,
      sender: 'system',
      timestamp: new Date(),
      isEmergency: true
    }]);

    try {
      const response = await fetch('http://localhost:5001/api/emergency-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: emergencyMessage,
          recipientNumber: '+17326198162'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [...prev, {
          text: "📞 Emergency call initiated. Call Status: " + data.status,
          sender: 'system',
          timestamp: new Date()
        }]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error making emergency call:', error);
      setMessages(prev => [...prev, {
        text: "❌ Error initiating emergency call. Please try again or use alternative emergency contacts.",
        sender: 'system',
        timestamp: new Date()
      }]);
    }
  };

  const glowPulse = `
    @keyframes glow-pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
      }
      100% {
        box-shadow: 0 0 0 10px rgba(255, 0, 0, 0);
      }
    }
  `;

  return (
    <Paper 
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#111827'
      }}
    >
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <List>
          {messages.map((msg, index) => (
            <ListItem
              key={index}
              sx={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 2
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
                      maxWidth: msg.isAnalysis ? '95%' : '80%',
                      p: 2,
                      borderRadius: 2,
                      bgcolor: msg.sender === 'user' ? '#1E40AF' : 
                              msg.sender === 'system' ? '#DC2626' :
                              msg.isAnalysis ? '#0D4A3E' : '#1F2937',
                      color: '#FFFFFF',
                      animation: msg.isEmergency ? `${glowPulse} 2s infinite` : 'none',
                      position: 'relative',
                      fontFamily: msg.isAnalysis ? 'monospace' : 'inherit'
                    }}
                  >
                    {msg.sender !== 'user' && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                        {msg.sender === 'ai' ? (
                          <SmartToyIcon sx={{ color: '#9CA3AF', fontSize: '1rem' }} />
                        ) : (
                          <span style={{ fontSize: '1.2rem' }}>🚨</span>
                        )}
                        <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                          {msg.sender === 'ai' ? (msg.isAnalysis ? 'Threat Analysis Report' : 'Sentral AI') : 'EMERGENCY ALERT'}
                        </Typography>
                      </Box>
                    )}
                    <Typography
                      sx={{
                        fontSize: msg.isAnalysis ? '0.85rem' : '0.95rem',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        lineHeight: msg.isAnalysis ? 1.6 : 1.5
                      }}
                    >
                      {msg.text}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        position: 'absolute',
                        bottom: 4,
                        right: 8,
                        fontSize: '0.7rem'
                      }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString()}
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

      <Box sx={{ p: 2, bgcolor: '#1F2937' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="error"
            onClick={handleEmergencyCall}
            sx={{
              bgcolor: '#DC2626',
              '&:hover': { bgcolor: '#B91C1C' }
            }}
          >
            Call Emergency Services
          </Button>
          
          <IconButton
            color={isListening ? 'error' : 'primary'}
            onClick={toggleListening}
            sx={{ ml: 1 }}
          >
            {isListening ? <StopIcon /> : <MicIcon />}
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: '#374151' },
                '&:hover fieldset': { borderColor: '#4B5563' },
                '&.Mui-focused fieldset': { borderColor: '#6366F1' }
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleSend}
            sx={{
              bgcolor: '#4F46E5',
              '&:hover': { bgcolor: '#4338CA' }
            }}
          >
            <SendIcon />
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default Sentral;
