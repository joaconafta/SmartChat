import cron from "node-cron";
import { Client } from "@xmtp/xmtp-js";
import { RedisClientType } from "@redis/client";

export async function startCron(redisClient: RedisClientType, v2client: Client) {
  console.log("Starting daily cron");
  const conversations = await v2client.conversations.list();
  cron.schedule(
    "0 * * * *", // Every 1 hour
    async () => {
      const keys = await redisClient.keys("*");
      const { btcPrice, ethPrice } = await getCryptoPrices();
      // TODO: get aave and uniswap yields
      const aaveUsdcAPY = await getAaveYield();
      // const uniswapYield = await getUniswapYield();

      

      console.log(`Running daily task. ${keys.length} subscribers.`);
      for (const address of keys) {
        const subscriptionStatus = await redisClient.get(address);
        if (subscriptionStatus === "subscribed") {
          console.log(`Sending daily update to ${address}`);
          // Logic to send daily updates to each subscriber
          try {
          const targetConversation = conversations.find(
            (conv) => conv.peerAddress === address,
          );
          if (targetConversation)
            await targetConversation.send(`Here is your daily update! \nBTC: ${btcPrice} \nETH: ${ethPrice} \nUSDC APY (Aave): ${aaveUsdcAPY}`);
            await targetConversation.send(`https://smart-chat-three.vercel.app/`);
          } catch (error) {
            console.error(`Failed to send daily update to ${address}:`, error);
          }
        }
      }
    },
    {
      scheduled: true,
      timezone: "UTC",
    },
  );
}

async function getCryptoPrices(): Promise<{ btcPrice: number, ethPrice: number }> {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
    const data = await response.json() as { bitcoin: { usd: number }, ethereum: { usd: number } };
    return {
      btcPrice: data.bitcoin.usd,
      ethPrice: data.ethereum.usd
    };
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return {
      btcPrice: 0,
      ethPrice: 0
    };
  }
}
async function getAaveYield(): Promise<number> {
  try {
    const response = await fetch('https://aave-api-v2.aave.com/data/rates-history?reserveId=0x833589fcd6edb6e08f4c7c32d4f71b54bda029130xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D8453&from=1722795141&resolutionInHours=6');
    const data = await response.json() as Array<{ liquidityRate_avg: number }>;
    if (data && data.length > 0) {
      // Assuming the most recent data point is at the end of the array
      const latestDataPoint = data[data.length - 1];
      // The liquidityRate_avg is typically expressed as a decimal, so we multiply by 100 to get percentage
      return Number((latestDataPoint.liquidityRate_avg * 100).toFixed(2));
    } else {
      console.error('No data returned from Aave API');
      return 0;
    }
  } catch (error) {
    console.error('Error fetching Aave yield:', error);
    return 0;
  }
}
