import datetime
import traceback
from langchain.agents import tool
from dotenv import load_dotenv
import os
import re
from typing import List, Dict, Optional
import requests
import json
from langchain_core.tools import Tool
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_experimental.utilities import PythonREPL

# Load environment variables
load_dotenv()

# ======================================== BASIC TOOLS ========================================

@tool
def check_system_time(format: str = "%Y-%m-%d %H:%M:%S"):
    """Returns the current date and time in the specified format"""
    current_time = datetime.datetime.now()
    formatted_time = current_time.strftime(format)
    return formatted_time

# ======================================== SEARCH TOOLS ========================================

# DuckDuckGo search doesn't require an API key
search_tool = DuckDuckGoSearchRun()

@tool
def web_search(query: str) -> str:
    """
    Search the web for real-time information using DuckDuckGo.
    Use this tool when you need up-to-date information about financial markets, stocks, etc.
    
    Args:
        query (str): The search query to look up on the web.
    
    Returns:
        str: Search results from the web.
    """
    try:
        print(f"Searching for: {query}")
        results = search_tool.run(query)
        print(f"Search results length: {len(results) if results else 0} characters")
        return results
    except Exception as e:
        error_msg = f"Error searching the web: {str(e)}"
        print(error_msg)
        traceback.print_exc()
        return error_msg

# Python REPL for calculations
python_repl = PythonREPL()
repl_tool = Tool(
    name="python_repl",
    description="A Python shell. Use this to execute python commands for calculations or data processing. Input should be a valid python command. Print output with `print(...)` to see results.",
    func=python_repl.run,
)

# ======================================== STOCK FINANCE TOOLS ========================================
import yfinance as yf

def get_ticker_from_company(company_name: str) -> str:
    """
    Get the stock ticker symbol for a given company name, with special handling for Indian stocks.
    
    Args:
        company_name (str): The name of the company.
    
    Returns:
        str: The stock ticker symbol, with .NS added for Indian stocks if not already present.
    """
    try:
        # Clean up the input
        company_name = company_name.strip().lower()
        
        # Check if it's already a valid ticker symbol
        if re.match(r'^[a-z0-9.]+$', company_name):
            # Check if it's an Indian stock that needs .NS suffix
            if not '.' in company_name and not company_name.endswith('.ns'):
                return f"{company_name.upper()}.NS"
            return company_name.upper()
        
        # Special case handling for common Indian stocks
        indian_stocks = {
            "reliance": "RELIANCE.NS",
            "tcs": "TCS.NS",
            "hdfc bank": "HDFCBANK.NS", 
            "hdfc": "HDFC.NS",
            "infosys": "INFY.NS",
            "tata motors": "TATAMOTORS.NS",
            "tata steel": "TATASTEEL.NS",
            "tata": "TATAMOTORS.NS",
            "sbi": "SBIN.NS",
            "adani": "ADANIENT.NS",
            "adani green": "ADANIGREEN.NS",
            "adani energy": "ADANIGREEN.NS",
            "adani ports": "ADANIPORTS.NS",
            "adani power": "ADANIPOWER.NS",
            "bajaj finance": "BAJFINANCE.NS",
            "maruti": "MARUTI.NS",
            "maruti suzuki": "MARUTI.NS",
            "rvnl": "RVNL.NS",
            "rail vikas": "RVNL.NS",
            "rail vikas nigam": "RVNL.NS",
            "itc": "ITC.NS",
            "wipro": "WIPRO.NS",
            "axis bank": "AXISBANK.NS",
            "kotak mahindra": "KOTAKBANK.NS",
            "kotak bank": "KOTAKBANK.NS",
            "larsen": "LT.NS",
            "l&t": "LT.NS",
            "larsen & toubro": "LT.NS",
            "bharti airtel": "BHARTIARTL.NS",
            "airtel": "BHARTIARTL.NS",
            "hul": "HINDUNILVR.NS",
            "hindustan unilever": "HINDUNILVR.NS",
            "sun pharma": "SUNPHARMA.NS",
            "icici bank": "ICICIBANK.NS"
        }
        
        # Check if it's in our predefined list
        for key, value in indian_stocks.items():
            if key in company_name or company_name in key:
                print(f"Found direct match for {company_name}: {value}")
                return value
        
        # If not in our predefined list, search Yahoo Finance
        base_url = f"https://query1.finance.yahoo.com/v1/finance/search?q={company_name}&lang=en-US&region=US&quotesCount=10&newsCount=0&listsCount=0&enableFuzzyQuery=true"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json'
        }
        
        response = requests.get(base_url, headers=headers)
        data = response.json()
        
        if 'quotes' in data and len(data['quotes']) > 0:
            # Filter for Indian market first (.NS or .BO)
            indian_stocks = [q for q in data['quotes'] if q['symbol'].endswith('.NS') or q['symbol'].endswith('.BO')]
            
            if indian_stocks:
                symbol = indian_stocks[0]['symbol']
                print(f"Found Indian stock for {company_name}: {symbol}")
                return symbol
            
            # If no Indian stocks found, use the first result
            symbol = data['quotes'][0]['symbol']
            # Check if it's likely an Indian stock that needs .NS suffix
            if re.match(r'^[A-Z]+$', symbol) and not '.' in symbol:
                symbol = f"{symbol}.NS"
                
            print(f"Found ticker for {company_name}: {symbol}")
            return symbol
        
        # If not found via API, try common suffix for Indian stocks
        return f"{company_name.upper().replace(' ', '')}.NS"
    
    except Exception as e:
        print(f"Error finding ticker for {company_name}: {str(e)}")
        # Make a best guess for Indian stock
        return f"{company_name.upper().replace(' ', '')}.NS"

@tool
def get_current_stock_price(company_name: str) -> str:
    """
    Get the current price and basic info of a stock. Works best with Indian stocks.
    
    Args:
        company_name (str): The name or ticker symbol of the company (e.g., "Reliance", "RVNL", "Tata Motors")
    
    Returns:
        str: The current price and basic information about the stock.
    """
    try:
        print(f"Getting current price for: {company_name}")
        symbol = get_ticker_from_company(company_name)
        print(f"Using ticker symbol: {symbol}")
        
        stock = yf.Ticker(symbol)
        
        # Get basic info
        info = stock.info
        company_name = info.get('shortName', info.get('longName', symbol))
        
        # Get current price data
        hist = stock.history(period='2d')  # Get 2 days to show change
        
        if hist.empty:
            return f"No price data available for {company_name} ({symbol})"
        
        current_price = hist['Close'].iloc[-1]
        
        # Calculate change from previous day if available
        change_str = ""
        if len(hist) > 1:
            prev_price = hist['Close'].iloc[-2]
            change = current_price - prev_price
            change_pct = (change / prev_price) * 100
            change_str = f" (Change: {change:.2f} / {change_pct:.2f}%)"
        
        # Format currency based on market
        currency = info.get('currency', 'INR')
        
        # Get additional useful info if available
        market_cap = info.get('marketCap', None)
        market_cap_str = f", Market Cap: {market_cap/1e9:.2f}B {currency}" if market_cap else ""
        
        volume = hist['Volume'].iloc[-1] if 'Volume' in hist else None
        volume_str = f", Volume: {int(volume):,}" if volume else ""
        
        result = f"{company_name} ({symbol}): {current_price:.2f} {currency}{change_str}{market_cap_str}{volume_str}"
        print(f"Result: {result}")
        return result
        
    except Exception as e:
        error_msg = f"Error getting stock price: {str(e)}"
        print(error_msg)
        traceback.print_exc()
        return error_msg

@tool
def get_stock_history(inputs: str) -> str:
    """
    Get historical stock prices for a company over a specified period.
    
    Args:
        inputs (str): A string in the format "company_name, period" where period is like 1d, 5d, 1mo, 3mo, 6mo, 1y, etc.
                      Example: "Reliance Industries, 5d" or "RVNL, 1mo"
    
    Returns:
        str: Historical stock price data formatted as a table.
    """
    try:
        parts = inputs.split(",", 1)
        if len(parts) != 2:
            return "Please provide input in the format: company_name, period (e.g., 'Reliance, 5d')"
        
        company_name = parts[0].strip()
        period = parts[1].strip()
        
        # Validate period
        valid_periods = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max']
        if period not in valid_periods and not re.match(r'^\d+[dwmy]$', period):
            closest = min(valid_periods, key=lambda x: abs(len(x) - len(period)))
            return f"Invalid period: {period}. Use formats like: {', '.join(valid_periods)}. Did you mean {closest}?"
        
        # Get ticker and data
        ticker = get_ticker_from_company(company_name)
        stock = yf.Ticker(ticker)
        data = stock.history(period=period)
        
        if data.empty:
            return f"No historical data available for {company_name} ({ticker}) over period {period}"
        
        # Format the results
        company_info = stock.info.get('shortName', ticker)
        result = f"Historical prices for {company_info} ({ticker}) over {period}:\n\n"
        result += "Date         | Open    | High    | Low     | Close   | Volume\n"
        result += "-------------|---------|---------|---------|---------|------------\n"
        
        # Add data rows (limit to 15 rows to avoid excessive output)
        max_rows = min(15, len(data))
        for i in range(max_rows):
            date = data.index[i].strftime('%Y-%m-%d')
            open_price = f"{data['Open'].iloc[i]:.2f}"
            high = f"{data['High'].iloc[i]:.2f}"
            low = f"{data['Low'].iloc[i]:.2f}"
            close = f"{data['Close'].iloc[i]:.2f}"
            volume = f"{int(data['Volume'].iloc[i]):,}" if 'Volume' in data else "N/A"
            
            result += f"{date} | {open_price:7} | {high:7} | {low:7} | {close:7} | {volume}\n"
        
        if max_rows < len(data):
            result += f"\n[Showing {max_rows} of {len(data)} days. Request a shorter period for complete data.]"
            
        # Add summary statistics
        first_close = data['Close'].iloc[0]
        last_close = data['Close'].iloc[-1]
        change = last_close - first_close
        change_pct = (change / first_close) * 100
        
        result += f"\n\nSummary: Started at {first_close:.2f}, ended at {last_close:.2f}"
        result += f"\nChange: {change:.2f} ({change_pct:.2f}%)"
        
        return result
        
    except Exception as e:
        error_msg = f"Error getting stock history: {str(e)}"
        print(error_msg)
        traceback.print_exc()
        return error_msg

@tool
def get_stock_news(company_name: str) -> str:
    """
    Get the latest news for a stock or company by searching the web.
    
    Args:
        company_name (str): The name of the company or its ticker symbol.
    
    Returns:
        str: Recent news about the company.
    """
    try:
        # Try to get the official ticker symbol first
        ticker = get_ticker_from_company(company_name)
        company_name_clean = ticker.split('.')[0]  # Remove exchange suffix
        
        # Create a more specific search query
        search_query = f"{company_name} {company_name_clean} stock news latest"
        print(f"Searching news for: {search_query}")
        
        # Use the web search tool to get news
        news_results = web_search(search_query)
        
        # Format and return the results
        return f"Latest news for {company_name} ({ticker}):\n\n{news_results}"
    
    except Exception as e:
        error_msg = f"Error fetching news for {company_name}: {str(e)}"
        print(error_msg)
        traceback.print_exc()
        return error_msg

# Define the tools list for easy import in other files
main_tools = [
    check_system_time,
    get_current_stock_price,
    get_stock_history,
    get_stock_news,
    web_search,
    repl_tool
]

if __name__ == "__main__":
    # Test the tools
    print(get_current_stock_price("RVNL"))
    print("\n" + "-"*80 + "\n")
    print(get_stock_history("Reliance, 5d"))
    print("\n" + "-"*80 + "\n")
    print(get_stock_news("Tata Motors"))