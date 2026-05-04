import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Lightweight Auth Verification Endpoint.
 * This endpoint is used by the LIFF handshake page to verify that the 
 * HttpOnly cookies set by the backend were successfully accepted by the browser.
 */
export async function GET() {
  const cookieStore = await cookies();
  const hasSession = cookieStore.has("liff_auth_token") || cookieStore.has("auth_token");
  
  if (!hasSession) {
    return NextResponse.json({ verified: false }, { status: 401 });
  }

  return NextResponse.json({ verified: true }, { status: 200 });
}
