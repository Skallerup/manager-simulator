"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FootballSpinner } from "@/components/ui/football-spinner";
import { useTranslation } from 'react-i18next';

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreeToTerms) {
      setError(t('pleaseAgreeToTerms'));
      return;
    }

    try {
      await register({ email, password, name: name || undefined });
    } catch (err: any) {
      setError(err.message || t('registrationFailed'));
    }
  };

  return (
    <AuthLayout
      title={t('createAccount')}
      subtitle={t('joinDraftManager')}
      footerText={t('alreadyHaveAccount')}
      footerLinkText={t('signIn')}
      footerLinkHref="/login"
    >
      {/* Register Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground">
            {t('nameOptional')}
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('enterName')}
            className="bg-muted border-muted-foreground/20 text-foreground placeholder:text-muted-foreground"
          />
        </div>

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
          <Label htmlFor="password" className="text-foreground">
            {t('password')}
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder={t('createPassword')}
            className="bg-muted border-muted-foreground/20 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Terms Agreement Checkbox */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="terms"
            checked={agreeToTerms}
            onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
            className="mt-1"
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="terms"
              className="text-sm text-muted-foreground leading-relaxed"
            >
              {t('agreeToTerms')}{" "}
              <Link href="/terms" className="text-foreground hover:underline">
                {t('termsOfService')}
              </Link>{" "}
              {t('and')}{" "}
              <Link href="/privacy" className="text-foreground hover:underline">
                {t('privacyPolicy')}
              </Link>
            </Label>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-md border border-red-500/20">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading || !agreeToTerms}
          className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <FootballSpinner size="sm" />
              {t('creatingAccount')}
            </div>
          ) : (
            t('createAccount')
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
