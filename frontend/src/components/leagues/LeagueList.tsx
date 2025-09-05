"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLeagues } from "../../hooks/useLeagues";
import { LeagueCard } from "./LeagueCard";
import { CreateLeague } from "./CreateLeague";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useTranslation } from "react-i18next";

interface LeagueListProps {}

export function LeagueList({}: LeagueListProps) {
  const router = useRouter();
  const { leagues, isLoading, error, joinLeague, leaveLeague } = useLeagues();
  const { t } = useTranslation('leagues');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleJoinLeague = async (leagueId: string) => {
    try {
      await joinLeague(leagueId);
      // You might want to show a success toast here
    } catch (error: unknown) {
      console.error("Failed to join league:", error);
      // You might want to show an error toast here
    }
  };

  const handleLeaveLeague = async (leagueId: string) => {
    try {
      await leaveLeague(leagueId);
      // You might want to show a success toast here
    } catch (error: unknown) {
      console.error("Failed to leave league:", error);
      // You might want to show an error toast here
    }
  };

  const handleViewLeague = (leagueId: string) => {
    router.push(`/leagues/${leagueId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t('myLeagues')}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('myLeagues')}</h2>
        <Button onClick={() => setShowCreateForm(true)}>
          {t('createNewLeague')}
        </Button>
      </div>

      <CreateLeague
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSuccess={() => setShowCreateForm(false)}
      />

      {leagues.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('noLeaguesYet')}</CardTitle>
            <CardDescription>
              {t('noLeaguesDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowCreateForm(true)}>
{t('createFirstLeague')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leagues.map((league) => (
            <LeagueCard
              key={league.id}
              league={league}
              onJoin={handleJoinLeague}
              onLeave={handleLeaveLeague}
              onView={handleViewLeague}
            />
          ))}
        </div>
      )}
    </div>
  );
}
