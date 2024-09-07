import requests
from bs4 import BeautifulSoup
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
import time
from concurrent.futures import ThreadPoolExecutor
import logging
import random
from fake_useragent import UserAgent

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Download necessary NLTK data
nltk.download('vader_lexicon', quiet=True)

# List of crypto news sources
CRYPTO_NEWS_SOURCES = [
    "https://cointelegraph.com/",
    "https://www.coindesk.com/",
    "https://cryptonews.com/",
    "https://decrypt.co/",
    "https://www.theblockcrypto.com/"
]

def fetch_articles(url):
    headers = {'User-Agent': UserAgent().random}
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        logging.error(f"Error fetching {url}: {e}")
        return None

def extract_articles(content, topic, source_url):
    articles = []
    if isinstance(content, str):
        soup = BeautifulSoup(content, 'html.parser')
    else:
        soup = content
    if soup:
        for article in soup.find_all('article'):
            title = article.find('h2')
            description = article.find(['p', 'summary', 'description'])
            if title and topic.lower() in title.text.lower():
                article_content = title.text
                if description:
                    article_content += " " + description.text
                articles.append((article_content, source_url))
    return articles[:10]  # Limit to 10 articles

def analyze_sentiment(text):
    sia = SentimentIntensityAnalyzer()
    return sia.polarity_scores(text)

def analyze_crypto_sentiment(topic):
    all_articles = []
    
    with ThreadPoolExecutor(max_workers=len(CRYPTO_NEWS_SOURCES)) as executor:
        results = executor.map(lambda url: (fetch_articles(url), url), CRYPTO_NEWS_SOURCES)
        
    for soup, source_url in results:
        all_articles.extend(extract_articles(soup, topic, source_url))
    
    if not all_articles:
        return "No related articles found for the topic."
    
    sentiments = [analyze_sentiment(article[0]) for article in all_articles]
    
    # Print individual article sentiments
    print("\nLatest news and their sentiments:")
    for i, ((article, source), sentiment) in enumerate(zip(all_articles, sentiments), 1):
        print(f"{i}. Source: {source}")
        print(f"   {article}")
        print(f"   Sentiment: {get_sentiment_label(sentiment['compound'])} (score: {sentiment['compound']:.2f})")
        print()  # Add a blank line between articles for better readability
    
    # Calculate average sentiment excluding neutral (0) scores
    non_zero_sentiments = [s['compound'] for s in sentiments if s['compound'] != 0]
    if non_zero_sentiments:
        avg_sentiment = sum(non_zero_sentiments) / len(non_zero_sentiments)
        sentiment = get_sentiment_label(avg_sentiment)
        return f"\nAverage sentiment analysis for '{topic}' (excluding neutral): {sentiment} (score: {avg_sentiment:.2f})"
    else:
        return f"\nNo non-neutral sentiments found for '{topic}'."

def get_sentiment_label(score):
    if score > 0.05:
        return "positive"
    elif score < -0.05:
        return "negative"
    else:
        return "neutral"

def real_time_crypto_sentiment_analysis():
    print("Welcome to real-time cryptocurrency news sentiment analysis.")
    print("Enter 'exit' to terminate the program.")
    
    while True:
        topic = input("\nEnter a cryptocurrency-related topic: ")
        if topic.lower() == 'exit':
            break
        
        print("Analyzing sentiment... Please wait.")
        result = analyze_crypto_sentiment(topic)
        print(result)

if __name__ == "__main__":
    real_time_crypto_sentiment_analysis()
