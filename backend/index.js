require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const puppeteer = require('puppeteer');
const fs = require('fs');
const helmet = require('helmet');
const xss = require('xss-clean');
const { NseIndia } = require('stock-nse-india');
const connectDB = require('./db/connect');
const errorHandlerMiddleware = require('./middleware/error-handler');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const portfolioRouter = require('./routes/portfolio');
const financeRouter = require('./routes/finance');
const cryptoRouter = require('./routes/crypto');
const authenticator = require('./middleware/authentication');

const app = express();
const port = process.env.PORT || 8000;
const nseIndia = new NseIndia();

// Middleware
app.set('trust proxy', 1);
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API!' });
});

app.get('/stocks/all', async (req, res) => {
    try {
        const symbols = await nseIndia.getAllStockSymbols();
        res.json(symbols);
    } catch (error) {
        console.error('Error fetching stock symbols:', error);
        res.status(500).json({ error: 'Failed to fetch stock symbols' });
    }
});

app.get('/stocks/:symbol', async (req, res) => {
    const { symbol } = req.params;
    try {
        const stockDetails = await nseIndia.getEquityDetails(symbol);
        res.json(stockDetails);
    } catch (error) {
        console.error(`Error fetching stock details for ${symbol}:`, error);
        res.status(500).json({ error: `Failed to fetch details for ${symbol}` });
    }
});

app.get('/stocks/:symbol/historical', async (req, res) => {
    const { symbol } = req.params;
    const range = {
        start: new Date('2010-01-01'),
        end: new Date('2021-03-20'),
    };
    try {
        const historicalData = await nseIndia.getEquityHistoricalData(symbol, range);
        res.json(historicalData);
    } catch (error) {
        console.error(`Error fetching historical data for ${symbol}:`, error);
        res.status(500).json({ error: `Failed to fetch historical data for ${symbol}` });
    }
});

app.get('/api/test/nse-all-symbols', async (req, res) => {
    try {
        console.log('[API Request] Fetching all stock symbols');
        const symbols = await nseIndia.getAllStockSymbols();
        console.log(`[API Response] Returned ${symbols.length} stock symbols`);
        res.json({ success: true, data: symbols });
    } catch (error) {
        console.error('[API Error] Error fetching all stock symbols:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to fetch all stock symbols' });
    }
});

app.get('/api/test/nse-details/:symbol', async (req, res) => {
    const { symbol } = req.params;
    try {
        console.log(`[API Request] Fetching equity details for ${symbol}`);
        const details = await nseIndia.getEquityDetails(symbol);
        console.log(`[API Response] Successfully fetched details for ${symbol}`);
        res.json({ success: true, data: details });
    } catch (error) {
        console.error(`[API Error] Error fetching equity details for ${symbol}:`, error);
        res.status(500).json({ success: false, error: error.message || `Failed to fetch equity details for ${symbol}` });
    }
});

app.get('/api/test/nse-historical/:symbol', async (req, res) => {
    const { symbol } = req.params;
    const range = {
        start: new Date('2010-01-01'),
        end: new Date(Date.now())
    };
    try {
        console.log(`[API Request] Fetching historical data for ${symbol}`);
        const historicalData = await nseIndia.getEquityHistoricalData(symbol, range);
        console.log(`[API Response] Returned ${historicalData.length} historical records for ${symbol}`);
        res.json({ success: true, data: historicalData });
    } catch (error) {
        console.error(`[API Error] Error fetching historical data for ${symbol}:`, error);
        res.status(500).json({ success: false, error: error.message || `Failed to fetch historical data for ${symbol}` });
    }
});

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
        const rating_selection = ['1', '2', '3', '4', '5', 'Unrated'];
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
    fs.writeFileSync('mf_ruppeevest_data.json', JSON.stringify(data1, null, 2));

    console.log('Rupeevest data fetched and saved to mf_ruppeevest_data.json');
    await browser.close();
    return data1;
}

app.get('/mutual-funds', async (req, res) => {
    try {
        // Read data from the saved file instead of fetching it again
        const data = JSON.parse(fs.readFileSync('mf_ruppeevest_data.json', 'utf8'));
        res.json(data);
    } catch (error) {
        console.error('Error reading mutual fund data:', error);
        res.status(500).json({ error: 'Failed to fetch mutual fund data' });
    }
});

// Existing routes
app.use('/api/auth', authRouter);
app.use('/api/users',authenticator, userRouter);
app.use('/api/portfolio',authenticator, portfolioRouter);
app.use('/api/crypto', cryptoRouter);

// Error handling middleware
app.use(errorHandlerMiddleware);

// Start the server
const start = async () => {
    try {
        // Connect to the database
        await connectDB(process.env.MONGO_URI);
        
        // Fetch and save Rupeevest data on server startup
        console.log('Fetching Rupeevest data on startup...');
        // await getRupeevest();
        console.log('Rupeevest data fetched and saved successfully');
        
        app.listen(port, () => console.log(`Server is listening on port ${port}...`));
    } catch (error) {
        console.error('Error during startup:', error);
    }
};

start();
