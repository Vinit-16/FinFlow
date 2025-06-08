const User = require('../models/User');
const calculateUserRiskScore = require('../utils/calculateRiskScore');
const AllocatePortfolio = require('../utils/allocatePortfolio');

const getMutualFundPercentage = async (req, res) => {
    try {
        // Get authenticated user
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Get investment amount from request body
        const { amount } = req.body;
        if (!amount || isNaN(amount)) {
            return res.status(400).json({ success: false, message: 'Invalid investment amount' });
        }

        // Calculate risk score
        const riskScore = calculateUserRiskScore(user);
        
        // Update the user's risk score in the database
        user.riskScore = riskScore;
        await user.save();

        // Get portfolio allocation
        const allocation = await AllocatePortfolio(riskScore, amount);
        
        if (allocation.error) {
            return res.status(500).json({ success: false, message: allocation.error });
        }

        res.status(200).json({
            success: true,
            riskScore,
            investmentAmount: amount,
            allocation
        });

    } catch (error) {
        console.error('Portfolio allocation error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during portfolio allocation',
            error: error.message
        });
    }
};

module.exports = {
    getMutualFundPercentage
};