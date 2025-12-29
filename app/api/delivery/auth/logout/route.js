import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req) {
  const cookieStore = await cookies();
  cookieStore.delete("delivery_token");
  return NextResponse.json({ message: "Logged out" }, { status: 200 });
}