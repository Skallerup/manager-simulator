"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from 'react-i18next';
import { useBrowseLeagues } from "@/hooks/useLeagues";
import { LeagueCard } from "@/components/leagues/LeagueCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Search } from "lucide-react";
import { FootballSpinner } from "@/components/ui/football-spinner";

export default function BrowseLeaguesPage() {
  const router = useRouter();
  const { leagues, isLoading, error, joinLeague } = useBrowseLeagues();
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation('leagues');

  const handleJoinLeague = async (leagueId: string) => {
    try {
      await joinLeague(leagueId);
      // You might want to show a success toast here
    } catch (error: unknown) {
      console.error("Failed to join league:", error);
      // You might want to show an error toast here
    }
  };

  const handleViewLeague = (leagueId: string) => {
    router.push(`/leagues/${leagueId}`);
  };

  // Filter leagues based on search term
  const filteredLeagues = leagues.filter(
    (league) =>
      league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (league.description &&
        league.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t('browseLeagues')}</h2>
        </div>

        {/* Loading state with football spinner */}
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <FootballSpinner size="lg" />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {t('scoutingLeagues')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('findingBestDraftOpportunities')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scouting Header */}
      <PageHeader
        title={t('leagueScouting')}
        subtitle={t('discoverBestCompetitions')}
        gradientFrom="from-orange-600"
        gradientTo="to-red-600"
        stats={{
          value: filteredLeagues.length,
          label: t('availableLeagues'),
        }}
      />

      {/* Scouting Tools */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t('scoutLeaguesByName')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            {t('filterByStatus')}
          </Button>
          <Button variant="outline" size="sm">
            {t('sortByPopularity')}
          </Button>
        </div>
      </div>

      {filteredLeagues.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('noLeaguesDiscovered')}</CardTitle>
            <CardDescription>
              {searchTerm
                ? t('noLeaguesMatchCriteria', { searchTerm })
                : t('noPublicLeaguesAvailable')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                {t('clearSearch')}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {t('scoutedLeagues')} ({filteredLeagues.length})
            </h3>
            <div className="text-sm text-muted-foreground">
              {t('clickToJoinCompetition')}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLeagues.map((league) => (
              <LeagueCard
                key={league.id}
                league={league}
                onJoin={handleJoinLeague}
                onLeave={() => {}} // No leave action for browse page
                onView={handleViewLeague}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
