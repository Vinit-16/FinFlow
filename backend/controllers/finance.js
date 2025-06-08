// controller for mutual funds and stocks.

const axios = require("axios");
const User = require("../models/User"); // Import your User model
const calculateUserRiskScore = require("../utils/calculateRiskScore");
const  AllocatePortfolio  = require("../utils/allocatePortfolio");

/**
 * Controller for mutual fund recommendations.
 * Input: Amount to be invested.
 * Output: Mutual fund allocation and recommendations.
 */
async function recommendMutualFunds(req, res) {
  console.log("here at the mutual funds")
  const { amount } = req.body; // Amount to be invested
  const userId = req.user.userId; // Assuming user ID is available in the request
  console.log(amount)
  console.log(userId)
  try {
    // Fetch user data from the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate the user's risk score
    const riskScore = calculateUserRiskScore(user);

    // Allocate the investment amount based on the risk score
    const allocation = await AllocatePortfolio(riskScore, amount);

    // Extract mutual fund allocation percentages
    const { largeCap, midCap, smallCap } = allocation.mutualFunds;

    // Fetch mutual fund recommendations for each category
    const [smallCapFunds, midCapFunds, largeCapFunds] = await Promise.all([
      fetchMutualFunds("Equity : Small Cap", smallCap.amount),
      fetchMutualFunds("Equity : Mid Cap", midCap.amount),
      fetchMutualFunds("Equity : Large Cap", largeCap.amount),
    ]);

    // Combine the results
    const response = {
      allocation: {
        smallCap: {
          percentage: smallCap.percentage,
          amount: smallCap.amount,
          funds: smallCapFunds,
        },
        midCap: {
          percentage: midCap.percentage,
          amount: midCap.amount,
          funds: midCapFunds,
        },
        largeCap: {
          percentage: largeCap.percentage,
          amount: largeCap.amount,
          funds: largeCapFunds,
        },
      },
    };

    // Send the response
    res.status(200).json(response);
  } catch (error) {
    console.error("Error in recommendMutualFunds:", error);
    res.status(500).json({ error: "Failed to generate mutual fund recommendations" });
  }
}

/**
 * Fetch mutual funds for a specific category.
 * @param {string} category - Mutual fund category (e.g., "Equity : Small Cap").
 * @param {number} amount - Amount to be invested in this category.
 * @returns {Promise<Array>} - Array of mutual fund recommendations.
 */
async function fetchMutualFunds(category, amount) {
  try {
    const response = await axios.post("http://127.0.0.1:5000/recommend-mutual-funds", {
      "mutual-funds": category,
    });

    // Limit the number of funds based on the amount
    const funds = response.data.slice(0, Math.ceil(amount / 100000)); // Example: 1 fund per ₹1 lakh
    return funds;
  } catch (error) {
    console.error(`Error fetching ${category} funds:`, error);
    return [];
  }
}

module.exports = { recommendMutualFunds };