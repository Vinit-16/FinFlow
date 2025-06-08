const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    // Basic User Details
    name: {
        type: String,
        required: [true, "Please enter your name"],
        minLength: 2,
        maxLength: 50
    },
    email: {
        type: String,
        required: [true, "Please enter a valid email"],
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "Please enter a valid email"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minLength: 6
    },
    age: {
        type: Number,
    },
    occupation: {
        type: String,
    },
    maritalStatus: {
        type: String,
        enum: ["Single", "Married", "Divorced", "Widowed"],
    },
    numberOfDependents: {
        type: Number,
    },

    // Financial Details
    annualIncome: {
        type: Number,
    },
    monthlyExpenses: {
        type: Number,
    },
    savings: {
        type: Number,
    },
    debtAmount: {
        type: Number,
    },
    // Risk Assessment Questions
    investmentExperience: {
        type: String,
        enum: ["Beginner", "Intermediate", "Expert"],
    },
    investmentHorizon: {
        type: String,
        enum: ["Short-term (less than 3 years)", "Medium (3-7 years)", "Long-term (7+ years)"],
    },
    liquidityNeed: {
        type: String,
        enum: ["Immediate", "Within 1 year", "Can wait 5+ years"],
    },
    riskTolerance: {
        type: Number, // Scale from 1-10
    },
    reactionToMarketFluctuations: {
        type: String,
        enum: ["Sell everything", "Hold", "Buy more"],
    },
    assetAllocationPreference: {
        type: String,
        enum: ["High return, high risk", "Balanced", "Safe and steady"],
    },
    investmentKnowledge: {
        type: Number, // Scale from 1-10
    },

    // Financial Goals
    financialGoals: [{
        type: String,
        enum: ["Retirement", "Child’s Education", "Marriage", "House Purchase", "Wealth Building",  "Other"]
    }],

    riskScore: {
        type:Number
    },
    // Account & Security
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Generate JWT token
UserSchema.methods.createJWT = function () {
    return jwt.sign(
        { userId: this._id, name: this.name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_LIFETIME }
    );
};

// Compare password
UserSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
