"use client";

import { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import { Apple, Chrome, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
  showSocialLogin?: boolean;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkHref,
  showSocialLogin = true,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Main Card */}
        <div className="bg-card rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
            {/* Left Section - Form */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full space-y-8">
                {/* Header */}
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-foreground">
                    {title}
                  </h1>
                  <p className="text-muted-foreground">{subtitle}</p>
                </div>

                {/* Form Content */}
                {children}

                {/* Social Login Section */}
                {showSocialLogin && (
                  <>
                    {/* Separator */}
                    <div className="relative">
                      <Separator className="bg-muted-foreground/20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-card px-4 text-sm text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        variant="outline"
                        className="h-12 bg-card border-muted-foreground/20 hover:bg-muted/50"
                      >
                        <Apple className="h-5 w-5 text-foreground" />
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12 bg-card border-muted-foreground/20 hover:bg-muted/50"
                      >
                        <Chrome className="h-5 w-5 text-foreground" />
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12 bg-card border-muted-foreground/20 hover:bg-muted/50"
                      >
                        <Infinity className="h-5 w-5 text-foreground" />
                      </Button>
                    </div>
                  </>
                )}

                {/* Footer Link */}
                <div className="text-center">
                  <p className="text-muted-foreground">
                    {footerText}{" "}
                    <Link
                      href={footerLinkHref}
                      className="text-foreground hover:underline font-medium"
                    >
                      {footerLinkText}
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section - Football Stadium Image */}
            <div className="hidden lg:flex relative overflow-hidden">
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Football stadium at night"
                  className="w-full h-full object-cover"
                />
                {/* Dark overlay for better text contrast */}
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
