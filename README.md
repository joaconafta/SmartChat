# SmartChat

## Description
SmartChat is a comprehensive project consisting of three main components:

1. Base-Frame: This is a Frame that allows users to swap USDC, BTC, and ETH. (framesjs openframes and enso finance api)

2. Chat-Bot: An XMTP bot that users can subscribe to for receiving real-time updates (messagekit one-to-one template). It provides:
   - Current prices of BTC and ETH (coingecko api)
   - Current yield of USDC on Aave (aave api)
   - A sentiment analysis of the crypto world based on the 10 most important recent news articles (sentiment analysis python script)

3. Sentiment-Analysis: A Python module responsible for:
   - Fetching the latest crypto news from various sources
   - Performing sentiment analysis on the collected news
   - Providing a summarized sentiment score for the current state of the crypto market

Together, these components create a powerful tool for crypto enthusiasts to stay informed about market prices, yields, and overall market sentiment, all while offering convenient swap functionality.