# SmartChat

## Deployed Demo

Listening on `0xd9372631853723186F8d4FA192f79331eE7b61bD`

## Description

SmartChat is an all-in-one project that keeps crypto enthusiasts informed with real-time market data, sentiment analysis, and convenient swap functionality. It consists of three main components:

1. Base-Frame:
A frame that enables users to easily swap between USDC, BTC, and ETH, using:
    - Frames.js and OpenFrames for a dynamic user interface.
    - Enso Finance API for seamless token swapping.

2. Chat-Bot:
An XMTP-powered bot that provides real-time updates to users who subscribe. The bot delivers:
    - Current prices of Bitcoin (BTC) and Ethereum (ETH) via the CoinGecko API.
    - Real-time USDC yield on Aave using the Aave API.
    - Sentiment analysis based on the top 10 crypto news articles, with real-time sentiment scores powered by Python.

3. Sentiment-Analysis:
A Python module responsible for analyzing the sentiment of the latest crypto news. It includes:
    - Fetching crypto news from multiple reputable sources.
    - Performing sentiment analysis on the news using Natural Language Processing (NLP) techniques.
    - Providing a summary sentiment score that reflects the current mood of the crypto market.

## Features

1. Real-Time Crypto Data:
    - Live updates on BTC and ETH prices.
    - Up-to-date USDC yield on Aave.

2. Sentiment Analysis:
    - Analyzes and summarizes the sentiment from the latest 10 major crypto news articles.
    - Helps users gauge the overall sentiment of the crypto market, whether it's positive, neutral, or negative.

3. Convenient Swaps:
    - Swap functionality for USDC, BTC, and ETH directly through the Base-Frame interface.

## How to Use

1. Subscribe to the Chat-Bot:
    - Sign up to receive regular updates on crypto prices, USDC yields, and market sentiment directly to your inbox.

2. Monitor the Market:
    - Stay informed with live price feeds and sentiment updates for informed decision-making.

3. Use the Swap Feature:
    - Quickly swap USDC, BTC, or ETH within the Base-Frame for fast and efficient trading.

## Technologies Used

1. XMTP: Messaging protocol for real-time communication between users and the chatbot.
2. CoinGecko API: Provides live crypto pricing data.
3. Aave API: Fetches yield rates for USDC.
4. Frames.js & OpenFrames: Builds the swap interface for USDC, BTC, and ETH.
5. Python (Sentiment Analysis): Processes and analyzes crypto news using NLP for sentiment scoring.

## Future Enhancements

1. Expand the range of supported tokens for swapping.
2. Introduce user-specific alerts based on price thresholds or sentiment changes.
3. Incorporate more advanced AI-based insights into the crypto market.