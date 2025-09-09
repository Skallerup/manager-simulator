import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { apiFetch, authApiFetch } from "@/lib/api";

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
  teamName?: string;
  colors?: string;
  logo?: string;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

// SWR fetcher for auth - only runs when key is not null
const authFetcher = async (url: string | null): Promise<User | null> => {
  if (!url) {
    return null;
  }
  
  // First try to get user data
  const user = await authApiFetch<User>(url);
  if (user) {
    return user;
  }
  
  // If no user, try to refresh token
  const refreshResult = await authApiFetch("/auth/refresh", { method: "POST" });
  if (refreshResult) {
    // If refresh succeeded, try to get user data again
    return await authApiFetch<User>(url);
  }
  
  // If both failed, return null (user is not authenticated)
  return null;
};

export function useAuth(): AuthContextType {
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Only use SWR when we have a user (after login)
  const {
    data: swrUser,
    error,
    mutate,
    isLoading: swrLoading,
  } = useSWR<User | null>(user ? "/auth/me" : null, authFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
    errorRetryCount: 0,
    dedupingInterval: 30000,
    refreshInterval: 0,
    onError: () => {
      // Completely silent - no console errors for auth
    },
  });

  // Initial auth check on mount
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authApiFetch<User>("/auth/me");
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Update local state when SWR data changes
  React.useEffect(() => {
    if (swrUser) {
      setUser(swrUser);
      setIsAuthenticated(true);
    } else if (error) {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [swrUser, error]);

  const isAuthLoading = swrLoading || isLoading;

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      try {
        const userData = await apiFetch<User>("/auth/login", {
          method: "POST",
          body: JSON.stringify(credentials),
        });
        // Set user state and enable auth checking
        setUser(userData);
        setIsAuthenticated(true);
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
        const response = await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify(credentials),
        });
        
        // If registration includes team creation, show team info
        if ((response as any).team) {
          alert(`Konto og hold oprettet succesfuldt!\n\nHold: ${(response as any).team.name}\nSamlet rating: ${(response as any).team.overallRating}/100`);
        } else {
          alert("Bruger oprettet succesfuldt! Du kan nu logge ind.");
        }
        
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
      // Clear all state
      setUser(null);
      setIsAuthenticated(false);
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
