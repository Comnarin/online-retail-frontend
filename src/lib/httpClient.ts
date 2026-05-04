
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export type FetchOptions = RequestInit & {
  params?: Record<string, any>;
  next?: NextFetchRequestConfig;
  cache?: RequestCache;
};

async function getAuthToken(): Promise<string | undefined> {
  // 1. Server-Side: Strict Header Bridge
  if (typeof window === "undefined") {
    try {
      const { headers, cookies } = await import("next/headers");
      const headerStore = await headers();
      const middlewareAuth = headerStore.get("x-middleware-auth");
      if (middlewareAuth) return middlewareAuth;

      const cookieStore = await cookies();
      return cookieStore.get("liff_auth_token")?.value || cookieStore.get("auth_token")?.value || undefined;
    } catch (err) {
      return undefined;
    }
  }
  
  // 2. Client-Side: Memory Bridge Fallback
  if (typeof window !== "undefined") {
    const { memoryBridge } = await import("@/lib/memory-bridge");
    return memoryBridge.get() || undefined;
  }

  return undefined;
}

async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;
  const token = await getAuthToken();
  const isServer = typeof window === "undefined";
  
  // Authoritative server-side internal URL
  const internalBaseUrl = "http://backend:4001";
  const cleanBaseUrl = (isServer ? internalBaseUrl : BASE_URL)
    .replace(/\/api\/v1\/?$/, "")
    .replace(/\/+$/, "");
    
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  let url = isServer ? `${cleanBaseUrl}/api/v1${cleanPath}` : `/api/v1${cleanPath}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  const headers = new Headers(fetchOptions.headers);
  
  // Apply Token as both Bearer and Bridge Header for maximum compatibility
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
    headers.set("x-liff-bridge", String(token));
  }

  // Resolve Tenant ID
  let tenantId = params?.tenant_id || params?.tenantId;
  if (!tenantId && typeof window !== 'undefined') {
    tenantId = new URLSearchParams(window.location.search).get('tenantId');
  }

  if (tenantId) {
    headers.set("X-Tenant-ID", String(tenantId));
  }

  if (!headers.has("Content-Type") && !(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: "include", // Authoritatively include HttpOnly cookies
  });

  if (!response.ok) {
    // Handle 401 specifically for client-side
    if (response.status === 401 && typeof window !== "undefined") {
      console.warn("🔐 [AuthBridge] 401 Unauthorized detected. Purging session...");
      const { memoryBridge } = await import("@/lib/memory-bridge");
      memoryBridge.clear();
      
      // Full reload to allow server to clear HttpOnly cookies
      window.location.href = "/api/auth/logout";
      return new Promise(() => {}); // Halt execution
    }
    
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
  }

  // Handle No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const httpClient = {
  get: <T>(path: string, options?: FetchOptions) => 
    request<T>(path, { ...options, method: "GET" }),
  
  post: <T>(path: string, body?: any, options?: FetchOptions) => 
    request<T>(path, { 
      ...options, 
      method: "POST", 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }),
  
  put: <T>(path: string, body?: any, options?: FetchOptions) => 
    request<T>(path, { 
      ...options, 
      method: "PUT", 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }),

  patch: <T>(path: string, body?: any, options?: FetchOptions) => 
    request<T>(path, { 
      ...options, 
      method: "PATCH", 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }),
  
  delete: <T>(path: string, options?: FetchOptions) => 
    request<T>(path, { ...options, method: "DELETE" }),
};
