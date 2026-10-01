import { NextResponse } from "next/server";
import { currentAccount } from "../../../lib/auth/session";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const account = await currentAccount();
    return NextResponse.json({ account: account ? { name: account.full_name } : null }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ account: null }, { status: 503, headers: { "Cache-Control": "private, no-store" } });
  }
}
