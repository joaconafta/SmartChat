import { Button } from "frames.js/next";
import { frames } from "@/app/transaction/frames";
import { publicClient } from "@/lib/transactions";
import { appURL } from "@/lib/utils";

const handler = frames(async (ctx) => {

  if (!ctx?.message?.isValid) {
    console.log("Invalid Frame");
  }

  const transactionId =
    ctx.message?.transactionId || ctx.url.searchParams.get("tx");

  // No transaction ID provided
  if (!transactionId) {
    return {
      image: (
        <div tw="relative flex flex-col text-center items-center justify-center">
          <img src={`${appURL()}/images/frames/bg.png`} tw="w-full" />
          <div tw="absolute text-white text-2xl font-bold">
            No transaction ID provided
          </div>
        </div>
      ),
      buttons: [
        <Button action="post" key="1" target="/">
          Home
        </Button>,
      ],
    };
  }
  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  let transactionReceipt: any = null;
  try {
    transactionReceipt = await publicClient.getTransactionReceipt({
      hash: transactionId as `0x${string}`,
    });
    console.log(transactionReceipt);
  } catch (e) {
    
    console.error(e);
  }
  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  if (!transactionReceipt) {
    // Transaction pending
    return {
      image: (
        <div tw="relative flex flex-col text-center items-center justify-center">
          <img src={`${appURL()}/images/frames/bg.png`} tw="w-full" />
          <div tw="absolute text-white text-2xl font-bold">
            Transaction Pending
          </div>
        </div>
      ),
      buttons: [
        <Button
          key="1"
          action="link"
          target={`https://basescan.org/tx/${transactionId}`}
        >
          View on Basescan
        </Button>,
        <Button
          key="2"
          action="post"
          target={`/transaction-result?tx=${transactionId}`}
        >
          Refresh
        </Button>,
        <Button action="post" key="3" target="/">
          Home
        </Button>,
      ],
    };
  }

  if (transactionReceipt.status === "success") {
    // Transaction successful
    return {
      image: (
        <div tw="relative flex flex-col text-center items-center justify-center">
          <img src={`${appURL()}/images/frames/bg.png`} tw="w-full" />
          <div tw="absolute text-white text-2xl font-bold">
            Transaction Successful
          </div>
        </div>
      ),
      buttons: [
        <Button
          key="1"
          action="link"
          target={`https://basescan.org/tx/${transactionId}`}
        >
          View on Basescan
        </Button>,
        <Button action="post" key="2" target="/">
          Home
        </Button>,
      ],
    };
  } else if (transactionReceipt.status === "reverted") {
    // Transaction failed
    return {
      image: (
        <div tw="relative flex flex-col text-center items-center justify-center">
          <img src={`${appURL()}/images/frames/bg.png`} tw="w-full" />
          <div tw="absolute text-white text-2xl font-bold">
            Transaction Failed
          </div>
        </div>
      ),
      buttons: [
        <Button
          key="1"
          action="link"
          target={`https://basescan.org/tx/${transactionId}`}
        >
          View on Basescan
        </Button>,
        <Button action="post" key="2" target="/">
          Home
        </Button>,
      ],
    };
  }

  // Unknown status
  return {
    image: (
      <div tw="relative flex flex-col text-center items-center justify-center">
        <img src={`${appURL()}/images/frames/bg.png`} tw="w-full" />
        <div tw="absolute text-white text-2xl font-bold">
          Unknown Transaction Status
        </div>
      </div>
    ),
    buttons: [
      <Button
        key="1"
        action="link"
        target={`https://basescan.org/tx/${transactionId}`}
      >
        View on Basescan
      </Button>,
      <Button
        key="2"
        action="post"
        target={`/transaction-result?tx=${transactionId}`}
      >
        Refresh
      </Button>,
      <Button action="post" key="3" target="/">
        Home
      </Button>,
    ],
  };
});

export const GET = handler;
export const POST = handler;
