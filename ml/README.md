# Financial Chatbot Setup Guide

This guide will help you set up and run the financial chatbot.

## Prerequisites

- Python 3.9 or higher
- Node.js 14 or higher (for the frontend)
- API key from one of these services:
  - Google AI Studio (Gemini) - https://ai.google.dev/
  - Groq - https://console.groq.com/keys

## Setup Instructions

### 1. Install Backend Dependencies

```bash
cd ml
pip install -r requirements.txt
```

### 2. Set Up API Keys

Run the setup script to configure your API keys:

```bash
python setup_env.py
```

Follow the prompts to enter your API keys. You need at least one of the following:
- Gemini API Key (from Google AI Studio)
- Groq API Key (from Groq)

### 3. Start the Backend Server

```bash
python app.py
```

The server will start on http://127.0.0.1:5000.

### 4. In a new terminal, start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000.

## Troubleshooting

If the chatbot doesn't respond:

1. Make sure the backend server is running
2. Check that you've set at least one valid API key (Gemini or Groq)
3. Look at the backend console for error messages
4. If you see API key errors, run `python setup_env.py` to reconfigure your keys
5. Ensure all required dependencies are installed

## Features

- Financial advice and guidance
- Stock price information
- Investment recommendations
- AI-powered financial analysis
- Voice input and text-to-speech output 