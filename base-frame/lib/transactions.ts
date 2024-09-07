import { createPublicClient, encodeFunctionData, http, parseUnits } from "viem";
import { base, baseSepolia } from "viem/chains";
import { TOKENS } from "@/lib/tokens";
import {
  ENSO_ROUTER_ADDRESS,
  checkTokenDecimals,
  NATIVE_TOKEN,
} from "@/lib/utils";
import {
  ERC20_ABI,
} from "@/lib/abis";

export const CHAIN_ID = process.env.CHAIN_ID
  ? parseInt(process.env.CHAIN_ID)
  : 8453;

export const publicClient = createPublicClient({
  chain: CHAIN_ID === base.id ? base : baseSepolia,
  transport: http(),
});

// Allowance for send function
export async function allowance(
  tokenIn: string,
  amount: string,
  fromAddress: string,
  spenderAddress: string
) {
  if (!tokenIn || !amount || !fromAddress || !spenderAddress) {
    throw new Error("Invalid allowance parameters");
  }

  let tokenInAddress = TOKENS[CHAIN_ID as number][tokenIn];
  // if tokenIn is the native token, send the transaction directly
  if (tokenInAddress === NATIVE_TOKEN) {
    return {
      allowance: true,
    };
  }

  const tokenInDecimals = await checkTokenDecimals(tokenInAddress);
  const amountIn = parseUnits(amount, tokenInDecimals);
  // get token allowance
  const allowance = (await publicClient.readContract({
    address: tokenInAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [fromAddress as `0x${string}`, spenderAddress as `0x${string}`],
  })) as bigint;

  // if allowance is less than amountIn, return false
  if (amountIn > allowance) {
    return {
      allowance: false,
    };
  } else {
    return {
      allowance: true,
    };
  }
}

// Allowance for swap function
export async function allowanceForSwap(
  tokenIn: string,
  amount: string,
  fromAddress: string
) {
  return allowance(tokenIn, amount, fromAddress, ENSO_ROUTER_ADDRESS);
}

// Approve function
export async function approve(
  tokenIn: string,
  amount: string,
  spenderAddress: string
) {
  if (!tokenIn || !amount || !spenderAddress) {
    throw new Error("Invalid approve parameters");
  }

  let tokenInAddress = TOKENS[CHAIN_ID as number][tokenIn];
  // if tokenIn is the native token, send the transaction directly
  if (tokenInAddress === NATIVE_TOKEN) {
    throw new Error("Native token cannot be approved");
  }

  const tokenInDecimals = await checkTokenDecimals(tokenInAddress);
  const amountIn = parseUnits(amount, tokenInDecimals);
  const approveData = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: "approve",
    args: [spenderAddress as `0x${string}`, amountIn],
  });

  return {
    chainId: "eip155:".concat(CHAIN_ID.toString()),
    method: "eth_sendTransaction",
    params: {
      abi: ERC20_ABI,
      to: tokenInAddress,
      data: approveData,
      value: "0",
    },
  };
}

// Approve for swap function
export async function approveForSwap(tokenIn: string, amount: string) {
  return approve(tokenIn, amount, ENSO_ROUTER_ADDRESS);
}

// Transfer function
export async function transfer(
  tokenIn: string,
  amount: string,
  receiverAddress: string
) {
  if (!tokenIn || !amount || !receiverAddress) {
    throw new Error("Invalid transfer parameters");
  }

  let tokenInAddress = TOKENS[CHAIN_ID as number][tokenIn];
  const tokenInDecimals = await checkTokenDecimals(tokenInAddress);
  const amountIn = parseUnits(amount, tokenInDecimals);

  const transferData = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: "transfer",
    args: [receiverAddress as `0x${string}`, BigInt(amountIn)],
  });

  return {
    chainId: "eip155:".concat(CHAIN_ID.toString()),
    method: "eth_sendTransaction",
    params: {
      abi: ERC20_ABI,
      to: tokenInAddress === NATIVE_TOKEN ? receiverAddress : tokenInAddress,
      data: tokenInAddress === NATIVE_TOKEN ? "" : transferData,
      value: tokenInAddress === NATIVE_TOKEN ? amountIn.toString() : "0",
    },
  };
}
