import { apiFetch } from "@/lib/api";

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("API Client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should make successful API calls", async () => {
    const mockResponse = {
      id: "1",
      email: "test@example.com",
      name: "Test User",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockResponse,
    } as Response);

    const result = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      }),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:4000/auth/register",
      expect.objectContaining({
        credentials: "include",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
          name: "Test User",
        }),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it("should handle API errors", async () => {
    const errorResponse = { error: "Email already in use" };

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      statusText: "Conflict",
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => errorResponse,
    } as Response);

    await expect(
      apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
          name: "Test User",
        }),
      })
    ).rejects.toThrow("Email already in use");
  });

  it("should use custom backend URL when provided", async () => {
    const originalEnv = process.env.NEXT_PUBLIC_BACKEND_URL;
    process.env.NEXT_PUBLIC_BACKEND_URL = "https://api.example.com";

    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({}),
    } as Response);

    await apiFetch("/auth/login");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.com/auth/login",
      expect.any(Object)
    );

    // Restore original env
    process.env.NEXT_PUBLIC_BACKEND_URL = originalEnv;
  });
});

