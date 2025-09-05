import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { apiFetch } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

// SWR fetcher for auth
const authFetcher = async (url: string): Promise<User> => {
  try {
    return await apiFetch<User>(url);
  } catch (error) {
    // If /auth/me fails, try to refresh the token
    try {
      await apiFetch("/auth/refresh", { method: "POST" });
      // If refresh succeeds, try /auth/me again
      return await apiFetch<User>(url);
    } catch (refreshError) {
      // If refresh also fails, return null instead of throwing
      // This prevents console errors on unauthenticated pages
      return null as any;
    }
  }
};

export function useAuth(): AuthContextType {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    data: user,
    error,
    mutate,
    isLoading: swrLoading,
  } = useSWR<User>("/auth/me", authFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    shouldRetryOnError: false,
    errorRetryCount: 0,
    onError: (error) => {
      // Silently handle auth errors - don't log to console
      // This prevents "Unauthenticated" errors from showing in console
      if (error.message !== "Unauthenticated") {
        console.error("Auth error:", error);
      }
    },
  });

  const isAuthenticated = !!user && !error;
  const isAuthLoading = swrLoading || isLoading;

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      try {
        const userData = await apiFetch<User>("/auth/login", {
          method: "POST",
          body: JSON.stringify(credentials),
        });
        // Update SWR cache with new user data
        mutate(userData, false);
        router.push("/dashboard");
      } catch (error: unknown) {
        throw new Error(
          error instanceof Error ? error.message : "Login failed"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [router, mutate]
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      setIsLoading(true);
      try {
        await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify(credentials),
        });
        router.push("/login");
      } catch (error: unknown) {
        throw new Error(
          error instanceof Error ? error.message : "Registration failed"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error("Logout error:", error);
    } finally {
      // Clear SWR cache
      mutate(undefined, false);
      setIsLoading(false);
      router.push("/login");
    }
  }, [router, mutate]);

  const refreshAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      await mutate();
    } catch (error) {
      console.error("Refresh auth error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [mutate]);

  return {
    user: user || null,
    isLoading: isAuthLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshAuth,
  };
}
