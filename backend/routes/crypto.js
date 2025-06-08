const express = require('express');
const axios = require('axios');
const router = express.Router();

// Get all cryptocurrencies
router.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://rest.coincap.io/v3/assets', {
      params: {
        apiKey: '18b3ed33d20819bb6a472a3e18eb0083fbed73567406da7b25db3488264b0490'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching cryptocurrency data:', error);
    res.status(500).json({ error: 'Failed to fetch cryptocurrency data' });
  }
});

// Get a specific cryptocurrency by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(`https://rest.coincap.io/v3/assets/${id}`, {
      params: {
        apiKey: '18b3ed33d20819bb6a472a3e18eb0083fbed73567406da7b25db3488264b0490'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching cryptocurrency data for ${id}:`, error);
    res.status(500).json({ error: `Failed to fetch data for ${id}` });
  }
});

module.exports = router; 