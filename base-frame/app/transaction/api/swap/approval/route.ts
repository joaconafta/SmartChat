import { NextRequest, NextResponse } from "next/server";
import { approveForSwap } from "@/lib/transactions";

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const { searchParams } = url;
  const tokenFrom = searchParams.get("token_from") || "";
  const amount = searchParams.get("amount") || "";
 
  try {
    const txCalldata = await approveForSwap(tokenFrom, amount);
    return NextResponse.json(txCalldata);
  } catch (e) {
    return NextResponse.error();
  }
}
