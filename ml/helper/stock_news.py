import requests
from bs4 import BeautifulSoup
import re

# Scrap top 5 google news for given company name
# Helper function to get google news url
def google_query(search_term):
    if "news" not in search_term:
        search_term = search_term + " stock news"
    
    # Modified URL to access Google News tab directly
    url = f"https://www.google.com/search?q={search_term}&tbm=nws&cr=countryIN"
    url = re.sub(r"\s", "+", url)
    return url

# Get recent stock news from google news
def get_recent_stock_news(company_name):
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36'}

    g_query=google_query(company_name)
    res=requests.get(g_query,headers=headers).text
    soup=BeautifulSoup(res,"html.parser")
    news=[]
    for n in soup.find_all("div","n0jPhd ynAwRc tNxQIb nDgy9d"):
        news.append(n.text)
    for n in soup.find_all("div","n0jPhd ynAwRc MBeuO nDgy9d"):
        news.append(n.text)
    for n in soup.find_all("div","IJl0Z"):
        news.append(n.text)


    if len(news)>6:
        news=news[:5]
    else:
        news=news
    news_string=""
    for i,n in enumerate(news):
        news_string+=f"{i+1}. {n}\n"
    top5_news="Recent News:\n\n"+news_string
    
    return top5_news