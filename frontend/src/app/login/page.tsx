"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FootballSpinner } from "@/components/ui/football-spinner";
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState("skallerup+5@gmail.com");
  const [password, setPassword] = useState("12345678");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || t('loginFailed'));
    }
  };

  return (
    <AuthLayout
      title={t('welcomeBack')}
      subtitle={t('loginToAccount')}
      footerText={t('dontHaveAccount')}
      footerLinkText={t('signUp')}
      footerLinkHref="/register"
    >
      {/* Login Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">
            {t('email')}
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="m@example.com"
            className="bg-muted border-muted-foreground/20 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-foreground">
              {t('password')}
            </Label>
            <Link
              href="/forgot-password"
              className="text-sm text-foreground hover:underline"
            >
              {t('forgotPassword')}
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-muted border-muted-foreground/20 text-foreground"
          />
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-md border border-red-500/20">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 text-base font-medium"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <FootballSpinner size="sm" />
              {t('signingIn')}
            </div>
          ) : (
            t('login')
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
