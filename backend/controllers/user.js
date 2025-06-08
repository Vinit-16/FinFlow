const User = require("../models/User"); // Import the User model

// Update user data
const updateUserProfile = async (req, res) => {
    try {
        const { userId } = req.params; // Get user ID from URL
        const userData = req.body; // Get data from request body
        console.log("User data:", userData);
        
        // Find the user by ID
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("User found:", user);
        // Update user fields with new answers
        user.financialGoals = userData.financialGoals || user.financialGoals;
        user.age = userData.age || user.age;
        user.annualIncome = userData.annualIncome || user.annualIncome;
        user.numberOfDependents = userData.numberOfDependents || user.numberOfDependents;
        user.investmentHorizon = userData.investmentHorizon || user.investmentHorizon;
        user.liquidityNeed = userData.liquidityNeed || user.liquidityNeed;
        user.reactionToMarketFluctuations = userData.reactionToMarketFluctuations || user.reactionToMarketFluctuations;
        user.riskTolerance = userData.riskTolerance || user.riskTolerance;
        user.assetAllocationPreference = userData.assetAllocationPreference || user.assetAllocationPreference;
        user.existingInvestments = userData.existingInvestments || user.existingInvestments;

        console.log("Updated user:", user);

        // Save updated user to database
        console.log("Saving user to database...");
        await user.save();
        console.log("User saved successfully.");

        res.status(200).json({
            message: "User profile updated successfully",
            user
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    updateUserProfile,
    getUserProfile
};