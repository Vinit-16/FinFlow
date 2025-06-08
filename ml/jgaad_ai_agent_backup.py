import os
import traceback
from dotenv import load_dotenv
import sys
import json
import re

# Ensure environment variables are loaded
load_dotenv()

# Function to safely initialize the Gemini model
def initialize_gemini():
    try:
        import google.generativeai as genai
        
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            print("Warning: GEMINI_API_KEY not found in environment variables")
            print("Please run 'python setup_env.py' to configure your API keys")
            return None
            
        print(f"Configuring Gemini with API key: {api_key[:4]}...{api_key[-4:] if len(api_key) > 8 else ''}")
        genai.configure(api_key=api_key)
        
        # Create the model with enhanced financial prompt
        generation_config = {
          "temperature": 0.2,  # Lower temperature for more factual responses
          "top_p": 0.95,
          "top_k": 40,
          "max_output_tokens": 8192,
          "response_mime_type": "text/plain",
        }
        
        # Improved system instruction focused on stock data
        system_instruction = """You are a financial assistant specializing in stock market information, especially for the Indian stock market.
        
        When responding to queries about stock prices or market data:
        1. Clearly state that you don't have real-time market data access
        2. Recommend reliable sources like Yahoo Finance or Google Finance
        3. For Indian stocks, remind users to look for the NSE (.NS) or BSE (.BO) tickers
        
        For general financial advice:
        - Provide balanced, ethical guidance
        - Focus on budgeting, investing, retirement planning, debt management
        - Acknowledge when situations require professional consultation
        
        If asked about historical events or concepts in finance, provide educational information.
        Never make up financial data or stock prices.
        """
        
        model = genai.GenerativeModel(
          model_name="gemini-1.5-flash",
          generation_config=generation_config,
          system_instruction=system_instruction,
        )
        
        print("Gemini model initialized successfully")
        return model.start_chat(history=[])
    except ImportError:
        print("Error: google-generativeai package is not installed.")
        print("Please run: pip install google-generativeai>=0.3.1")
        return None
    except Exception as e:
        print(f"Error initializing Gemini: {str(e)}")
        traceback.print_exc()
        return None

# Initialize chat session
print("Initializing Gemini chat session...")
chat_session = initialize_gemini()
print(f"Chat session initialized: {'Success' if chat_session else 'Failed'}")

def jgaad_chat_with_gemini(query, research=''):
    global chat_session
    
    if not chat_session:
        # Try to initialize one more time
        print("Chat session not found, attempting to reinitialize...")
        chat_session = initialize_gemini()
        
    if not chat_session:
        print("Failed to initialize chat session")
        return "I'm unable to connect to the AI service at the moment. Please check your API keys and try again later."
    
    try:
        # Check if query is about stock prices - provide specific response
        if is_stock_price_query(query):
            stock_name = extract_stock_name(query)
            return generate_stock_fallback_response(stock_name)
            
        print(f"Sending query to Gemini: {query[:50]}...")
        response = chat_session.send_message(f'{research} \nBased on the above research answer the following query properly\n {query}')
        print(f"Gemini response received: {len(response.text)} characters")
        return response.text
    except Exception as e:
        print(f"Error in Gemini chat: {str(e)}")
        traceback.print_exc()
        # Simple fallback response when everything fails
        return f"I apologize, but I'm having trouble processing your request about '{query}'. Please try again later or with a different question."

def is_stock_price_query(query):
    """Check if the query is asking about stock prices or market data"""
    query = query.lower()
    price_patterns = [
        r'(what|current|latest).*?(price|value|worth).*?(of|for)',
        r'how much.*?(is|does).*?(stock|share)',
        r'stock price',
        r'share price',
        r'market price',
        r'trading at'
    ]
    
    for pattern in price_patterns:
        if re.search(pattern, query):
            return True
    return False

def extract_stock_name(query):
    """Extract potential stock name from the query"""
    # Remove common question words and price-related terms
    query = query.lower()
    words_to_remove = [
        'what', 'is', 'the', 'current', 'price', 'of', 'stock', 'share', 
        'value', 'for', 'how', 'much', 'worth', 'market'
    ]
    
    for word in words_to_remove:
        query = query.replace(f" {word} ", " ")
    
    # Clean up and return the most likely company name
    query = query.strip()
    return query

def generate_stock_fallback_response(stock_name):
    """Generate a helpful response when asked about stock prices"""
    return f"""I don't have access to real-time stock prices for {stock_name}. 

To get the current stock price of {stock_name}, please check:
1. Yahoo Finance (finance.yahoo.com)
2. Google Finance (google.com/finance)
3. NSE India website for Indian stocks (nseindia.com)
4. Your brokerage platform

For Indian stocks like {stock_name}, look for the ticker with .NS (NSE) or .BO (BSE) suffix."""

if __name__ == "__main__":
    # Sample test query
    test_query = "What is the stock price of RVNL?"
    print("Test Query:", test_query)
    response = jgaad_chat_with_gemini(test_query)
    print("Response:", response)