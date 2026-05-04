
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Server-Side Logout Proxy.
 * This route is called to clear HttpOnly cookies from the browser.
 * It clears the session cookies and redirects the user to the login page.
 */
export async function GET() {
  const cookieStore = await cookies();
  
  // Clear all identity-bearing cookies
  const cookiesToClear = ["auth_token", "liff_auth_token", "user_role", "liff_user_role"];
  
  cookiesToClear.forEach(name => {
    cookieStore.set(name, "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
  });

  // Redirect to login page
  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}
