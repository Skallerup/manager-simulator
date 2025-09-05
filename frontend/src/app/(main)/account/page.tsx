"use client";

import { useTranslation } from 'react-i18next';
import { useAuth } from "@/components/auth/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { StatsGrid } from "@/components/ui/stats-grid";

import { apiFetch } from "@/lib/api";
import { useState } from "react";
import {
  Database,
  AlertTriangle,
  Trophy,
  Target,
  Users,
  TrendingUp,
} from "lucide-react";

interface UpdateProfileData {
  name?: string;
  email?: string;
}

interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function AccountPage() {
  const { user, refreshAuth } = useAuth();
  const { t } = useTranslation('account');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [seedMessage, setSeedMessage] = useState("");
  const [seedError, setSeedError] = useState("");

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage("");
    setProfileError("");

    const formData = new FormData(e.currentTarget);
    const data: UpdateProfileData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
    };

    // Only include fields that have changed
    if (data.name === user?.name) delete data.name;
    if (data.email === user?.email) delete data.email;

    if (Object.keys(data).length === 0) {
      setProfileMessage(t('noChangesToSave'));
      setIsUpdatingProfile(false);
      return;
    }

    try {
      await apiFetch("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      setProfileMessage("Profile updated successfully!");
      await refreshAuth();
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : t('failedToUpdateProfile')
      );
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdatingPassword(true);
    setPasswordMessage("");
    setPasswordError("");

    const formData = new FormData(e.currentTarget);
    const data: UpdatePasswordData = {
      currentPassword: formData.get("currentPassword") as string,
      newPassword: formData.get("newPassword") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    if (data.newPassword !== data.confirmPassword) {
      setPasswordError(t('newPasswordsDoNotMatch'));
      setIsUpdatingPassword(false);
      return;
    }

    if (data.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long");
      setIsUpdatingPassword(false);
      return;
    }

    try {
      await apiFetch("/auth/password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      setPasswordMessage("Password updated successfully!");
      e.currentTarget.reset();
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : t('failedToUpdatePassword')
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setSeedMessage("");
    setSeedError("");

    try {
      const response = await apiFetch("/api/seed", {
        method: "POST",
      });

      setSeedMessage(
        "Database seeded successfully! You can now browse leagues and see dummy data."
      );
    } catch (error: any) {
      setSeedError(error.message || t('failedToSeedDatabase'));
    } finally {
      setIsSeeding(false);
    }
  };

  // Mock data for manager profile stats
  const managerProfile = {
    level: 15,
    experience: 2450,
    nextLevelExp: 3000,
    totalMatches: 45,
    wins: 27,
    losses: 18,
    winRate: 60,
    currentRank: t('goldManager'),
    achievements: [
      {
        name: t('firstVictory'),
        description: t('firstVictoryDescription'),
        unlocked: true,
      },
      {
        name: t('draftMaster'),
        description: t('draftMasterDescription'),
        unlocked: true,
      },
      {
        name: t('leagueChampion'),
        description: t('leagueChampionDescription'),
        unlocked: false,
      },
      {
        name: "Perfect Season",
        description: "Win all matches in a season",
        unlocked: false,
      },
    ],
  };

  // Prepare stats data for StatsGrid
  const profileStats = [
    {
      icon: Trophy,
      value: managerProfile.wins,
      label: t('totalWins'),
      iconColor: "text-yellow-500",
    },
    {
      icon: Target,
      value: managerProfile.losses,
      label: t('totalLosses'),
      iconColor: "text-red-500",
    },
    {
      icon: Users,
      value: managerProfile.totalMatches,
      label: t('totalMatches'),
      iconColor: "text-blue-500",
    },
    {
      icon: TrendingUp,
      value: managerProfile.experience,
      label: t('experience'),
      iconColor: "text-green-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Manager Profile Header */}
      <PageHeader
        title={t('title')}
        subtitle={t('personalInformation')}
        gradientFrom="from-purple-600"
        gradientTo="to-pink-600"
        stats={{
          value: `${managerProfile.winRate}%`,
          label: t('winRate'),
        }}
        badge={{
          text: `Level ${managerProfile.level} - ${managerProfile.currentRank}`,
        }}
      />

      {/* Manager Stats */}
      <StatsGrid stats={profileStats} />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              {t('achievements')}
            </CardTitle>
            <CardDescription>
              {t('achievementsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {managerProfile.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    achievement.unlocked
                      ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                      : "bg-muted/50"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      achievement.unlocked
                        ? "bg-green-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    {achievement.unlocked ? (
                      <Trophy className="h-4 w-4 text-white" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        achievement.unlocked
                          ? "text-green-800 dark:text-green-200"
                          : "text-gray-500"
                      }`}
                    >
                      {achievement.name}
                    </p>
                    <p
                      className={`text-xs ${
                        achievement.unlocked
                          ? "text-green-600 dark:text-green-300"
                          : "text-gray-400"
                      }`}
                    >
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('profile')}</CardTitle>
            <CardDescription>
              {t('personalInformation')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t('name')}
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={user?.name || ""}
                  placeholder={t('enterName')}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t('email')}
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user?.email || ""}
                  placeholder={t('enterEmail')}
                />
              </div>
              {profileMessage && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  {profileMessage}
                </p>
              )}
              {profileError && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {profileError}
                </p>
              )}
              <Button type="submit" disabled={isUpdatingProfile}>
                {isUpdatingProfile ? t('updating') : t('updateProfile')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle>{t('changePassword')}</CardTitle>
            <CardDescription>
              {t('changePassword')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="currentPassword"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t('currentPassword')}
                </label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  placeholder={t('enterCurrentPassword')}
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="newPassword"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t('newPassword')}
                </label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder={t('enterNewPassword')}
                  minLength={8}
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t('confirmNewPassword')}
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder={t('confirmNewPassword')}
                  minLength={8}
                  required
                />
              </div>
              {passwordMessage && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  {passwordMessage}
                </p>
              )}
              {passwordError && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {passwordError}
                </p>
              )}
              <Button type="submit" disabled={isUpdatingPassword}>
                {isUpdatingPassword ? t('updatingPassword') : t('updatePassword')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Game Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              {t('gameDataManagement')}
            </CardTitle>
            <CardDescription>
              {t('resetGameDataDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  {t('warning')}
                </p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  {t('resetWarningDescription')}
                </p>
              </div>
            </div>

            {seedMessage && (
              <p className="text-sm text-green-600 dark:text-green-400">
                {seedMessage}
              </p>
            )}
            {seedError && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {seedError}
              </p>
            )}

            <Button
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              variant="destructive"
            >
              {isSeeding
                ? t('resettingGameData')
                : t('resetGameDataAndLoadSampleLeagues')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
