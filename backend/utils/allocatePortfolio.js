require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI('AIzaSyARf3FNJTx6XC4P5MLzPpaeBIuHod8HSEQ');

/**
 * Allocates investment amount based on risk score.
 * @param {number} riskScore - User's risk tolerance (1-10).
 * @param {number} investmentAmount - Total amount to be allocated.
 * @returns {Promise<Object>} - JSON structure with allocated amounts and number of investments.
 */
async function AllocatePortfolio(riskScore, investmentAmount) {
  console.log("here allocagte")
    try {
        const profile = determineInvestmentProfile(riskScore);
        const prompt = `As a financial advisor, allocate ₹${investmentAmount} based on a ${profile.type} risk profile (Risk Score: ${riskScore}/10). 
        
return the mutual fund allocation how many small cap, mid cap, large cap funds to invest in. return it in pure json form 
\n
{
smallCap: {
percentage: 30,
amount: 30000,
funds: 3
},
midCap: {
percentage: 40,
amount: 40000,
funds: 4
},
largeCap: {
percentage: 30,
amount: 30000,
}`;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;

        // Clean and parse JSON response
        const cleanResponse = response.text().replace(/```json|```/gi, "").trim();
        getRupeevest();
        // console.log(cleanResponse);
        return JSON.parse(cleanResponse); // Return structured JSON response
    } catch (error) {
        console.error("Error generating portfolio:", error);
        return { error: "Failed to generate portfolio recommendation." };
    }
}

/**
 * Determines the investment profile type based on risk score.
 */
function determineInvestmentProfile(riskScore) {
    const profiles = [
        { type: "Conservative", range: [1, 3] },
        { type: "Moderately Conservative", range: [3, 5] },
        { type: "Moderate", range: [5, 7] },
        { type: "Aggressive", range: [7, 8.5] },
        { type: "Very Aggressive", range: [8.5, 10] }
    ];
    return profiles.find(p => riskScore >= p.range[0] && riskScore <= p.range[1]);
}



async function getRupeevest() {
    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
      headless: true,
    });
    const page = await browser.newPage();
  
    page.on('console', (msg) => {
      console.log('LOG:', msg.text());
    });
  
    await page.goto('https://www.rupeevest.com');
    const scriptToRun = async () => {
      const asset_selection = ['1', '2', '3', '50', '4', '5'];
      const rating_selection = ['3', '4', '5'];
      const amc_selection = ['all'];
      const fund_m_selection = ['all'];
      const index_selection = ['all'];
      const fund_id = ['1'];
      const from_date = 0;
      const to_date = 0;
  
      const data = {
        selected_schemes: asset_selection,
        selected_rating: rating_selection,
        selected_amc: amc_selection,
        selected_manager: fund_m_selection,
        selected_index: index_selection,
        selected_fund_type: fund_id,
        selected_from_date: from_date,
        selected_to_date: to_date,
        condn_type: 'asset',
      };
  
      const targetUrl = '/functionalities/asset_class_section?';
  
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Robots-Tag': 'noindex',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        console.log('not ok');
      }
      const result = await response.json();
      
      return result;
    };
  
    const data1 = await page.evaluate(scriptToRun);
    fs.writeFileSync('data.json', JSON.stringify(data1, null, 2)); // save data1 to file with og json format
  
    // console.log(data1);
    await browser.close();
    return data1;
  }

module.exports = AllocatePortfolio;