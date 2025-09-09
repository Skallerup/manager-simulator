"use client";

import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FootballSpinner } from "../ui/football-spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Debug logging
    console.log(
      "ProtectedRoute - isLoading:",
      isLoading,
      "isAuthenticated:",
      isAuthenticated,
      "user:",
      user
    );

    // Only redirect if we're sure the user is not authenticated
    // and we're not still loading
    if (!isLoading && !isAuthenticated) {
      console.log("Redirecting to login - not authenticated");
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router, user]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FootballSpinner size="lg" className="mx-auto" />
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
