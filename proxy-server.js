const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Allow Wix domains
app.use(cors({
  origin: ['https://*.wixsite.com', 'https://*.wix.com'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Parse JSON requests
app.use(express.json());

// Ensure JSON responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

const LUMA_API_KEY = process.env.LUMA_API_KEY;
const LUMA_API_URL = 'https://api.lumalabs.ai/dream-machine/v1/generations';

// Generate video
app.post('/api/generate-video', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    console.log(`Generating video with image: ${imageUrl}`);
    const response = await axios.post(
      LUMA_API_URL,
      {
        prompt: 'gimbal and drone operated video',
        model: 'ray-2',
        duration: '5s',
        aspect_ratio: 'original',
        keyframes: {
          frame0: {
            type: 'image',
            url: imageUrl
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${LUMA_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000
      }
    );
    console.log(`Video generation started: ${response.data.id}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error in /api/generate-video:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || `Server error: ${error.message}`
    });
  }
});

// Check status
app.get('/api/check-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Checking status for ID: ${id}`);
    const response = await axios.get(`${LUMA_API_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${LUMA_API_KEY}`,
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error in /api/check-status:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || `Server error: ${error.message}`
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});