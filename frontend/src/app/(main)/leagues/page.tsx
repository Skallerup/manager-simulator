"use client";

import { LeagueList } from "../../../components/leagues/LeagueList";
import { PageHeader } from "@/components/ui/page-header";
import { StatsGrid } from "@/components/ui/stats-grid";
import { Trophy, Users, Calendar, Target } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function LeaguesPage() {
  const { t } = useTranslation('leagues');
  
  // Mock data for league overview stats
  const leagueStats = {
    totalLeagues: 3,
    activeLeagues: 2,
    upcomingDrafts: 1,
    totalWins: 12,
    winRate: 60,
  };

  // Prepare stats data for StatsGrid
  const leaguesStats = [
    {
      icon: Trophy,
      value: leagueStats.totalLeagues,
      label: t('totalLeagues'),
      iconColor: "text-yellow-500",
    },
    {
      icon: Users,
      value: leagueStats.activeLeagues,
      label: t('active'),
      iconColor: "text-green-500",
    },
    {
      icon: Calendar,
      value: leagueStats.upcomingDrafts,
      label: t('upcomingDrafts'),
      iconColor: "text-blue-500",
    },
    {
      icon: Target,
      value: leagueStats.totalWins,
      label: t('totalWins'),
      iconColor: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* League Overview Header */}
      <PageHeader
        title={t('myCompetitions')}
        subtitle={t('manageLeaguesSubtitle')}
        gradientFrom="from-green-600"
        gradientTo="to-blue-600"
        stats={{
          value: `${leagueStats.winRate}%`,
          label: t('winRate'),
        }}
      />

      {/* League Stats */}
      <StatsGrid stats={leaguesStats} />

      {/* League List */}
      <LeagueList />
    </div>
  );
}
