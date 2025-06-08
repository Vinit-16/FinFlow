const fs = require('fs');

async function filterMutualFunds(inputData) {
    try {
        // Read data.json
        const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

        // Extract mutual fund names from input
        const mutualFundNames = inputData.schemedata.map(fund => fund.s_name);

        // Filter mutual funds from data.json
        const matchedFunds = data.schemedata.filter(fund =>
            mutualFundNames.includes(fund.s_name)
        );

        return matchedFunds; // Return filtered mutual funds as JSON
    } catch (error) {
        console.error("Error filtering mutual funds:", error);
        return [];
    }
}

// Example usage
async function main() {
    const inputData = {
        "schemedata": [
            {
                "s_name": "360 ONE Focused Equity Fund"
            },
            {
                "s_name": "Aditya Birla SL Equity Advantage Fund(G)"
            }
        ]
    };

    const result = await filterMutualFunds(inputData);
    console.log(JSON.stringify(result, null, 2));
}

main();
