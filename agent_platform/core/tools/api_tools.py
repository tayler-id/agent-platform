from smolagents.tools import tool
import requests
import json
from typing import Dict, Any
from datetime import datetime

@tool
def realtime_weather(location: str) -> Dict[str, Any]:
    """Get realtime weather data for a specific location using OpenWeatherMap API.
    
    Args:
        location: The city name or coordinates (latitude,longitude)
    
    Returns:
        Dictionary containing weather data including temperature, conditions, etc.
    """
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        return {"error": "OpenWeatherMap API key not configured"}
    
    url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}&units=metric"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return {
            "temperature": data["main"]["temp"],
            "conditions": data["weather"][0]["description"],
            "humidity": data["main"]["humidity"],
            "wind_speed": data["wind"]["speed"],
            "timestamp": datetime.now().isoformat()
        }
    return {"error": f"Failed to fetch weather data: {response.status_code}"}

@tool
def realtime_stock_price(symbol: str) -> Dict[str, Any]:
    """Get realtime stock price data using Alpha Vantage API.
    
    Args:
        symbol: The stock ticker symbol (e.g. AAPL)
    
    Returns:
        Dictionary containing stock price data including price, volume, etc.
    """
    api_key = os.getenv("ALPHA_VANTAGE_API_KEY")
    if not api_key:
        return {"error": "Alpha Vantage API key not configured"}
    
    url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={api_key}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        if "Global Quote" in data:
            return {
                "symbol": symbol,
                "price": data["Global Quote"]["05. price"],
                "volume": data["Global Quote"]["06. volume"],
                "timestamp": datetime.now().isoformat()
            }
    return {"error": f"Failed to fetch stock data: {response.status_code}"}

@tool
def realtime_news(query: str) -> Dict[str, Any]:
    """Get realtime news articles using NewsAPI.
    
    Args:
        query: Search query for news articles
    
    Returns:
        Dictionary containing news articles with titles, descriptions, etc.
    """
    api_key = os.getenv("NEWS_API_KEY")
    if not api_key:
        return {"error": "NewsAPI key not configured"}
    
    url = f"https://newsapi.org/v2/everything?q={query}&apiKey={api_key}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return {
            "articles": [
                {
                    "title": article["title"],
                    "description": article["description"],
                    "url": article["url"],
                    "published_at": article["publishedAt"]
                } for article in data["articles"][:5]  # Return top 5 articles
            ],
            "timestamp": datetime.now().isoformat()
        }
    return {"error": f"Failed to fetch news: {response.status_code}"}
