export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(
    process.env.NEXT_PUBLIC_BACKEND_URL
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`
      : `http://localhost:4000${path}`,
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
    const message = (data && (data.error || data.message)) || res.statusText;
    const error = new Error(
      typeof message === "string" ? message : "Request failed"
    );
    // Add details if available
    if (data && data.details) {
      (error as Error & { details?: unknown }).details = data.details;
    }
    throw error;
  }
  return data as T;
}
