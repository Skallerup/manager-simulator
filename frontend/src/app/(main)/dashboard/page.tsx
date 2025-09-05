"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatsGrid } from "@/components/ui/stats-grid";
import { RecentActivity } from "@/components/ui/recent-activity";
import { UpcomingEvents } from "@/components/ui/upcoming-events";
import {
  Trophy,
  Users,
  Target,
  TrendingUp,
  Calendar,
  Star,
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation('dashboard');

  // Mock data for game stats - in a real app, this would come from your backend
  const managerStats = {
    totalLeagues: 3,
    activeLeagues: 2,
    completedLeagues: 1,
    totalWins: 12,
    totalLosses: 8,
    winRate: 60,
    currentRank: "Gold Manager",
    nextRank: "Platinum Manager",
    rankProgress: 75,
  };

  const recentActivity = [
    {
      type: "win" as const,
      message: t('victoryInPremierLeague'),
      time: `2 ${t('hoursAgo')}`,
    },
    {
      type: "draft" as const,
      message: t('draftedMessi'),
      time: `1 ${t('daysAgo')}`,
    },
    {
      type: "league" as const,
      message: t('joinedChampionsLeague'),
      time: `3 ${t('daysAgo')}`,
    },
    {
      type: "achievement" as const,
      message: t('unlockedDraftMaster'),
      time: "1 week ago",
    },
  ];

  const upcomingEvents = [
    {
      title: t('championsLeagueDraft'),
      date: `${t('tomorrow')} 2:00 PM`,
      type: "draft" as const,
    },
    {
      title: t('premierLeagueMatch'),
      date: `${t('friday')} 7:00 PM`,
      type: "match" as const,
    },
    {
      title: t('transferWindowOpens'),
      date: t('nextMonday'),
      type: "transfer" as const,
    },
  ];

  // Prepare stats data for StatsGrid
  const dashboardStats = [
    {
      icon: Trophy,
      value: managerStats.totalWins,
      label: t('wins'),
      iconColor: "text-yellow-500",
    },
    {
      icon: Users,
      value: managerStats.activeLeagues,
      label: t('activeLeagues'),
      iconColor: "text-blue-500",
    },
    {
      icon: Target,
      value: managerStats.totalLeagues,
      label: t('totalLeagues'),
      iconColor: "text-green-500",
    },
    {
      icon: TrendingUp,
      value: `${managerStats.winRate}%`,
      label: t('winRate'),
      iconColor: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Manager Header */}
      <PageHeader
        title={t('managerHub')}
        subtitle={`${t('welcomeBack')}, ${user?.name || user?.email}!`}
        gradientFrom="from-blue-600"
        gradientTo="to-purple-600"
        stats={{
          value: `${managerStats.winRate}%`,
          label: t('winRate'),
        }}
        badge={{
          text: t('goldManager'),
        }}
      />

      {/* Quick Stats */}
      <StatsGrid stats={dashboardStats} />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <RecentActivity activities={recentActivity} />

        {/* Upcoming Events */}
        <UpcomingEvents events={upcomingEvents} />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('quickActions')}</CardTitle>
          <CardDescription>Jump into the action</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/leagues">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col gap-2"
              >
                <Trophy className="h-6 w-6" />
                <span>{t('myLeagues')}</span>
              </Button>
            </Link>
            <Link href="/browse-leagues">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col gap-2"
              >
                <Users className="h-6 w-6" />
                <span>{t('scoutLeagues')}</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full h-20 flex flex-col gap-2"
            >
              <Target className="h-6 w-6" />
              <span>{t('createLeague')}</span>
            </Button>
            <Button
              variant="outline"
              className="w-full h-20 flex flex-col gap-2"
            >
              <TrendingUp className="h-6 w-6" />
              <span>{t('leaderboard')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
