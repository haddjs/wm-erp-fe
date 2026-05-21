const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!BASE_URL) {
  console.error(
    "[api] NEXT_PUBLIC_API_URL is not defined. All API requests will fail. " +
      "Check your .env.production file.",
  );
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export async function apiFetch(
  url: string,
  options: RequestInit = {},
  token?: string,
) {
  const getAccessToken = () =>
    token ||
    (typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null);

  let accessToken = getAccessToken();

  const makeRequest = async (customToken?: string): Promise<any> => {
    if (!BASE_URL) throw new Error("NEXT_PUBLIC_API_URL is not configured");
    const isFormData = options.body instanceof FormData;

    const headers: HeadersInit = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...((options.headers as Record<string, string>) || {}),
    };

    const finalToken = customToken || accessToken;
    if (finalToken) {
      headers["Authorization"] = `Bearer ${finalToken}`;
    }

    const res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      // Token expired, try to refresh
      const originalRequest = { url, options };

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const newToken = await refreshAccessToken();
          accessToken = newToken;
          processQueue(null, newToken);
          return makeRequest(newToken);
        } catch (error) {
          processQueue(error as Error, null);
          // Redirect to login on refresh failure
          if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login";
          }
          throw error;
        } finally {
          isRefreshing = false;
        }
      }

      // Queue other requests while refreshing
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => makeRequest(token as string));
    }

    if (!res.ok) {
      const err = await res.json();
      throw err;
    }

    return res.json();
  };

  return makeRequest();
}

export async function apiFetchList<T>(
  url: string,
  options: RequestInit = {},
): Promise<T[]> {
  const res = await apiFetch(url, options);
  return res?.data ?? [];
}

async function refreshAccessToken(): Promise<string> {
  if (typeof window === "undefined")
    throw new Error("Cannot refresh token on server");

  const refresh_token = localStorage.getItem("refresh_token");
  if (!refresh_token) throw new Error("No refresh token");

  if (!refresh_token) {
    throw new Error("No refresh token");
  }

  const res = await fetch(`${BASE_URL}/authentications/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token }),
  });

  if (!res.ok) {
    throw new Error("Failed to refresh token");
  }

  const data = await res.json();
  const newAccessToken = data.data?.access_token;

  if (newAccessToken) {
    localStorage.setItem("access_token", newAccessToken);
    return newAccessToken;
  }

  throw new Error("No access token in refresh response");
}
