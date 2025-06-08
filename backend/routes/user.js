const express = require("express");
const router = express.Router();
const { getUserProfile, updateUserProfile } = require("../controllers/user");



router.put("/:userId", updateUserProfile); // Update user profile
router.get("/:userId", getUserProfile); // Get user profile


module.exports = router;
