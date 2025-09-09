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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogoIcon } from "@/components/ui/logo-icon";

// Team color options
const TEAM_COLORS = [
  { primary: '#FF0000', secondary: '#FFFFFF', name: 'Red & White' },
  { primary: '#0000FF', secondary: '#FFFFFF', name: 'Blue & White' },
  { primary: '#00FF00', secondary: '#000000', name: 'Green & Black' },
  { primary: '#FFFF00', secondary: '#000000', name: 'Yellow & Black' },
  { primary: '#FF8000', secondary: '#FFFFFF', name: 'Orange & White' },
  { primary: '#8000FF', secondary: '#FFFFFF', name: 'Purple & White' },
  { primary: '#000000', secondary: '#FFFFFF', name: 'Black & White' },
  { primary: '#808080', secondary: '#FFFFFF', name: 'Gray & White' },
  { primary: '#DC2626', secondary: '#FEF3C7', name: 'Red & Gold' },
  { primary: '#1E40AF', secondary: '#FEF3C7', name: 'Navy & Gold' },
  { primary: '#059669', secondary: '#FEF3C7', name: 'Green & Gold' },
  { primary: '#7C2D12', secondary: '#FEF3C7', name: 'Brown & Gold' }
];

// Team logo options
const TEAM_LOGOS = [
  'circle', 'square', 'triangle', 'diamond', 'star', 'hexagon',
  'shield', 'crown', 'flame', 'lightning', 'wave', 'mountain',
  'eagle', 'lion', 'bull', 'wolf', 'bear', 'tiger',
  'cross', 'anchor', 'sword', 'arrow', 'hammer', 'gear'
];

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [selectedColors, setSelectedColors] = useState(TEAM_COLORS[0]);
  const [selectedLogo, setSelectedLogo] = useState(TEAM_LOGOS[0]);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreeToTerms) {
      setError(t('pleaseAgreeToTerms'));
      return;
    }

    if (password.length < 8) {
      setError("Adgangskoden skal være mindst 8 karakterer lang");
      return;
    }

    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    try {
      await register({ 
        email, 
        password, 
        name: name || undefined,
        teamName: teamName || `${name || 'Manager'}'s Team`,
        colors: JSON.stringify(selectedColors),
        logo: selectedLogo
      });
    } catch (err: any) {
      setError(err.message || t('registrationFailed'));
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!email || !password) {
        setError("Email og adgangskode er påkrævet");
        return;
      }
      if (password.length < 8) {
        setError("Adgangskoden skal være mindst 8 karakterer lang");
        return;
      }
      setCurrentStep(2);
      setError(null);
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
    setError(null);
  };

  return (
    <AuthLayout
      title={currentStep === 1 ? t('createAccount') : 'Opret dit hold'}
      subtitle={currentStep === 1 ? t('joinDraftManager') : 'Vælg farver og logo til dit hold'}
      footerText={currentStep === 1 ? t('alreadyHaveAccount') : ''}
      footerLinkText={currentStep === 1 ? t('signIn') : ''}
      footerLinkHref={currentStep === 1 ? "/login" : ''}
    >
      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          currentStep >= 1 ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
        }`}>
          1
        </div>
        <div className={`w-16 h-1 rounded ${
          currentStep >= 2 ? 'bg-foreground' : 'bg-muted'
        }`} />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          currentStep >= 2 ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
        }`}>
          2
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {currentStep === 1 && (
          <>
            {/* Step 1: Account Information */}
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
              <p className="text-sm text-muted-foreground">
                Adgangskoden skal være mindst 8 karakterer lang
              </p>
            </div>

            <Button
              type="button"
              onClick={nextStep}
              className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 text-base font-medium"
            >
              Næste: Opret hold
            </Button>
          </>
        )}

        {currentStep === 2 && (
          <>
            {/* Step 2: Team Creation */}
            <div className="space-y-2">
              <Label htmlFor="teamName" className="text-foreground">
                Holdnavn
              </Label>
              <Input
                id="teamName"
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder={`${name || 'Manager'}'s Team`}
                className="bg-muted border-muted-foreground/20 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Team Colors */}
            <div className="space-y-3">
              <Label className="text-foreground">Vælg holdfarver</Label>
              <div className="grid grid-cols-4 gap-3">
                {TEAM_COLORS.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedColors(color)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedColors.primary === color.primary
                        ? 'border-foreground ring-2 ring-foreground/20'
                        : 'border-muted hover:border-muted-foreground/50'
                    }`}
                  >
                    <div className="flex space-x-1 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: color.primary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: color.secondary }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{color.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Team Logo */}
            <div className="space-y-3">
              <Label className="text-foreground">Vælg logo</Label>
              <div className="grid grid-cols-6 gap-3">
                {TEAM_LOGOS.map((logo, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedLogo(logo)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedLogo === logo
                        ? 'border-foreground ring-2 ring-foreground/20'
                        : 'border-muted hover:border-muted-foreground/50'
                    }`}
                  >
                    <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                      <LogoIcon 
                        type={logo} 
                        size={32} 
                        primaryColor={selectedColors.primary}
                        secondaryColor={selectedColors.secondary}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">{logo}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Team Preview */}
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Hold forhåndsvisning</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-16 h-16 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: selectedColors.primary }}
                  >
                    <LogoIcon 
                      type={selectedLogo} 
                      size={48} 
                      primaryColor={selectedColors.secondary}
                      secondaryColor={selectedColors.primary}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {teamName || `${name || 'Manager'}'s Team`}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedColors.name} • {selectedLogo.charAt(0).toUpperCase() + selectedLogo.slice(1)} logo
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

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

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="flex-1 h-12"
              >
                Tilbage
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !agreeToTerms}
                className="flex-1 bg-foreground text-background hover:bg-foreground/90 h-12 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <FootballSpinner size="sm" />
                    Opretter konto og hold...
                  </div>
                ) : (
                  'Opret konto og hold'
                )}
              </Button>
            </div>
          </>
        )}

        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-md border border-red-500/20">
            {error}
          </div>
        )}
      </form>
    </AuthLayout>
  );
}
