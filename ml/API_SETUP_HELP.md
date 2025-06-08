# API Setup and Troubleshooting Guide

If you're experiencing issues with the chatbot not responding, follow these steps to ensure your API keys are correctly configured.

## Getting API Keys

### For Gemini (Recommended)

1. Go to [Google AI Studio](https://ai.google.dev/)
2. Create or sign in to your Google account
3. Click on "Get API Key" in the top right
4. Create a new API key and copy it
5. Run `python setup_env.py` and paste your Gemini API key when prompted

### For Groq (Alternative)

1. Go to [Groq Console](https://console.groq.com/keys)
2. Create an account or sign in
3. Generate a new API key
4. Run `python setup_env.py` and paste your Groq API key when prompted

## Verifying API Keys Are Working

Run the test script to verify your API keys are working:

```bash
cd ml
python test_gemini.py
```

If successful, you should see "SUCCESS: All Gemini API tests passed!"

## Testing Financial Tools

To test if the financial tools are working correctly (stock prices, news, etc.), run:

```bash
cd ml
python test_tools.py
```

You can also test individual tools:
- `python test_tools.py price` - Test stock price retrieval
- `python test_tools.py history` - Test historical stock data
- `python test_tools.py news` - Test stock news retrieval
- `python test_tools.py search` - Test web search functionality

## Troubleshooting Common Issues

### Issue: "GEMINI_API_KEY not found in environment variables"

**Solution:**
1. Run `python setup_env.py` and add your API key
2. Make sure the `.env` file is in the `ml` directory
3. Restart the backend server

### Issue: "Cannot access local variable 'jgaad_chat_with_gemini'"

**Solution:**
This should be fixed with the latest updates, but if it persists:
1. Check that you're using the latest version of the code
2. Make sure you have installed all dependencies: `pip install -r requirements.txt`

### Issue: "ImportError: No module named google.generativeai"

**Solution:**
```bash
pip install google-generativeai>=0.3.1
```

### Issue: "No module named yfinance" or "yfinance fails to retrieve data"

**Solution:**
```bash
pip install yfinance --upgrade
```

### Issue: Connection errors or timeouts

**Solution:**
1. Check your internet connection
2. Verify that your API key is valid and has not expired
3. Try using a different AI provider (switch from Gemini to Groq or vice versa)

### Issue: Tools don't work properly in the chatbot

If the AI can't properly use the tools (like getting stock prices), try:
1. Run `python test_tools.py` to verify tools work standalone
2. Restart the backend server
3. Try more explicit questions like "What is the current stock price of RVNL?"
4. Check for specific error messages in the console

## Running the Application

After setting up your API keys:

1. Start the backend:
```bash
cd ml
python app.py
```

2. Start the frontend (in a new terminal):
```bash
cd frontend
npm run dev
```

3. Access the application at http://localhost:3000 