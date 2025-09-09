export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(
    process.env.NEXT_PUBLIC_BACKEND_URL
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`
      : `http://localhost:5002${path}`,
    {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    }
  );
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text();
  if (!res.ok) {
    // If it's a 401 error, try to refresh token
    if (res.status === 401) {
      try {
        const refreshRes = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh`
            : `http://localhost:5002/auth/refresh`,
          {
            method: "POST",
            credentials: "include",
          }
        );
        
        if (refreshRes.ok) {
          // Token refreshed, retry original request
          const retryRes = await fetch(
            process.env.NEXT_PUBLIC_BACKEND_URL
              ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`
              : `http://localhost:5002${path}`,
            {
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                ...(options.headers || {}),
              },
              ...options,
            }
          );
          
          if (retryRes.ok) {
            const retryContentType = retryRes.headers.get("content-type") || "";
            const retryData = retryContentType.includes("application/json")
              ? await retryRes.json()
              : await retryRes.text();
            return retryData as T;
          }
        }
      } catch (refreshError) {
        // Refresh failed, continue with original error
      }
    }
    
    const message = (data && (data.error || data.message)) || res.statusText;
    const error = new Error(
      typeof message === "string" ? message : "Request failed"
    );
    // Add details if available
    if (data && data.details) {
      (error as Error & { details?: unknown }).details = data.details;
    }
    // Add status code to error for better handling
    (error as Error & { status?: number }).status = res.status;
    throw error;
  }
  return data as T;
}

// Specialized function for auth endpoints that handles 401 silently
export async function authApiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T | null> {
  try {
    return await apiFetch<T>(path, options);
  } catch (error: any) {
    // If it's a 401 error, return null instead of throwing
    if (error.status === 401 || error.message === "Unauthenticated") {
      return null;
    }
    // For other errors, re-throw
    throw error;
  }
}
