"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { apiFetch } from "@/lib/api";
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
  Gamepad2,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation('dashboard');
  const [teamData, setTeamData] = useState<any>(null);
  const [leagueData, setLeagueData] = useState<any>(null);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch team data
        const team = await apiFetch('/api/teams/my-team');
        setTeamData(team);

        // Fetch league data
        const league = await apiFetch('/api/leagues/user/current');
        setLeagueData(league);

        // Fetch match history
        const matches = await apiFetch('/api/matches/bot');
        setMatchHistory(matches || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Calculate real stats from actual data
  const totalMatches = matchHistory.length;
  const wins = matchHistory.filter(match => match.result === 'win').length;
  const losses = matchHistory.filter(match => match.result === 'loss').length;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  const managerStats = {
    totalMatches,
    wins,
    losses,
    winRate,
    currentLeague: leagueData?.league?.name || 'Ingen liga',
    teamName: teamData?.name || 'Ingen hold',
  };

  const recentActivity = matchHistory.slice(0, 4).map(match => ({
    type: match.result === 'win' ? 'win' as const : 'loss' as const,
    message: `${match.result === 'win' ? 'Sejr' : 'Nederlag'} mod ${match.opponentName}`,
    time: new Date(match.createdAt).toLocaleDateString('da-DK'),
  }));

  const upcomingEvents = [
    {
      title: 'Næste ligakamp',
      date: 'Snart',
      type: "match" as const,
    },
    {
      title: 'Transfervindue åbent',
      date: 'Altid',
      type: "transfer" as const,
    },
  ];

  // Prepare stats data for StatsGrid
  const dashboardStats = [
    {
      icon: Trophy,
      value: wins,
      label: 'Sejre',
      iconColor: "text-yellow-500",
    },
    {
      icon: Target,
      value: losses,
      label: 'Nederlag',
      iconColor: "text-red-500",
    },
    {
      icon: Users,
      value: totalMatches,
      label: 'Kampe spillet',
      iconColor: "text-blue-500",
    },
    {
      icon: TrendingUp,
      value: `${winRate}%`,
      label: 'Sejrsrate',
      iconColor: "text-purple-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Manager Header */}
      <PageHeader
        title="Manager Hub"
        subtitle={`Velkommen tilbage, ${user?.name || user?.email}!`}
        gradientFrom="from-blue-600"
        gradientTo="to-purple-600"
        stats={{
          value: `${managerStats.winRate}%`,
          label: 'Sejrsrate',
        }}
        badge={{
          text: managerStats.currentLeague,
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
          <CardTitle>Hurtige handlinger</CardTitle>
          <CardDescription>Hop direkte ind i spillet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/leagues">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col gap-2"
              >
                <Trophy className="h-6 w-6" />
                <span>Alle Ligaer</span>
              </Button>
            </Link>
            <Link href="/my-team">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col gap-2"
              >
                <Users className="h-6 w-6" />
                <span>Mit Hold</span>
              </Button>
            </Link>
            <Link href="/match">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col gap-2"
              >
                <Gamepad2 className="h-6 w-6" />
                <span>Kamp</span>
              </Button>
            </Link>
            <Link href="/transfers">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col gap-2"
              >
                <ShoppingCart className="h-6 w-6" />
                <span>Transfers</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
