import os
from bs4 import BeautifulSoup
import warnings
import yfinance as yf
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

warnings.filterwarnings("ignore")

from helper.stock_price_5days import get_stock_price
from helper.stock_news import get_recent_stock_news
from helper.financial_statements import get_financial_statements
from helper.stock_info_for_month import get_stock_info_for_month

    
def stock_analysis(ticker):
    financial_statements = get_financial_statements(ticker)
    news = get_recent_stock_news(ticker)
    stock_price_5days = get_stock_price(ticker)
    stock_info_for_month = get_stock_info_for_month(ticker)

    return financial_statements, news, stock_price_5days, stock_info_for_month



def generate_response_from_stock_info(ticker):
    financial_statements, news, stock_price_5days, stock_info_for_month= stock_analysis(ticker)
    prompt = """
    This is information about the stock {ticker} - 
        Stock open,close and volume for last 5 days:{stock_price_5days}
        Stock News:{news}
        Financial Statements:{financial_statements}
        Stock information for the last month:{stock_info_for_month}
        Using this information, you can make an informed decision about investing in this stock.
        Talk about the stock's financial statements, news and stock data and other factors that you think are important.
        Recommend me whether to invest in this stock or not at this point.
        Tell us how you came to this decision using what data points.
        Explain your result with supporting data.
        Keep your answer simple to understand for the end user.
        Give a rating out of 10 for the stock.
        Give Overview, Financial Performance, Market Position, News and Events, Verdict, Rating, Recommendation. In this format.Give only imprortant points for each section.
        Dont give very long analysis. Talk about each of the above section in 4-5 lines each.
        ANSWER IN MARKDOWN FORMAT STRICTLY.
    """


    llm = ChatOpenAI(api_key=os.getenv("OPENAI_API_KEY"),temperature=0)

    # Build the full prompt with the transcript text
    actual_prompt = ChatPromptTemplate.from_messages([
        ("system", prompt),
        ("human", "{input}")
    ])

    chain = actual_prompt | llm
    response = chain.invoke({"input": "Give me a proper analysis on whether to invest in this stock or not and a little on how is it performing in the market backed by some data. DONOT give me veryy long analysis.Give ans in markdown format", "ticker": ticker, "financial_statements": financial_statements, "news": news, "stock_price_5days": stock_price_5days, "stock_info_for_month": stock_info_for_month})
    with open("stock_analysis.md", "w",encoding="utf-8") as f:
        f.write(response.content)
    # Return the notes content
    return response.content


# ans = generate_response_from_stock_info("RVNL.NS")
# print(ans)

