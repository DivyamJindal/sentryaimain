import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Grid,
    CircularProgress,
    IconButton,
    Card,
    CardContent,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const SonarDetection = () => {
    const [readings, setReadings] = useState(['']);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleReadingChange = (index, value) => {
        const newReadings = [...readings];
        newReadings[index] = value;
        setReadings(newReadings);
    };

    const addReading = () => {
        setReadings([...readings, '']);
    };

    const removeReading = (index) => {
        const newReadings = readings.filter((_, i) => i !== index);
        setReadings(newReadings);
    };

    const parseReadings = (readingStr) => {
        return readingStr.split(',').map(num => parseFloat(num.trim())).filter(num => !isNaN(num));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');
            
            // Parse and validate readings
            const parsedReadings = readings.map(reading => parseReadings(reading));
            const isValid = parsedReadings.every(reading => reading.length === 60);
            
            if (!isValid) {
                throw new Error('Each reading must contain exactly 60 comma-separated values');
            }

            // Send to backend
            const response = await fetch('http://localhost:5001/api/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ readings: parsedReadings }),
            });

            if (!response.ok) {
                throw new Error('Failed to get prediction');
            }

            const data = await response.json();
            setResults(data.results);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, margin: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                Sonar Detection System
            </Typography>
            
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Enter Sonar Readings
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Enter 60 comma-separated values between 0 and 1 for each reading
                </Typography>
                
                {readings.map((reading, index) => (
                    <Box key={index} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <TextField
                            fullWidth
                            label={`Sonar Reading ${index + 1}`}
                            value={reading}
                            onChange={(e) => handleReadingChange(index, e.target.value)}
                            multiline
                            rows={2}
                            sx={{ mr: 1 }}
                        />
                        <IconButton 
                            onClick={() => removeReading(index)}
                            disabled={readings.length === 1}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                ))}
                
                <Button 
                    startIcon={<AddIcon />}
                    onClick={addReading}
                    sx={{ mt: 1 }}
                >
                    Add Reading
                </Button>
                
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{ mt: 2, ml: 2 }}
                >
                    {loading ? <CircularProgress size={24} /> : 'Analyze'}
                </Button>
                
                {error && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}
            </Paper>

            {results.length > 0 && (
                <Grid container spacing={2}>
                    {results.map((result, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Reading {index + 1}
                                    </Typography>
                                    <Typography variant="h4" color={result.prediction === 'MINE' ? 'error' : 'success'}>
                                        {result.prediction}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Confidence: {result.confidence.toFixed(2)}%
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default SonarDetection;
