const express = require('express');
const router = express.Router();
const { getMutualFundPercentage } = require('../controllers/portfolio');

// Protected route - requires authentication
router.post('/percentage-mutual-fund', getMutualFundPercentage);

module.exports = router;