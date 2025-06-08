import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import seaborn as sns
from datetime import datetime
import yfinance as yf
from io import BytesIO
import matplotlib as mpl
import re
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

# Set default theme for all visualizations
plt.style.use('seaborn-v0_8-pastel')
sns.set_theme(style="ticks", palette="pastel")

# Configure fonts and colors
TITLE_FONT_SIZE = 16
SUBTITLE_FONT_SIZE = 12
TEXT_FONT_SIZE = 10
PRIMARY_COLOR = "#2E86C1"  # Blue
SECONDARY_COLOR = "#F39C12"  # Orange
ACCENT_COLOR = "#E74C3C"  # Red
POSITIVE_COLOR = "#2ECC71"  # Green
NEGATIVE_COLOR = "#E74C3C"  # Red
NEUTRAL_COLOR = "#7F8C8D"  # Gray

# Import helper functions
from helper.stock_price_5days import get_stock_price
from helper.stock_news import get_recent_stock_news
from helper.financial_statements import get_financial_statements
from helper.stock_info_for_month import get_stock_info_for_month

class StockReport:
    def __init__(self, ticker):
        """Initialize with stock ticker"""
        self.ticker = ticker
        # Add .NS if not already present (NSE stocks)
        if not self.ticker.endswith('.NS'):
            self.ticker = f"{self.ticker}.NS"
        
        # Get stock data
        self.stock = yf.Ticker(self.ticker)
        self.company_info = self.stock.info
        self.company_name = self.company_info.get('longName', self.company_info.get('shortName', self.ticker))
        
        # Extract and store more company information
        self.company_description = self.company_info.get('longBusinessSummary', '')
        self.company_website = self.company_info.get('website', 'N/A')
        self.company_industry = self.company_info.get('industry', 'N/A')
        self.company_sector = self.company_info.get('sector', 'N/A')
        self.company_employees = self.company_info.get('fullTimeEmployees', 'N/A')
        self.company_founded = self.company_info.get('founded', 'N/A')
        self.company_ceo = self.company_info.get('companyOfficers', [{}])[0].get('name', 'N/A') if self.company_info.get('companyOfficers') else 'N/A'
        
        # Store more market data
        self.market_cap = self.company_info.get('marketCap', 'N/A')
        if self.market_cap != 'N/A':
            self.market_cap_str = f"₹{self.market_cap/10000000:.2f} Cr"
        else:
            self.market_cap_str = 'N/A'
        
        self.pe_ratio = self.company_info.get('trailingPE', 'N/A')
        self.dividend_yield = self.company_info.get('dividendYield', 'N/A')
        if self.dividend_yield != 'N/A':
            self.dividend_yield = f"{self.dividend_yield * 100:.2f}%"
        
        self.fifty_two_week_high = self.company_info.get('fiftyTwoWeekHigh', 'N/A')
        self.fifty_two_week_low = self.company_info.get('fiftyTwoWeekLow', 'N/A')
        
        # Get monthly data
        self.monthly_data = self.stock.history(period="1mo")
        
        # Get 1 year data for trends
        self.yearly_data = self.stock.history(period="1y")
        
        # Get 5 year data if available for long-term analysis
        self.five_year_data = self.stock.history(period="5y")
        
        # Get financial data using helper functions
        self.financial_statements_text = get_financial_statements(self.ticker)
        self.news_text = get_recent_stock_news(self.ticker)
        self.price_5days_text = get_stock_price(self.ticker)
        self.monthly_info_text = get_stock_info_for_month(self.ticker)
        
        # Extract key financial metrics from the text
        self.extract_key_metrics()
        
        # Calculate additional technical indicators
        self.calculate_technical_indicators()
        
    def extract_key_metrics(self):
        """Extract key metrics from the financial statements text"""
        self.metrics = {}
        
        # Find total assets
        total_assets_match = re.search(r"Total Assets \(Latest\): ₹([\d\.]+) Cr", self.financial_statements_text)
        if total_assets_match:
            self.metrics['total_assets'] = float(total_assets_match.group(1))
            
        # Find total liabilities
        total_liabilities_match = re.search(r"Total Liabilities \(Latest\): ₹([\d\.]+) Cr", self.financial_statements_text)
        if total_liabilities_match:
            self.metrics['total_liabilities'] = float(total_liabilities_match.group(1))
            
        # Find revenue
        revenue_match = re.search(r"Revenue \(Latest\): ₹([\d\.]+) Cr", self.financial_statements_text)
        if revenue_match:
            self.metrics['revenue'] = float(revenue_match.group(1))
            
        # Find net income
        net_income_match = re.search(r"Net Income: ₹([\d\.]+) Cr", self.financial_statements_text)
        if net_income_match:
            self.metrics['net_income'] = float(net_income_match.group(1))
            
        # Find profit margin
        profit_margin_match = re.search(r"Profit Margin: ([\d\.]+)%", self.financial_statements_text)
        if profit_margin_match:
            self.metrics['profit_margin'] = float(profit_margin_match.group(1))
            
        # Find EPS
        eps_match = re.search(r"EPS \(Basic\): ₹([\d\.]+)", self.financial_statements_text)
        if eps_match:
            self.metrics['eps'] = float(eps_match.group(1))
            
        # Get sector and industry
        sector_industry_match = re.search(r"Sector: (.+) \| Industry: (.+)", self.financial_statements_text)
        if sector_industry_match:
            self.metrics['sector'] = sector_industry_match.group(1)
            self.metrics['industry'] = sector_industry_match.group(2)
            
        # Extract more metrics if available
        debt_equity_match = re.search(r"Debt-to-Equity: ([\d\.]+)", self.financial_statements_text)
        if debt_equity_match:
            self.metrics['debt_equity_ratio'] = float(debt_equity_match.group(1))
            
        current_ratio_match = re.search(r"Current Ratio: ([\d\.]+)", self.financial_statements_text)
        if current_ratio_match:
            self.metrics['current_ratio'] = float(current_ratio_match.group(1))
            
        ocf_match = re.search(r"Operating Cash Flow: ₹([\d\.]+) Cr", self.financial_statements_text)
        if ocf_match:
            self.metrics['operating_cash_flow'] = float(ocf_match.group(1))
            
        fcf_match = re.search(r"Free Cash Flow: ₹([\d\.]+) Cr", self.financial_statements_text)
        if fcf_match:
            self.metrics['free_cash_flow'] = float(fcf_match.group(1))
            
        capex_match = re.search(r"Capital Expenditure: ₹([\d\.]+) Cr", self.financial_statements_text)
        if capex_match:
            self.metrics['capex'] = float(capex_match.group(1))
            
        ebitda_match = re.search(r"EBITDA: ₹([\d\.]+) Cr", self.financial_statements_text)
        if ebitda_match:
            self.metrics['ebitda'] = float(ebitda_match.group(1))
            
        # Add any additional metrics you want to extract
        
    def calculate_technical_indicators(self):
        """Calculate additional technical indicators for the stock"""
        self.technical_indicators = {}
        
        # Calculate 20-day and 50-day moving averages
        if len(self.yearly_data) >= 50:
            self.technical_indicators['ma20'] = self.yearly_data['Close'].rolling(window=20).mean().iloc[-1]
            self.technical_indicators['ma50'] = self.yearly_data['Close'].rolling(window=50).mean().iloc[-1]
            self.technical_indicators['ma200'] = self.yearly_data['Close'].rolling(window=200).mean().iloc[-1] if len(self.yearly_data) >= 200 else None
            
            # Determine if golden cross or death cross occurred recently (20-day crossing 50-day)
            ma20 = self.yearly_data['Close'].rolling(window=20).mean()
            ma50 = self.yearly_data['Close'].rolling(window=50).mean()
            
            # Check for crosses in the past 30 days
            last_30 = min(30, len(self.yearly_data))
            cross_data = pd.DataFrame({'ma20': ma20, 'ma50': ma50}).tail(last_30)
            
            # Golden cross: ma20 crosses above ma50
            golden_cross = (cross_data['ma20'].shift(1) < cross_data['ma50'].shift(1)) & (cross_data['ma20'] > cross_data['ma50'])
            # Death cross: ma20 crosses below ma50
            death_cross = (cross_data['ma20'].shift(1) > cross_data['ma50'].shift(1)) & (cross_data['ma20'] < cross_data['ma50'])
            
            if golden_cross.any():
                self.technical_indicators['recent_golden_cross'] = True
                self.technical_indicators['cross_date'] = cross_data[golden_cross].index[0].strftime('%Y-%m-%d')
            elif death_cross.any():
                self.technical_indicators['recent_death_cross'] = True
                self.technical_indicators['cross_date'] = cross_data[death_cross].index[0].strftime('%Y-%m-%d')
        
        # Calculate RSI (Relative Strength Index)
        try:
            delta = self.yearly_data['Close'].diff()
            gain = delta.where(delta > 0, 0).rolling(window=14).mean()
            loss = -delta.where(delta < 0, 0).rolling(window=14).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs)).iloc[-1]
            self.technical_indicators['rsi'] = rsi
        except:
            self.technical_indicators['rsi'] = None
            
        # Calculate MACD (Moving Average Convergence Divergence)
        try:
            exp1 = self.yearly_data['Close'].ewm(span=12, adjust=False).mean()
            exp2 = self.yearly_data['Close'].ewm(span=26, adjust=False).mean()
            macd = exp1 - exp2
            signal = macd.ewm(span=9, adjust=False).mean()
            
            self.technical_indicators['macd'] = macd.iloc[-1]
            self.technical_indicators['macd_signal'] = signal.iloc[-1]
            self.technical_indicators['macd_histogram'] = macd.iloc[-1] - signal.iloc[-1]
            self.technical_indicators['macd_trend'] = 'bullish' if macd.iloc[-1] > signal.iloc[-1] else 'bearish'
        except:
            self.technical_indicators['macd'] = None
            
        # Calculate Bollinger Bands
        try:
            window = 20
            std_dev = 2
            
            sma = self.yearly_data['Close'].rolling(window=window).mean()
            rolling_std = self.yearly_data['Close'].rolling(window=window).std()
            
            upper_band = sma + (rolling_std * std_dev)
            lower_band = sma - (rolling_std * std_dev)
            
            self.technical_indicators['bollinger_sma'] = sma.iloc[-1]
            self.technical_indicators['bollinger_upper'] = upper_band.iloc[-1]
            self.technical_indicators['bollinger_lower'] = lower_band.iloc[-1]
            
            # Check if price is near bands
            current_price = self.yearly_data['Close'].iloc[-1]
            band_width = upper_band.iloc[-1] - lower_band.iloc[-1]
            
            if current_price > (upper_band.iloc[-1] - 0.05 * band_width):
                self.technical_indicators['bollinger_position'] = 'near upper band (potential overbought)'
            elif current_price < (lower_band.iloc[-1] + 0.05 * band_width):
                self.technical_indicators['bollinger_position'] = 'near lower band (potential oversold)'
            else:
                self.technical_indicators['bollinger_position'] = 'middle range'
        except:
            self.technical_indicators['bollinger_sma'] = None
        
    def plot_price_trend(self):
        """Plot price trend over the past year"""
        plt.figure(figsize=(10, 6))
        plt.plot(self.yearly_data.index, self.yearly_data['Close'], color=PRIMARY_COLOR, linewidth=2)
        
        # Add 50-day moving average
        ma50 = self.yearly_data['Close'].rolling(window=50).mean()
        plt.plot(self.yearly_data.index, ma50, color=SECONDARY_COLOR, linewidth=1.5, linestyle='--', label='50-day MA')
        
        # Add 200-day moving average if enough data
        if len(self.yearly_data) >= 200:
            ma200 = self.yearly_data['Close'].rolling(window=200).mean()
            plt.plot(self.yearly_data.index, ma200, color=ACCENT_COLOR, linewidth=1.5, linestyle='-.', label='200-day MA')
        
        # Format axes
        plt.title(f"{self.company_name} - 1 Year Price Trend", fontsize=TITLE_FONT_SIZE, fontweight='bold')
        plt.xlabel('Date', fontsize=TEXT_FONT_SIZE)
        plt.ylabel('Price (₹)', fontsize=TEXT_FONT_SIZE)
        plt.grid(True, alpha=0.3)
        plt.legend()
        
        # Format date ticks
        plt.gca().xaxis.set_major_locator(mdates.MonthLocator(interval=1))
        plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%b %Y'))
        plt.xticks(rotation=45)
        
        # Tight layout to use space efficiently
        plt.tight_layout()
        
        # Save to BytesIO object
        img_data = BytesIO()
        plt.savefig(img_data, format='png', dpi=150)
        img_data.seek(0)
        plt.close()
        
        return img_data
        
    def plot_volume_analysis(self):
        """Plot volume trend over the past year"""
        plt.figure(figsize=(10, 6))
        
        # Create a colormap based on price changes
        colors = [POSITIVE_COLOR if close >= open_price else NEGATIVE_COLOR 
                 for close, open_price in zip(self.yearly_data['Close'], self.yearly_data['Open'])]
        
        # Plot volume bars
        plt.bar(self.yearly_data.index, self.yearly_data['Volume'], color=colors, alpha=0.7)
        
        # Add 20-day moving average of volume
        vol_ma20 = self.yearly_data['Volume'].rolling(window=20).mean()
        plt.plot(self.yearly_data.index, vol_ma20, color=PRIMARY_COLOR, linewidth=2, linestyle='-', label='20-day Volume MA')
        
        # Format axes
        plt.title(f"{self.company_name} - Trading Volume Analysis", fontsize=TITLE_FONT_SIZE, fontweight='bold')
        plt.xlabel('Date', fontsize=TEXT_FONT_SIZE)
        plt.ylabel('Volume', fontsize=TEXT_FONT_SIZE)
        plt.grid(True, alpha=0.3)
        plt.legend()
        
        # Format date ticks
        plt.gca().xaxis.set_major_locator(mdates.MonthLocator(interval=1))
        plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%b %Y'))
        plt.xticks(rotation=45)
        
        # Format y-axis with millions/billions
        plt.gca().yaxis.set_major_formatter(mpl.ticker.FuncFormatter(lambda x, p: f'{x/1000000:.1f}M' if x < 1e9 else f'{x/1000000000:.1f}B'))
        
        # Tight layout to use space efficiently
        plt.tight_layout()
        
        # Save to BytesIO object
        img_data = BytesIO()
        plt.savefig(img_data, format='png', dpi=150)
        img_data.seek(0)
        plt.close()
        
        return img_data
    
    def plot_financial_metrics(self):
        """Plot key financial metrics as a bar chart"""
        plt.figure(figsize=(10, 6))
        
        # Extract key metrics if available
        metrics_to_plot = {}
        if 'total_assets' in self.metrics:
            metrics_to_plot['Total Assets'] = self.metrics['total_assets']
        if 'total_liabilities' in self.metrics:
            metrics_to_plot['Total Liabilities'] = self.metrics['total_liabilities']
        if 'revenue' in self.metrics:
            metrics_to_plot['Revenue'] = self.metrics['revenue']
        if 'net_income' in self.metrics:
            metrics_to_plot['Net Income'] = self.metrics['net_income']
            
        if not metrics_to_plot:
            # If no metrics available, create a placeholder
            plt.text(0.5, 0.5, "Financial metrics data not available", 
                    ha='center', va='center', fontsize=12, transform=plt.gca().transAxes)
        else:
            # Plot bar chart
            x = list(metrics_to_plot.keys())
            y = list(metrics_to_plot.values())
            
            bars = plt.bar(x, y, color=[PRIMARY_COLOR, ACCENT_COLOR, SECONDARY_COLOR, POSITIVE_COLOR])
            
            # Add labels
            plt.title(f"{self.company_name} - Key Financial Metrics (₹ Crores)", fontsize=TITLE_FONT_SIZE, fontweight='bold')
            plt.ylabel('₹ Crores', fontsize=TEXT_FONT_SIZE)
            
            # Add data labels on top of bars
            for bar in bars:
                height = bar.get_height()
                plt.text(bar.get_x() + bar.get_width()/2., height + 0.1,
                        f'₹{height:.1f} Cr', ha='center', va='bottom', rotation=0, fontsize=9)
            
            plt.grid(True, alpha=0.3, axis='y')
        
        # Tight layout to use space efficiently
        plt.tight_layout()
        
        # Save to BytesIO object
        img_data = BytesIO()
        plt.savefig(img_data, format='png', dpi=150)
        img_data.seek(0)
        plt.close()
        
        return img_data
        
    def plot_candlestick_chart(self):
        """Create a candlestick chart for the last month"""
        # Use the last 30 days of data
        data = self.monthly_data.tail(30).copy()
        
        # Create figure and axis
        fig, ax = plt.subplots(figsize=(10, 6))
        
        # Format dates on x-axis
        dates = [date.date() for date in data.index]
        
        # Determine colors for candlesticks
        colors = [POSITIVE_COLOR if close >= open_price else NEGATIVE_COLOR 
                 for close, open_price in zip(data['Close'], data['Open'])]
        
        # Plot candlestick wicks (high-low range)
        for i, (idx, row) in enumerate(data.iterrows()):
            # Plot the high-low line
            ax.plot([i, i], [row['Low'], row['High']], color='black', linewidth=1)
        
        # Plot candlestick bodies (open-close range)
        for i, (idx, row) in enumerate(data.iterrows()):
            open_price = row['Open']
            close = row['Close']
            
            # Determine if it's an up or down day
            if close >= open_price:
                color = POSITIVE_COLOR
                bottom = open_price
                height = close - open_price
            else:
                color = NEGATIVE_COLOR
                bottom = close
                height = open_price - close
                
            # Plot the body
            ax.bar(i, height, bottom=bottom, color=color, width=0.8, alpha=0.7)
        
        # Set x-axis labels
        plt.xticks(range(len(dates)), [date.strftime('%d-%b') for date in dates], rotation=45)
        plt.xlim(-1, len(dates))
        
        # Set chart title and labels
        plt.title(f"{self.company_name} - 30-Day Price Action", fontsize=TITLE_FONT_SIZE, fontweight='bold')
        plt.xlabel('Date', fontsize=TEXT_FONT_SIZE)
        plt.ylabel('Price (₹)', fontsize=TEXT_FONT_SIZE)
        plt.grid(True, alpha=0.3, axis='y')
        
        # Tight layout to use space efficiently
        plt.tight_layout()
        
        # Save to BytesIO object
        img_data = BytesIO()
        plt.savefig(img_data, format='png', dpi=150)
        img_data.seek(0)
        plt.close()
        
        return img_data
    
    def plot_performance_comparison(self):
        """Compare stock performance with NIFTY 50 index over past year"""
        plt.figure(figsize=(10, 6))
        
        # Get NIFTY 50 data
        try:
            nifty = yf.Ticker("^NSEI").history(period="1y")
            
            # Normalize both series to 100 at the start for comparison
            stock_norm = self.yearly_data['Close'] / self.yearly_data['Close'].iloc[0] * 100
            nifty_norm = nifty['Close'] / nifty['Close'].iloc[0] * 100
            
            # Plot both series
            plt.plot(self.yearly_data.index, stock_norm, color=PRIMARY_COLOR, linewidth=2, label=f"{self.company_name}")
            plt.plot(nifty.index, nifty_norm, color=SECONDARY_COLOR, linewidth=2, linestyle='--', label="NIFTY 50")
            
            # Calculate outperformance
            outperformance = stock_norm.iloc[-1] - nifty_norm.iloc[-1]
            
            # Format axes
            performance_text = f"Outperformed by {outperformance:.2f}%" if outperformance > 0 else f"Underperformed by {-outperformance:.2f}%"
            plt.title(f"{self.company_name} vs NIFTY 50 - Relative Performance\n{performance_text}", 
                    fontsize=TITLE_FONT_SIZE, fontweight='bold')
            
        except Exception as e:
            plt.text(0.5, 0.5, f"Could not load comparison data: {str(e)}", 
                   ha='center', va='center', fontsize=12, transform=plt.gca().transAxes)
        
        plt.xlabel('Date', fontsize=TEXT_FONT_SIZE)
        plt.ylabel('Normalized Price (Starting at 100)', fontsize=TEXT_FONT_SIZE)
        plt.grid(True, alpha=0.3)
        plt.legend()
        
        # Format date ticks
        plt.gca().xaxis.set_major_locator(mdates.MonthLocator(interval=1))
        plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%b %Y'))
        plt.xticks(rotation=45)
        
        # Tight layout to use space efficiently
        plt.tight_layout()
        
        # Save to BytesIO object
        img_data = BytesIO()
        plt.savefig(img_data, format='png', dpi=150)
        img_data.seek(0)
        plt.close()
        
        return img_data
        
    def plot_historical_performance(self):
        """Plot historical performance over 5 years if available"""
        plt.figure(figsize=(10, 6))
        
        # Check if we have enough data
        if len(self.five_year_data) < 252:  # Approximately 1 year of trading days
            plt.text(0.5, 0.5, "Insufficient historical data available (less than 1 year)", 
                   ha='center', va='center', fontsize=12, transform=plt.gca().transAxes)
        else:
            # Plot the close price
            plt.plot(self.five_year_data.index, self.five_year_data['Close'], color=PRIMARY_COLOR, linewidth=1.5)
            
            # Add a 200-day moving average
            ma200 = self.five_year_data['Close'].rolling(window=200).mean()
            plt.plot(self.five_year_data.index, ma200, color=SECONDARY_COLOR, linewidth=1.5, linestyle='--', label='200-day MA')
            
            # Highlight key events and significant price movements
            # Find significant price changes (e.g., >10% in a month)
            monthly_returns = self.five_year_data['Close'].resample('M').last().pct_change() * 100
            significant_months = monthly_returns[abs(monthly_returns) > 10].index
            
            # Highlight these periods
            for month in significant_months:
                # Find the data point in our original dataframe
                try:
                    month_data = self.five_year_data.loc[month.strftime('%Y-%m')]
                    if not month_data.empty:
                        # Get the last trading day of the month
                        last_day = month_data.iloc[-1]
                        plt.plot(last_day.name, last_day['Close'], 'o', 
                                 color=POSITIVE_COLOR if monthly_returns.loc[month] > 0 else NEGATIVE_COLOR,
                                 markersize=6)
                except:
                    pass  # Skip if month is not found
            
            # Add annotations for current price and all-time high
            all_time_high = self.five_year_data['Close'].max()
            all_time_high_date = self.five_year_data['Close'].idxmax()
            
            current_price = self.five_year_data['Close'].iloc[-1]
            current_date = self.five_year_data.index[-1]
            
            # Calculate percent from all-time high
            pct_from_ath = ((current_price - all_time_high) / all_time_high) * 100
            
            plt.annotate(f'ATH: ₹{all_time_high:.2f}', 
                         xy=(all_time_high_date, all_time_high),
                         xytext=(10, 20),
                         textcoords='offset points',
                         arrowprops=dict(arrowstyle='->', color='black', lw=1),
                         fontsize=9)
            
            if current_date != all_time_high_date:  # Don't annotate if current price is ATH
                plt.annotate(f'Current: ₹{current_price:.2f}\n({pct_from_ath:.1f}% from ATH)', 
                             xy=(current_date, current_price),
                             xytext=(10, -30),
                             textcoords='offset points',
                             arrowprops=dict(arrowstyle='->', color='black', lw=1),
                             fontsize=9)
            
            # Calculate and display CAGR
            if len(self.five_year_data) >= 252 * 3:  # At least 3 years of data
                years = (self.five_year_data.index[-1] - self.five_year_data.index[0]).days / 365.25
                start_price = self.five_year_data['Close'].iloc[0]
                end_price = self.five_year_data['Close'].iloc[-1]
                cagr = ((end_price / start_price) ** (1 / years) - 1) * 100
                
                plt.title(f"{self.company_name} - {years:.1f}-Year Price History\nCAGR: {cagr:.2f}%", 
                          fontsize=TITLE_FONT_SIZE, fontweight='bold')
            else:
                plt.title(f"{self.company_name} - Long-term Price History", 
                          fontsize=TITLE_FONT_SIZE, fontweight='bold')
        
        plt.xlabel('Date', fontsize=TEXT_FONT_SIZE)
        plt.ylabel('Price (₹)', fontsize=TEXT_FONT_SIZE)
        plt.grid(True, alpha=0.3)
        plt.legend()
        
        # Format date ticks
        plt.gca().xaxis.set_major_locator(mdates.YearLocator())
        plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y'))
        plt.xticks(rotation=45)
        
        # Tight layout to use space efficiently
        plt.tight_layout()
        
        # Save to BytesIO object
        img_data = BytesIO()
        plt.savefig(img_data, format='png', dpi=150)
        img_data.seek(0)
        plt.close()
        
        return img_data
        
    def plot_technical_indicators(self):
        """Plot technical indicators (RSI, MACD, Bollinger Bands)"""
        # Create a figure with 3 subplots
        fig, (ax1, ax2, ax3) = plt.subplots(3, 1, figsize=(10, 12), gridspec_kw={'height_ratios': [2, 1, 1]})
        
        # Get data for the last 6 months
        data = self.yearly_data.tail(130).copy()
        
        # Plot 1: Price and Bollinger Bands
        ax1.plot(data.index, data['Close'], color=PRIMARY_COLOR, label='Close Price')
        
        # Calculate Bollinger Bands
        window = 20
        std_dev = 2
        
        rolling_mean = data['Close'].rolling(window=window).mean()
        rolling_std = data['Close'].rolling(window=window).std()
        
        upper_band = rolling_mean + (rolling_std * std_dev)
        lower_band = rolling_mean - (rolling_std * std_dev)
        
        ax1.plot(data.index, rolling_mean, color=NEUTRAL_COLOR, label='20-day SMA')
        ax1.plot(data.index, upper_band, color=SECONDARY_COLOR, linestyle='--', label='Upper Band')
        ax1.plot(data.index, lower_band, color=SECONDARY_COLOR, linestyle='--', label='Lower Band')
        ax1.fill_between(data.index, upper_band, lower_band, color=SECONDARY_COLOR, alpha=0.1)
        
        ax1.set_title(f"{self.company_name} - Technical Analysis", fontsize=TITLE_FONT_SIZE, fontweight='bold')
        ax1.set_ylabel('Price (₹)', fontsize=TEXT_FONT_SIZE)
        ax1.grid(True, alpha=0.3)
        ax1.legend(loc='upper left')
        
        # Plot 2: MACD
        # Calculate MACD
        exp1 = data['Close'].ewm(span=12, adjust=False).mean()
        exp2 = data['Close'].ewm(span=26, adjust=False).mean()
        macd = exp1 - exp2
        signal = macd.ewm(span=9, adjust=False).mean()
        histogram = macd - signal
        
        ax2.plot(data.index, macd, color=PRIMARY_COLOR, label='MACD')
        ax2.plot(data.index, signal, color=SECONDARY_COLOR, label='Signal')
        
        # Plot histogram with colors
        for i in range(len(histogram)):
            if i > 0:
                if histogram.iloc[i] >= 0 and histogram.iloc[i-1] < 0:
                    ax2.axvline(histogram.index[i], color=NEUTRAL_COLOR, linestyle='--', alpha=0.3)
                elif histogram.iloc[i] < 0 and histogram.iloc[i-1] >= 0:
                    ax2.axvline(histogram.index[i], color=NEUTRAL_COLOR, linestyle='--', alpha=0.3)
                    
        # Plot positive and negative histogram values with different colors
        pos_hist = histogram.copy()
        neg_hist = histogram.copy()
        pos_hist[pos_hist < 0] = 0
        neg_hist[neg_hist > 0] = 0
        
        ax2.bar(data.index, pos_hist, color=POSITIVE_COLOR, label='Positive MACD', width=1.5, alpha=0.7)
        ax2.bar(data.index, neg_hist, color=NEGATIVE_COLOR, label='Negative MACD', width=1.5, alpha=0.7)
        
        ax2.set_ylabel('MACD', fontsize=TEXT_FONT_SIZE)
        ax2.grid(True, alpha=0.3)
        ax2.axhline(y=0, color='black', linestyle='-', alpha=0.3)
        ax2.legend(loc='upper left')
        
        # Plot 3: RSI
        # Calculate RSI
        delta = data['Close'].diff()
        gain = delta.where(delta > 0, 0)
        loss = -delta.where(delta < 0, 0)
        
        avg_gain = gain.rolling(window=14).mean()
        avg_loss = loss.rolling(window=14).mean()
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        
        ax3.plot(data.index, rsi, color=ACCENT_COLOR, label='RSI')
        
        # Add overbought/oversold levels
        ax3.axhline(y=70, color=NEGATIVE_COLOR, linestyle='--', alpha=0.5, label='Overbought (70)')
        ax3.axhline(y=30, color=POSITIVE_COLOR, linestyle='--', alpha=0.5, label='Oversold (30)')
        ax3.axhline(y=50, color=NEUTRAL_COLOR, linestyle='-', alpha=0.3)
        
        # Fill overbought/oversold regions
        ax3.fill_between(data.index, 70, 100, color=NEGATIVE_COLOR, alpha=0.1)
        ax3.fill_between(data.index, 0, 30, color=POSITIVE_COLOR, alpha=0.1)
        
        ax3.set_ylabel('RSI', fontsize=TEXT_FONT_SIZE)
        ax3.set_ylim(0, 100)
        ax3.grid(True, alpha=0.3)
        ax3.legend(loc='upper left')
        
        # Set common x-axis label and format
        fig.text(0.5, 0.04, 'Date', ha='center', fontsize=TEXT_FONT_SIZE)
        
        # Format date ticks
        for ax in [ax1, ax2, ax3]:
            ax.xaxis.set_major_locator(mdates.MonthLocator())
            ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %Y'))
            plt.setp(ax.xaxis.get_majorticklabels(), rotation=45)
        
        # Tight layout to use space efficiently
        plt.tight_layout()
        plt.subplots_adjust(bottom=0.1)
        
        # Save to BytesIO object
        img_data = BytesIO()
        plt.savefig(img_data, format='png', dpi=150)
        img_data.seek(0)
        plt.close()
        
        return img_data
        
    def generate_pdf_report(self):
        """Generate a comprehensive PDF report with all visualizations and data using ReportLab"""
        report_filename = f"{self.ticker.replace('.NS', '')}_stock_report.pdf"
        
        # Create PDF document
        doc = SimpleDocTemplate(report_filename, pagesize=landscape(letter))
        styles = getSampleStyleSheet()
        
        # Create custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Title'],
            fontSize=18,
            textColor=colors.HexColor(0x2E86C1),
            spaceAfter=12,
            alignment=TA_CENTER
        )
        
        heading_style = ParagraphStyle(
            'Heading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor(0x2E86C1),
            spaceAfter=8
        )
        
        subheading_style = ParagraphStyle(
            'SubHeading',
            parent=styles['Heading3'],
            fontSize=12,
            textColor=colors.HexColor(0x2E86C1),
            spaceAfter=6
        )
        
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=10,
            spaceAfter=6
        )
        
        small_style = ParagraphStyle(
            'Small',
            parent=styles['Normal'],
            fontSize=8,
            leading=10
        )
        
        # Create a list to hold all elements of the PDF
        elements = []
        
        # Add title, date, and market status
        elements.append(Paragraph(f"{self.company_name} - Comprehensive Stock Analysis Report", title_style))
        elements.append(Paragraph(f"Report Date: {datetime.now().strftime('%d %B %Y')} | NSE: {self.ticker}", normal_style))
        elements.append(Spacer(1, 0.2*inch))
        
        # Company Overview Section with more details
        elements.append(Paragraph("Company Overview", heading_style))
        
        # Company information in a more detailed format
        sector = self.company_sector if self.company_sector != 'N/A' else self.metrics.get('sector', 'N/A')
        industry = self.company_industry if self.company_industry != 'N/A' else self.metrics.get('industry', 'N/A')
        
        # Create a table for company information
        company_data = [
            ["Company Details", "Market Information"],
            [f"Sector: {sector}", f"Market Cap: {self.market_cap_str}"],
            [f"Industry: {industry}", f"P/E Ratio: {self.pe_ratio if self.pe_ratio != 'N/A' else 'N/A'}"],
            [f"Employees: {self.company_employees}", f"Dividend Yield: {self.dividend_yield}"],
            [f"Website: {self.company_website}", f"52-Week Range: ₹{self.fifty_two_week_low if self.fifty_two_week_low != 'N/A' else 'N/A'} - ₹{self.fifty_two_week_high if self.fifty_two_week_high != 'N/A' else 'N/A'}"]
        ]
        
        company_table = Table(company_data, colWidths=[4*inch, 4*inch])
        company_table_style = TableStyle([
            ('BACKGROUND', (0, 0), (1, 0), colors.HexColor(0xEAECEE)),
            ('TEXTCOLOR', (0, 0), (1, 0), colors.HexColor(0x333333)),
            ('ALIGN', (0, 0), (1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (1, 0), 8),
            ('BACKGROUND', (0, 1), (1, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (1, -1), colors.HexColor(0x333333)),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),
            ('ALIGN', (1, 1), (1, -1), 'LEFT'),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (1, -1), 10),
            ('TOPPADDING', (0, 1), (1, -1), 4),
            ('BOTTOMPADDING', (0, 1), (1, -1), 4),
            ('GRID', (0, 0), (1, -1), 1, colors.HexColor(0xDDDDDD))
        ])
        company_table.setStyle(company_table_style)
        elements.append(company_table)
        elements.append(Spacer(1, 0.1*inch))
        
        # Add company description if available
        description = self.company_description
        if description:
            elements.append(Paragraph("About the Company:", subheading_style))
            
            # Format description into paragraphs if it's long
            if len(description) > 500:
                # Split into multiple paragraphs for better readability
                paragraphs = []
                remaining = description
                max_length = 500
                
                while len(remaining) > max_length:
                    # Find the last sentence end within the max_length
                    end_pos = max_length
                    while end_pos > max_length - 100 and remaining[end_pos] not in ['.', '!', '?']:
                        end_pos -= 1
                    
                    if end_pos <= max_length - 100:  # If no sentence end found, just cut at max_length
                        end_pos = max_length
                    else:
                        end_pos += 1  # Include the period
                    
                    paragraphs.append(remaining[:end_pos])
                    remaining = remaining[end_pos:].strip()
                
                if remaining:
                    paragraphs.append(remaining)
                
                for para in paragraphs:
                    elements.append(Paragraph(para, normal_style))
            else:
                elements.append(Paragraph(description, normal_style))
        
        elements.append(Spacer(1, 0.2*inch))
        
        # Key Financial Metrics Section - Enhanced with more metrics
        elements.append(Paragraph("Key Financial Metrics", heading_style))
        
        # Create a more comprehensive table for financial metrics
        data = [
            ["Valuation Metrics", "Value", "Profitability Metrics", "Value"],
            ["Total Assets", f"₹{self.metrics.get('total_assets', 'N/A')} Cr", "Revenue", f"₹{self.metrics.get('revenue', 'N/A')} Cr"],
            ["Total Liabilities", f"₹{self.metrics.get('total_liabilities', 'N/A')} Cr", "Net Income", f"₹{self.metrics.get('net_income', 'N/A')} Cr"],
            ["Debt-to-Equity", f"{self.metrics.get('debt_equity_ratio', 'N/A')}", "Profit Margin", f"{self.metrics.get('profit_margin', 'N/A')}%"],
            ["Current Ratio", f"{self.metrics.get('current_ratio', 'N/A')}", "EBITDA", f"₹{self.metrics.get('ebitda', 'N/A')} Cr"],
            ["EPS (Basic)", f"₹{self.metrics.get('eps', 'N/A')}", "Operating Cash Flow", f"₹{self.metrics.get('operating_cash_flow', 'N/A')} Cr"],
            ["P/E Ratio", f"{self.pe_ratio if self.pe_ratio != 'N/A' else 'N/A'}", "Free Cash Flow", f"₹{self.metrics.get('free_cash_flow', 'N/A')} Cr"]
        ]
        
        # Create the table
        metrics_table = Table(data, colWidths=[2*inch, 2*inch, 2*inch, 2*inch])
        
        # Add style to the table
        table_style = TableStyle([
            ('BACKGROUND', (0, 0), (1, 0), colors.HexColor(0xEAECEE)),
            ('BACKGROUND', (2, 0), (3, 0), colors.HexColor(0xEAECEE)),
            ('TEXTCOLOR', (0, 0), (3, 0), colors.HexColor(0x333333)),
            ('ALIGN', (0, 0), (3, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (3, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (3, 0), 10),
            ('BOTTOMPADDING', (0, 0), (3, 0), 8),
            ('BACKGROUND', (0, 1), (3, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (3, -1), colors.HexColor(0x333333)),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),
            ('ALIGN', (2, 1), (2, -1), 'LEFT'),
            ('ALIGN', (1, 1), (1, -1), 'RIGHT'),
            ('ALIGN', (3, 1), (3, -1), 'RIGHT'),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 1), (2, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 1), (1, -1), 'Helvetica'),
            ('FONTNAME', (3, 1), (3, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (3, -1), 10),
            ('TOPPADDING', (0, 1), (3, -1), 4),
            ('BOTTOMPADDING', (0, 1), (3, -1), 4),
            ('GRID', (0, 0), (3, -1), 1, colors.HexColor(0xDDDDDD))
        ])
        metrics_table.setStyle(table_style)
        elements.append(metrics_table)
        elements.append(Spacer(1, 0.2*inch))
        
        # Technical Analysis Section
        elements.append(Paragraph("Technical Analysis & Indicators", heading_style))
        
        # Add technical indicators in a table
        if hasattr(self, 'technical_indicators') and self.technical_indicators:
            ti = self.technical_indicators
            tech_data = [
                ["Moving Averages", "Value", "Momentum Indicators", "Value"],
                ["20-day MA", f"₹{ti.get('ma20', 'N/A'):.2f}" if ti.get('ma20') else 'N/A', 
                 "RSI (14-day)", f"{ti.get('rsi', 'N/A'):.2f}" if ti.get('rsi') else 'N/A'],
                ["50-day MA", f"₹{ti.get('ma50', 'N/A'):.2f}" if ti.get('ma50') else 'N/A', 
                 "MACD", f"{ti.get('macd', 'N/A'):.4f}" if ti.get('macd') else 'N/A'],
                ["200-day MA", f"₹{ti.get('ma200', 'N/A'):.2f}" if ti.get('ma200') else 'N/A', 
                 "MACD Signal", f"{ti.get('macd_signal', 'N/A'):.4f}" if ti.get('macd_signal') else 'N/A'],
                ["Bollinger Middle", f"₹{ti.get('bollinger_sma', 'N/A'):.2f}" if ti.get('bollinger_sma') else 'N/A',
                 "MACD Histogram", f"{ti.get('macd_histogram', 'N/A'):.4f}" if ti.get('macd_histogram') else 'N/A'],
                ["Bollinger Upper", f"₹{ti.get('bollinger_upper', 'N/A'):.2f}" if ti.get('bollinger_upper') else 'N/A',
                 "MACD Trend", f"{ti.get('macd_trend', 'N/A')}" if ti.get('macd_trend') else 'N/A'],
                ["Bollinger Lower", f"₹{ti.get('bollinger_lower', 'N/A'):.2f}" if ti.get('bollinger_lower') else 'N/A',
                 "Bollinger Position", f"{ti.get('bollinger_position', 'N/A')}" if ti.get('bollinger_position') else 'N/A']
            ]
            
            # Add special note if golden/death cross detected
            if ti.get('recent_golden_cross'):
                tech_data.append(["Moving Average Cross", f"Golden Cross detected on {ti.get('cross_date')}", "", ""])
            elif ti.get('recent_death_cross'):
                tech_data.append(["Moving Average Cross", f"Death Cross detected on {ti.get('cross_date')}", "", ""])
                
            # Create the table
            tech_table = Table(tech_data, colWidths=[2*inch, 2*inch, 2*inch, 2*inch])
            tech_table.setStyle(table_style)  # Reuse the same style
            elements.append(tech_table)
        
        elements.append(Spacer(1, 0.2*inch))
        
        # Charts Section - First set
        elements.append(Paragraph("Price and Volume Analysis", heading_style))
        price_trend_img = self.plot_price_trend()
        volume_img = self.plot_volume_analysis()
        
        img1 = Image(price_trend_img, width=4*inch, height=2.4*inch)
        img2 = Image(volume_img, width=4*inch, height=2.4*inch)
        chart_table1 = Table([[img1, img2]], colWidths=[4.2*inch, 4.2*inch])
        chart_table1.setStyle(TableStyle([
            ('ALIGN', (0, 0), (1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (1, 0), 'MIDDLE'),
        ]))
        elements.append(chart_table1)
        elements.append(Spacer(1, 0.2*inch))
        
        # Charts Section - Second set
        elements.append(Paragraph("Financial Metrics and Price Action", heading_style))
        financial_metrics_img = self.plot_financial_metrics()
        candlestick_img = self.plot_candlestick_chart()
        
        img3 = Image(financial_metrics_img, width=4*inch, height=2.4*inch)
        img4 = Image(candlestick_img, width=4*inch, height=2.4*inch)
        chart_table2 = Table([[img3, img4]], colWidths=[4.2*inch, 4.2*inch])
        chart_table2.setStyle(TableStyle([
            ('ALIGN', (0, 0), (1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (1, 0), 'MIDDLE'),
        ]))
        elements.append(chart_table2)
        elements.append(Spacer(1, 0.2*inch))
        
        # Market Comparison Chart
        elements.append(Paragraph("Market Performance Comparison", heading_style))
        comparison_img = self.plot_performance_comparison()
        img5 = Image(comparison_img, width=8*inch, height=3*inch)
        elements.append(img5)
        elements.append(Spacer(1, 0.2*inch))
        
        # Historical Performance (if data available)
        elements.append(Paragraph("Long-term Historical Performance", heading_style))
        historical_img = self.plot_historical_performance()
        img6 = Image(historical_img, width=8*inch, height=3*inch)
        elements.append(img6)
        elements.append(Spacer(1, 0.2*inch))
        
        # Technical Indicators Chart
        elements.append(Paragraph("Technical Indicators Analysis", heading_style))
        technical_img = self.plot_technical_indicators()
        img7 = Image(technical_img, width=8*inch, height=5*inch)
        elements.append(img7)
        elements.append(Spacer(1, 0.2*inch))
        
        # Recent News Section - Enhanced
        elements.append(Paragraph("Recent News & Market Sentiment", heading_style))
        news_text = self.news_text.replace("Recent News:", "").strip()
        elements.append(Paragraph(news_text, normal_style))
        elements.append(Spacer(1, 0.2*inch))
        
        # Trading Summary from monthly info
        elements.append(Paragraph("Recent Trading Activity", heading_style))
        monthly_summary = self.monthly_info_text.split("RECENT TRADING DATA")[0].strip()
        elements.append(Paragraph(monthly_summary, normal_style))
        
        # Add OHLC data for last 5 days in a table
        try:
            ohlc_text = self.monthly_info_text.split("RECENT TRADING DATA")[1].split("TECHNICAL INDICATORS")[0]
            ohlc_days = ohlc_text.strip().split("- ")
            
            # Create table headers
            ohlc_data = [["Date", "Open", "High", "Low", "Close", "Change", "Volume"]]
            
            # Parse and add each day's data
            for day in ohlc_days:
                if day.strip():
                    lines = day.strip().split("\n")
                    date = lines[0].replace(":", "")
                    
                    # Extract values using regex for better reliability
                    open_val = re.search(r"Open: ₹([\d\.]+)", "\n".join(lines))
                    high_val = re.search(r"High: ₹([\d\.]+)", "\n".join(lines))
                    low_val = re.search(r"Low: ₹([\d\.]+)", "\n".join(lines))
                    close_match = re.search(r"Close: ₹([\d\.]+) ([▲▼]) ([\d\.]+)%", "\n".join(lines))
                    volume_match = re.search(r"Volume: ([\d,]+)", "\n".join(lines))
                    
                    if open_val and high_val and low_val and close_match and volume_match:
                        close_val = close_match.group(1)
                        change_symbol = close_match.group(2)
                        change_pct = close_match.group(3)
                        change_text = f"{change_symbol} {change_pct}%"
                        
                        ohlc_data.append([
                            date,
                            f"₹{open_val.group(1)}",
                            f"₹{high_val.group(1)}",
                            f"₹{low_val.group(1)}",
                            f"₹{close_val}",
                            change_text,
                            volume_match.group(1)
                        ])
            
            if len(ohlc_data) > 1:  # Only create table if we have data
                ohlc_table = Table(ohlc_data, colWidths=[1.2*inch, 1.1*inch, 1.1*inch, 1.1*inch, 1.1*inch, 1.1*inch, 1.3*inch])
                
                # Style the table
                ohlc_style = TableStyle([
                    ('BACKGROUND', (0, 0), (6, 0), colors.HexColor(0xEAECEE)),
                    ('TEXTCOLOR', (0, 0), (6, 0), colors.HexColor(0x333333)),
                    ('ALIGN', (0, 0), (6, 0), 'CENTER'),
                    ('FONTNAME', (0, 0), (6, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (6, 0), 10),
                    ('BOTTOMPADDING', (0, 0), (6, 0), 8),
                    ('BACKGROUND', (0, 1), (6, -1), colors.white),
                    ('TEXTCOLOR', (0, 1), (6, -1), colors.HexColor(0x333333)),
                    ('ALIGN', (0, 1), (6, -1), 'CENTER'),
                    ('FONTNAME', (0, 1), (6, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 1), (6, -1), 9),
                    ('TOPPADDING', (0, 1), (6, -1), 4),
                    ('BOTTOMPADDING', (0, 1), (6, -1), 4),
                    ('GRID', (0, 0), (6, -1), 1, colors.HexColor(0xDDDDDD))
                ])
                
                # Add special styling for up/down days
                for i in range(1, len(ohlc_data)):
                    change_text = ohlc_data[i][5]
                    if "▲" in change_text:
                        ohlc_style.add('TEXTCOLOR', (5, i), (5, i), colors.HexColor(0x2ECC71))  # Green for up
                    elif "▼" in change_text:
                        ohlc_style.add('TEXTCOLOR', (5, i), (5, i), colors.HexColor(0xE74C3C))  # Red for down
                
                ohlc_table.setStyle(ohlc_style)
                elements.append(Spacer(1, 0.1*inch))
                elements.append(ohlc_table)
        except:
            pass  # Skip if we can't parse the OHLC data
        
        elements.append(Spacer(1, 0.2*inch))
        
        # Add disclaimer and notes section
        elements.append(Paragraph("Investment Notes & Disclaimer", subheading_style))
        disclaimer = """
        INVESTMENT NOTES:
        - Past performance is not indicative of future results
        - Technical indicators should be used in conjunction with fundamental analysis
        - Multiple time frames should be analyzed for a complete picture
        - Position sizing and risk management are critical to investment success
        
        DISCLAIMER: This report is for informational purposes only and should not be considered as financial advice. 
        The data presented has been gathered from sources believed to be reliable, but its accuracy cannot be guaranteed. 
        Always conduct your own research or consult with a licensed financial advisor before making investment decisions.
        """
        elements.append(Paragraph(disclaimer, small_style))
        
        # Build the PDF
        doc.build(elements)
        
        return report_filename

def generate_stock_report(ticker):
    """Main function to generate a stock report"""
    try:
        report = StockReport(ticker)
        pdf_file = report.generate_pdf_report()
        return pdf_file
    except Exception as e:
        print(f"Error generating report: {str(e)}")
        return None

if __name__ == "__main__":
    # Test with a sample stock
    ticker = "AAPL.NS"
    report_file = generate_stock_report(ticker)
    print(f"Report generated: {report_file}") 