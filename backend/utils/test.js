const AllocatePortfolio = require("./allocatePortfolio"); // Change the filename accordingly

async function testPortfolio() {
    const riskScore = 7; // Example risk score
    const investmentAmount = 100000; // Example investment amount in INR
console.log("here")
    const result = await AllocatePortfolio(riskScore, investmentAmount);
    console.log("Generated Portfolio Allocation:\n", JSON.stringify(result, null, 2));
}

testPortfolio();
