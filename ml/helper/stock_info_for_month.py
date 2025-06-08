import yfinance as yf

# Get monthly stock information formatted for LLM consumption with complete OHLC data
def get_stock_info_for_month(ticker):
    """Get monthly stock information formatted for LLM consumption with complete OHLC data"""
    # Get the raw data
    stock_data = yf.Ticker(ticker).history(period="1mo")
    
    # Calculate key metrics
    current_price = stock_data['Close'].iloc[-1]
    start_price = stock_data['Close'].iloc[0]
    price_change = current_price - start_price
    percent_change = (price_change / start_price) * 100
    
    # Overall statistics
    high_price = stock_data['High'].max()
    low_price = stock_data['Low'].min()
    avg_volume = stock_data['Volume'].mean()
    
    # Add company info if available
    try:
        ticker_info = yf.Ticker(ticker).info
        company_name = ticker_info.get('shortName', ticker)
        market_cap = ticker_info.get('marketCap', 'N/A')
        if market_cap != 'N/A':
            market_cap = f"₹{market_cap/10000000:.2f} Cr"
    except:
        company_name = ticker
        market_cap = 'N/A'
    
    # Format the data as a string
    summary = f"""
Monthly Stock Summary for {company_name} ({ticker}):
=====================================
SUMMARY METRICS:
- Current Price: ₹{current_price:.2f}
- Monthly Change: ₹{price_change:.2f} ({percent_change:.2f}%)
- Monthly Range: ₹{low_price:.2f} (Low) to ₹{high_price:.2f} (High)
- Average Daily Volume: {int(avg_volume):,} shares
- Market Cap: {market_cap}

RECENT TRADING DATA (Last 5 days with OHLC):
"""
    
    # Add last 5 days of detailed OHLC data
    for date, row in stock_data[-5:].iterrows():
        date_str = date.strftime('%Y-%m-%d')
        daily_change = ((row['Close'] - row['Open']) / row['Open']) * 100
        change_symbol = "▲" if daily_change >= 0 else "▼"
        
        summary += f"- {date_str}:\n"
        summary += f"  * Open: ₹{row['Open']:.2f}\n"
        summary += f"  * High: ₹{row['High']:.2f}\n"
        summary += f"  * Low: ₹{row['Low']:.2f}\n"
        summary += f"  * Close: ₹{row['Close']:.2f} {change_symbol} {abs(daily_change):.2f}%\n"
        summary += f"  * Volume: {int(row['Volume']):,}\n"
    
    # Add technical indicators
    summary += "\nTECHNICAL INDICATORS:\n"
    
    # 7-day moving average (if we have enough data)
    if len(stock_data) >= 7:
        ma7 = stock_data['Close'].rolling(window=7).mean().iloc[-1]
        summary += f"- 7-Day Moving Average: ₹{ma7:.2f}\n"
    
    # RSI calculation (simplified)
    try:
        delta = stock_data['Close'].diff()
        gain = delta.where(delta > 0, 0).rolling(window=14).mean()
        loss = -delta.where(delta < 0, 0).rolling(window=14).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs)).iloc[-1]
        summary += f"- 14-Day RSI: {rsi:.2f}\n"
    except:
        pass
    
    return summary
