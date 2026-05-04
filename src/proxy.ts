import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/api", "/liff/auth"];

export default function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Allow public paths immediately
  const isPublic = PUBLIC_PATHS.some((p) => {
    if (p === "/") return pathname === "/"; // Exact match for root
    return pathname.startsWith(p);
  });

  if (isPublic) {
    return NextResponse.next();
  }

  const isLiff = pathname.startsWith("/liff");
  const tenantId = searchParams.get("tenantId");
  const cookieTenantId = request.cookies.get("tenant_id")?.value;

  // 2. Identity Resolution
  // We strictly rely on HttpOnly cookies for identity.
  // URL-based token promotion is removed for security (preventing leaks in logs/history).
  const token = request.cookies.get(isLiff ? "liff_auth_token" : "auth_token")?.value;
  const role = request.cookies.get(isLiff ? "liff_user_role" : "user_role")?.value;
  const locale = request.cookies.get("locale")?.value ?? "th";

  // 3. Auth Guard: Redirect unauthenticated users
  if (!token) {
    if (isLiff) {
      const authUrl = new URL("/liff/auth", request.url);
      
      // Pin Tenant context for the handshake
      if (tenantId) authUrl.searchParams.set("tenantId", tenantId);
      else if (cookieTenantId) authUrl.searchParams.set("tenantId", cookieTenantId);
      
      authUrl.searchParams.set("redirect", pathname + request.nextUrl.search);
      return NextResponse.redirect(authUrl);
    }

    // Admin/Other login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Role-based route protection
  const isSuperAdmin = pathname.startsWith("/superadmin");
  const isAdmin = pathname.startsWith("/admin");

  if (isSuperAdmin && role !== "superadmin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAdmin && role !== "tenant_admin" && role !== "superadmin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 5. Finalizing Response
  const requestHeaders = new Headers(request.headers);
  
  // High-Performance Identity Bridge: Inject internal headers for Server Components
  // This pins the identity for the current request cycle.
  if (token) {
    requestHeaders.set("x-middleware-auth", token);
    if (role) requestHeaders.set("x-middleware-role", role);
  }
  
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  response.headers.set("x-locale", locale);

  // Pin tenant_id for consistency across requests
  if (isLiff && tenantId && tenantId !== cookieTenantId) {
    response.cookies.set("tenant_id", tenantId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
      secure: true,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
