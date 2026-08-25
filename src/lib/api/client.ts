// lib/api/client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL && typeof window === "undefined") {
  console.warn(
    "[api/client] NEXT_PUBLIC_API_BASE_URL is not set. All storefront API calls will fail."
  );
}

export class ApiError extends Error {
  readonly status: number;
  readonly info: unknown;

  constructor(message: string, status: number, info?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.info = info;
  }
}

interface RequestOptions {
  params?: Record<string, string | number | undefined>;
  body?: unknown;
  signal?: AbortSignal;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
}

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  const url = new URL(
    path.startsWith("/") ? path : `/${path}`,
    API_BASE_URL ?? "http://localhost:5000/api"
  );

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  return API_BASE_URL ? url.toString() : `${url.pathname}${url.search}`;
}

async function request<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  options: RequestOptions = {}
): Promise<T> {
  const url = buildUrl(path, options.params);

  const fetchOptions: RequestInit = {
    method,
    headers: { 
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
    // CRITICAL SECURITY FIX: Sends HttpOnly cookies with every request
    credentials: "include", 
    signal: options.signal,
    cache: options.cache,
    next: options.next,
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  let res: Response;
  try {
    res = await fetch(url, fetchOptions);
  } catch (err) {
    throw new ApiError(
      err instanceof Error ? err.message : "Network request failed",
      0,
      err
    );
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = undefined;
  }

  const envelope = body as { success?: boolean; message?: string } | undefined;

  if (!res.ok || envelope?.success === false) {
    throw new ApiError(
      envelope?.message ?? `Request failed with status ${res.status}`,
      res.status,
      body
    );
  }

  return body as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, "GET", options),
  
  // NEW: Added POST method for Checkout and Customer Auth mutations
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "body">) =>
    request<T>(path, "POST", { ...options, body }),
};