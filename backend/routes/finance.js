const express = require('express');
const router = express.Router();
const { recommendMutualFunds } = require('../controllers/finance');

router.post('/mutual-funds', recommendMutualFunds);

module.exports = router;