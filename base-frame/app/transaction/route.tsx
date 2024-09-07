import { Button } from "frames.js/next";
import { FrameDefinition, JsonValue } from "frames.js/types";
import { frames } from "@/app/transaction/frames";
import { TOKENS } from "@/lib/tokens";
import { appURL, checkTokenDecimals, getTokenBalance } from "@/lib/utils";
import { formatUnits, parseUnits } from "viem";
import { CHAIN_ID, allowanceForSwap } from "@/lib/transactions";

const handler = frames(async (ctx) => {
  const userAddress =
    ctx.message?.requesterVerifiedAddresses &&
    ctx.message?.requesterVerifiedAddresses.length > 0
      ? ctx.message?.requesterVerifiedAddresses[0]
      : ctx.message?.verifiedWalletAddress;

  // Get direction, token, token_from, and token_to from query params
  const direction = ctx.url.searchParams.get("direction") || "from";
  const token = ctx.url.searchParams.get("token") || "ETH";
  const tokenFromParam = ctx.url.searchParams.get("token_from");
  const tokenToParam = ctx.url.searchParams.get("token_to");

  // Set tokenFrom and tokenTo based on available parameters
  let tokenFrom, tokenTo;
  if (tokenFromParam && tokenToParam) {
    tokenFrom = tokenFromParam;
    tokenTo = tokenToParam;
  } else {
    tokenFrom = direction === "from" ? token : "USDC";
    tokenTo = direction === "from" ? "USDC" : token;
  }

  // Amount input from the URL or input text
  const amount = ctx.url.searchParams.get("amount") || ctx.message?.inputText || "";
  const isValidAmount = !!amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0.0;

  // Frame with amount input and buttons (for swap and change direction)
  if (!userAddress || !isValidAmount) {
    return {
      image: (
        <div tw="relative flex flex-col justify-center">
          <img src={`${appURL()}/images/frames/bg.png`} tw="w-full" />
          <div tw="w-full flex absolute text-white justify-between bottom-[117px] px-23 text-[24px] font-bold leading-8">
            <div tw="flex overflow-x-hidden w-[198px]">
              <div tw="mx-auto" style={{ fontFamily: "Urbanist-Bold" }}>
                {tokenFrom}
              </div>
            </div>
            <div tw="flex overflow-x-hidden w-[198px]">
              <div tw="mx-auto" style={{ fontFamily: "Urbanist-Bold" }}>
                {tokenTo}
              </div>
            </div>
          </div>
        </div>
      ),
      textInput: `Enter amount of ${tokenFrom} (e.g., 0.1)`,
      buttons: [
        <Button
          action="post"
          key="1"
          target={`/?amount=${amount}&direction=${direction}&token=${token}`}
        >
          {`Swap ${tokenFrom} to ${tokenTo}`}
        </Button>,
        <Button
          action="post"
          key="2"
          target={`/?amount=${amount}&direction=${direction === "from" ? "to" : "from"}&token=${token}`}
        >
          Change Direction
        </Button>,
      ],
    };
  }

  // // tokenFrom and tokenTo and amount are all valid
  // if (isValidAmount && userAddress) {
  //   const userBalance = await getTokenBalance(userAddress, tokenFrom);
  //   const tokenInDecimals = await checkTokenDecimals(
  //     TOKENS[CHAIN_ID][tokenFrom]
  //   );
  //   const bigIntAmount: bigint = parseUnits(amount, tokenInDecimals);
  //   const formattedBalance: string = formatUnits(
  //     userBalance,
  //     tokenInDecimals
  //   );

  //   if (userBalance < bigIntAmount) {
  //     return {
  //       image: (
  //         <div tw="relative flex flex-col text-center items-center justify-center">
  //           <img
  //             src={`${appURL()}/images/frames/bg.png`}
  //             tw="w-full"
  //           />
  //           <div tw="w-full flex absolute text-white top-[140px] pl-16 text-[24px] font-light leading-8">
  //             <div tw="flex">
  //               <p>
  //                 You are trying to swap
  //                 <b tw="mx-2" style={{ fontFamily: "Urbanist-Bold" }}>
  //                   {amount} {tokenFrom}
  //                 </b>
  //                 but you only have
  //                 <b tw="mx-2" style={{ fontFamily: "Urbanist-Bold" }}>
  //                   {formattedBalance.slice(0, 8)} {tokenFrom}
  //                 </b>
  //               </p>
  //             </div>
  //           </div>
  //         </div>
  //       ),
  //       buttons: [
  //         <Button
  //           key="1"
  //           action="link"
  //           target={`https://basescan.org/address/${userAddress}`}
  //         >
  //           See account on Basescan
  //         </Button>,
  //         <Button
  //           key="2"
  //           action="post"
  //           target={`/?token=${token}&amount=${amount}&direction=${direction}`}
  //         >
  //           Refresh balance
  //         </Button>,
  //       ],
  //     };
  //   }
  // }
  // Check allowance for the swap
  const { allowance } = await allowanceForSwap(tokenFrom, amount, userAddress);

  // Frame with approve button
  if (!allowance) {
    return {
      image: (
        <div tw="relative flex flex-col justify-center">
        <img src={`${appURL()}/images/frames/bg.png`} tw="w-full" />
        <div tw="w-full flex absolute text-white top-[140px] pl-16 text-[32px] font-light leading-8">
          <div tw="flex">
            <p>
              Approve the swap of
              <b tw="mx-2" style={{ fontFamily: "Urbanist-Bold" }}>
                {amount} {tokenFrom}
              </b>
              for
              <b tw="mx-2" style={{ fontFamily: "Urbanist-Bold" }}>
                {tokenTo}
              </b>
            </p>
          </div>
        </div>
        <div tw="w-full flex absolute text-white justify-between bottom-[117px] px-23 text-[24px] font-bold leading-8">
          <div tw="flex overflow-x-hidden w-[198px]">
            <div tw="mx-auto" style={{ fontFamily: "Urbanist-Bold" }}>
              {tokenFrom}
            </div>
          </div>
          <div tw="flex overflow-x-hidden w-[198px]">
              <div tw="mx-auto" style={{ fontFamily: "Urbanist-Bold" }}>
                {amount}
              </div>
            </div>
          <div tw="flex overflow-x-hidden w-[198px]">
            <div tw="mx-auto" style={{ fontFamily: "Urbanist-Bold" }}>
              {tokenTo}
            </div>
          </div>
        </div>
      </div>
      ),
      buttons: [
        <Button
          action="tx"
          key="1"
          target={`/api/swap/approval?token_from=${tokenFrom}&token_to=${tokenTo}&amount=${amount}`}
          post_url={`/?token=${token}&amount=${amount}&direction=${direction}`}
        >
          {`Approve ${tokenFrom}`}
        </Button>,
        <Button
        key="2"
        action="post"
        target={`/?token=${token}&amount=${amount}&direction=${direction}`}
      >
        Refresh approval
      </Button>
      ],
    };
  }

  // Frame with confirm button
  return {
    image: (
      <div tw="relative flex flex-col justify-center">
        <img src={`${appURL()}/images/frames/bg.png`} tw="w-full" />
        <div tw="w-full flex absolute text-white top-[140px] pl-16 text-[24px] font-light leading-8">
          <div tw="flex">
            <p>
              Confirm the swap of
              <b tw="mx-2" style={{ fontFamily: "Urbanist-Bold" }}>
                {amount} {tokenFrom}
              </b>
              for
              <b tw="mx-2" style={{ fontFamily: "Urbanist-Bold" }}>
                {tokenTo}
              </b>
            </p>
          </div>
        </div>
        <div tw="w-full flex absolute text-white justify-between bottom-[117px] px-23 text-[24px] font-bold leading-8">
          <div tw="flex overflow-x-hidden w-[198px]">
            <div tw="mx-auto" style={{ fontFamily: "Urbanist-Bold" }}>
              {tokenFrom}
            </div>
          </div>
          <div tw="flex overflow-x-hidden w-[198px]">
              <div tw="mx-auto" style={{ fontFamily: "Urbanist-Bold" }}>
                {amount}
              </div>
            </div>
          <div tw="flex overflow-x-hidden w-[198px]">
            <div tw="mx-auto" style={{ fontFamily: "Urbanist-Bold" }}>
              {tokenTo}
            </div>
          </div>
        </div>
      </div>
    ),
    buttons: [
      <Button
      action="tx"
      key="1"
      target={`/api/swap/complete?token_from=${tokenFrom}&token_to=${tokenTo}&amount=${amount}&user_address=${userAddress}`}
      post_url={`/transaction/transaction-result?token_from=${tokenFrom}&token_to=${tokenTo}&amount=${amount}&user_address=${userAddress}`}
    >
      Complete swap
    </Button>,
      <Button
      key="2"
      action="post"
      target={`/transaction/transaction-result?token_from=${tokenFrom}&token_to=${tokenTo}&amount=${amount}&user_address=${userAddress}`}
    >
      Refresh status
    </Button>
    ],
  };

  
  
});

export const GET = handler;
export const POST = handler;
