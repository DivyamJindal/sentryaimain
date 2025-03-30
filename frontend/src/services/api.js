import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

export const analyzeThreat = async (sonarData, cameraData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/analyze-threat`, {
      sonarData,
      cameraData
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing threat:', error);
    throw error;
  }
};
