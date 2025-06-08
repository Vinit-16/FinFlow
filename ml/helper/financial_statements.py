import yfinance as yf

# Fetch financial statements from Yahoo Finance
def get_financial_statements(ticker):
    """
    Retrieves and formats comprehensive financial statements for a given stock ticker.
    Returns well-structured data with key financial metrics highlighted for LLM analysis.
    """
    if "." in ticker:
        ticker = ticker.split(".")[0]
    ticker = ticker + ".NS"
    
    company = yf.Ticker(ticker)
    
    # Get company information
    try:
        company_info = company.info
        company_name = company_info.get('longName', company_info.get('shortName', ticker))
        sector = company_info.get('sector', 'N/A')
        industry = company_info.get('industry', 'N/A')
        summary = company_info.get('longBusinessSummary', '')
    except:
        company_name = ticker
        sector = industry = 'N/A'
        summary = ''
    
    # Get financial statements
    balance_sheet = company.balance_sheet
    income_stmt = company.income_stmt
    cash_flow = company.cashflow
    
    # Format balance sheet (keep up to 3 years of data)
    if balance_sheet.shape[1] >= 3:
        balance_sheet = balance_sheet.iloc[:, :3]
    balance_sheet = balance_sheet.dropna(how="any")
    
    # Start building the formatted output
    output = f"FINANCIAL STATEMENTS ANALYSIS FOR {company_name} ({ticker})\n"
    output += f"Sector: {sector} | Industry: {industry}\n"
    output += "=" * 80 + "\n\n"
    
    # Add brief company description if available
    if summary:
        # Truncate to ~150 words
        if len(summary) > 1000:
            summary = summary[:1000] + "..."
        output += f"COMPANY OVERVIEW:\n{summary}\n\n"
    
    # Add key financial metrics section with improved formatting
    output += "KEY FINANCIAL METRICS AND RATIOS:\n"
    output += "-" * 40 + "\n"
    
    # Extract key metrics from balance sheet
    try:
        # ASSETS AND LIABILITIES
        if 'Total Assets' in balance_sheet.index:
            total_assets = balance_sheet.loc['Total Assets']
            output += f"Total Assets (Latest): ₹{total_assets.iloc[0]/10000000:.2f} Cr"
            
            if len(total_assets) >= 2:
                yoy_asset_growth = ((total_assets.iloc[0] / total_assets.iloc[1]) - 1) * 100
                output += f" | YoY Growth: {yoy_asset_growth:.2f}%\n"
            else:
                output += "\n"
        
        if 'Total Liabilities Net Minority Interest' in balance_sheet.index:
            total_liabilities = balance_sheet.loc['Total Liabilities Net Minority Interest']
            output += f"Total Liabilities (Latest): ₹{total_liabilities.iloc[0]/10000000:.2f} Cr\n"
        
        # EQUITY AND DEBT
        if 'Total Stockholder Equity' in balance_sheet.index:
            equity = balance_sheet.loc['Total Stockholder Equity'].iloc[0]
            output += f"Shareholder Equity: ₹{equity/10000000:.2f} Cr"
            
            if 'Total Liabilities Net Minority Interest' in balance_sheet.index:
                total_liabilities = balance_sheet.loc['Total Liabilities Net Minority Interest'].iloc[0]
                debt_equity_ratio = total_liabilities / equity
                output += f" | Debt-to-Equity: {debt_equity_ratio:.2f}\n"
            else:
                output += "\n"
                
        # Add more balance sheet ratios
        if 'Total Assets' in balance_sheet.index and 'Total Stockholder Equity' in balance_sheet.index:
            equity_ratio = balance_sheet.loc['Total Stockholder Equity'].iloc[0] / balance_sheet.loc['Total Assets'].iloc[0]
            output += f"Equity Ratio: {equity_ratio:.2f} ({(equity_ratio*100):.1f}% assets financed by equity)\n"
            
        if 'Current Assets' in balance_sheet.index and 'Current Liabilities' in balance_sheet.index:
            current_ratio = balance_sheet.loc['Current Assets'].iloc[0] / balance_sheet.loc['Current Liabilities'].iloc[0]
            output += f"Current Ratio: {current_ratio:.2f}"
            
            if current_ratio > 2:
                output += " (Strong liquidity)\n"
            elif current_ratio > 1:
                output += " (Adequate liquidity)\n"
            else:
                output += " (Potential liquidity concerns)\n"
    except Exception as e:
        output += f"Error extracting balance sheet metrics: {str(e)}\n"
    
    # Add income statement metrics if available
    output += "\nPROFITABILITY METRICS:\n"
    output += "-" * 40 + "\n"
    
    try:
        if not income_stmt.empty:
            # REVENUE AND INCOME
            if 'Total Revenue' in income_stmt.index:
                revenue = income_stmt.loc['Total Revenue'].iloc[0]
                output += f"Revenue (Latest): ₹{revenue/10000000:.2f} Cr"
                
                if len(income_stmt.loc['Total Revenue']) >= 2:
                    prev_revenue = income_stmt.loc['Total Revenue'].iloc[1]
                    rev_growth = ((revenue / prev_revenue) - 1) * 100
                    output += f" | YoY Growth: {rev_growth:.2f}%\n"
                else:
                    output += "\n"
            
            if 'Net Income' in income_stmt.index:
                net_income = income_stmt.loc['Net Income'].iloc[0]
                output += f"Net Income: ₹{net_income/10000000:.2f} Cr"
                
                if 'Total Revenue' in income_stmt.index:
                    revenue = income_stmt.loc['Total Revenue'].iloc[0]
                    profit_margin = (net_income / revenue) * 100
                    output += f" | Profit Margin: {profit_margin:.2f}%\n"
                else:
                    output += "\n"
                    
            # EPS and P/E RATIO
            if 'Basic EPS' in income_stmt.index:
                eps = income_stmt.loc['Basic EPS'].iloc[0]
                output += f"EPS (Basic): ₹{eps:.2f}"
                
                try:
                    # Try to get current stock price
                    current_price = company.info.get('currentPrice', company.history(period="1d")['Close'].iloc[-1])
                    pe_ratio = current_price / eps
                    output += f" | P/E Ratio: {pe_ratio:.2f}\n"
                except:
                    output += "\n"
            
            # EBITDA and MARGINS
            if 'EBITDA' in income_stmt.index:
                ebitda = income_stmt.loc['EBITDA'].iloc[0]
                output += f"EBITDA: ₹{ebitda/10000000:.2f} Cr"
                
                if 'Total Revenue' in income_stmt.index:
                    ebitda_margin = (ebitda / income_stmt.loc['Total Revenue'].iloc[0]) * 100
                    output += f" | EBITDA Margin: {ebitda_margin:.2f}%\n"
                else:
                    output += "\n"
    except Exception as e:
        output += f"Error extracting income statement metrics: {str(e)}\n"
    
    # Add cash flow metrics
    output += "\nCASH FLOW METRICS:\n"
    output += "-" * 40 + "\n"
    
    try:
        if not cash_flow.empty:
            # OPERATING CASH FLOW
            if 'Operating Cash Flow' in cash_flow.index:
                ocf = cash_flow.loc['Operating Cash Flow'].iloc[0]
                output += f"Operating Cash Flow: ₹{ocf/10000000:.2f} Cr\n"
            
            # FREE CASH FLOW
            if 'Free Cash Flow' in cash_flow.index:
                fcf = cash_flow.loc['Free Cash Flow'].iloc[0]
                output += f"Free Cash Flow: ₹{fcf/10000000:.2f} Cr"
                
                if 'Net Income From Continuing Operations' in cash_flow.index:
                    fcf_to_income = (fcf / cash_flow.loc['Net Income From Continuing Operations'].iloc[0]) * 100
                    output += f" | FCF to Net Income: {fcf_to_income:.2f}%\n"
                else:
                    output += "\n"
            
            # CAPEX
            if 'Capital Expenditure Reported' in cash_flow.index:
                capex = cash_flow.loc['Capital Expenditure Reported'].iloc[0]
                output += f"Capital Expenditure: ₹{abs(capex)/10000000:.2f} Cr\n"
    except Exception as e:
        output += f"Error extracting cash flow metrics: {str(e)}\n"
    
    # Add the raw balance sheet data
    output += "\nBALANCE SHEET (Last 3 Years):\n"
    output += "-" * 40 + "\n"
    output += balance_sheet.to_string() + "\n\n"
    
    # Add raw income statement data (last 3 years)
    try:
        if not income_stmt.empty:
            if income_stmt.shape[1] >= 3:
                income_stmt = income_stmt.iloc[:, :3]
            income_stmt = income_stmt.dropna(how="any")
            output += "INCOME STATEMENT (Last 3 Years):\n"
            output += "-" * 40 + "\n"
            output += income_stmt.to_string() + "\n\n"
    except Exception as e:
        output += f"Error processing income statement: {str(e)}\n\n"
    
    # Add raw cash flow data (last 3 years)
    try:
        if not cash_flow.empty:
            if cash_flow.shape[1] >= 3:
                cash_flow = cash_flow.iloc[:, :3]
            cash_flow = cash_flow.dropna(how="any")
            output += "CASH FLOW STATEMENT (Last 3 Years):\n"
            output += "-" * 40 + "\n"
            output += cash_flow.to_string() + "\n\n"
    except Exception as e:
        output += f"Error processing cash flow statement: {str(e)}\n\n"
    
    # Add financial health summary
    output += "FINANCIAL HEALTH SUMMARY:\n"
    output += "-" * 40 + "\n"
    
    try:
        # Calculate financial health assessment
        health_indicators = []
        
        # Equity position
        if 'Total Stockholder Equity' in balance_sheet.index and 'Total Assets' in balance_sheet.index:
            equity_ratio = balance_sheet.loc['Total Stockholder Equity'].iloc[0] / balance_sheet.loc['Total Assets'].iloc[0]
            if equity_ratio > 0.5:
                health_indicators.append("Strong equity position (>50% assets financed by equity)")
            elif equity_ratio > 0.3:
                health_indicators.append("Moderate equity position (30-50% assets financed by equity)")
            else:
                health_indicators.append("Lower equity position (<30% assets financed by equity)")
        
        # Liquidity
        if 'Current Assets' in balance_sheet.index and 'Current Liabilities' in balance_sheet.index:
            current_ratio = balance_sheet.loc['Current Assets'].iloc[0] / balance_sheet.loc['Current Liabilities'].iloc[0]
            if current_ratio > 2:
                health_indicators.append("Strong short-term liquidity (current ratio >2)")
            elif current_ratio > 1:
                health_indicators.append("Adequate short-term liquidity (current ratio >1)")
            else:
                health_indicators.append("Potential short-term liquidity concerns (current ratio <1)")
        
        # Profitability
        if not income_stmt.empty and 'Net Income' in income_stmt.index and 'Total Revenue' in income_stmt.index:
            profit_margin = (income_stmt.loc['Net Income'].iloc[0] / income_stmt.loc['Total Revenue'].iloc[0]) * 100
            if profit_margin > 15:
                health_indicators.append(f"Excellent profitability (profit margin {profit_margin:.1f}%)")
            elif profit_margin > 8:
                health_indicators.append(f"Good profitability (profit margin {profit_margin:.1f}%)")
            elif profit_margin > 3:
                health_indicators.append(f"Moderate profitability (profit margin {profit_margin:.1f}%)")
            else:
                health_indicators.append(f"Lower profitability (profit margin {profit_margin:.1f}%)")
        
        # Cash flow health
        if not cash_flow.empty and 'Free Cash Flow' in cash_flow.index and 'Net Income From Continuing Operations' in cash_flow.index:
            fcf_ratio = cash_flow.loc['Free Cash Flow'].iloc[0] / cash_flow.loc['Net Income From Continuing Operations'].iloc[0]
            if fcf_ratio > 1:
                health_indicators.append(f"Strong cash generation (FCF/Net Income ratio {fcf_ratio:.1f})")
            elif fcf_ratio > 0.5:
                health_indicators.append(f"Adequate cash generation (FCF/Net Income ratio {fcf_ratio:.1f})")
            else:
                health_indicators.append(f"Weak cash generation relative to earnings (FCF/Net Income ratio {fcf_ratio:.1f})")
        
        # Output health indicators
        for i, indicator in enumerate(health_indicators):
            output += f"{i+1}. {indicator}\n"
            
        if not health_indicators:
            output += "Insufficient data to provide detailed financial health assessment.\n"
            
    except Exception as e:
        output += f"Error calculating financial health indicators: {str(e)}\n"
    
    return output
