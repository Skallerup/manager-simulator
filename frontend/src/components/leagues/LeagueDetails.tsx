"use client";

import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useLeague } from "../../hooks/useLeagues";
import { useTeams } from "../../hooks/useTeams";
import { CreateTeam } from "../teams/CreateTeam";
import { TeamCard } from "../teams/TeamCard";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useAuth } from "../../hooks/useAuth";
import { StatsCard } from "../ui/stats-card";
import { Leaderboard } from "../ui/leaderboard";
import { UpcomingEvents } from "../ui/upcoming-events";
import { MemberCard } from "../ui/member-card";
import { StatusBadge } from "../ui/status-badge";
import {
  Trophy,
  Users,
  Calendar,
  Clock,
  Target,
  ArrowLeft,
  Shield,
} from "lucide-react";

interface LeagueDetailsProps {
  leagueId: string;
  onBack?: () => void;
}

export function LeagueDetails({ leagueId, onBack }: LeagueDetailsProps) {
  const { user } = useAuth();
  const { t } = useTranslation('leagues');
  const {
    league,
    isLoading: leagueLoading,
    error: leagueError,
  } = useLeague(leagueId);
  const { teams, isLoading: teamsLoading, createTeam } = useTeams(leagueId);
  const [showCreateTeamForm, setShowCreateTeamForm] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  // Calculate derived values
  const isFull = league ? league.teams.length >= league.maxTeams : false;

  // useEffect must be called before any conditional returns
  useEffect(() => {
    if (league) {
      setIsSignupOpen(league.status === "ACTIVE" && !isFull);
    }
  }, [league, isFull]);

  if (leagueLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (leagueError || !league) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{leagueError || t('leagueNotFound')}</p>
          {onBack && (
            <Button onClick={onBack} className="mt-4">
              Back to Leagues
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const isAdmin = league.adminId === user?.id;
  const isMember = league.leagueMembers?.some(
    (member) => member.userId === user?.id
  ) || false;
  const hasTeam = league.teams.some((team) => team.ownerId === user?.id);

  // Mock data for enhanced UI - in a real app, this would come from your backend
  const mockLeaderboard = [
    { position: 1, name: "Champions United", points: 45, wins: 15, losses: 0 },
    { position: 2, name: "Elite Squad", points: 42, wins: 14, losses: 1 },
    { position: 3, name: "Victory FC", points: 39, wins: 13, losses: 2 },
    { position: 4, name: "Thunder Bolts", points: 36, wins: 12, losses: 3 },
    { position: 5, name: "Storm Riders", points: 33, wins: 11, losses: 4 },
  ];

  const mockUpcomingEvents = [
    {
      type: "match" as const,
      title: "Match Day 1",
      date: "Tomorrow 2:00 PM",
      description: "Season opener - Champions United vs Elite Squad",
    },
    {
      type: "match" as const,
      title: "Match Day 2",
      date: "Friday 8:00 PM",
      description: "Victory FC vs Thunder Bolts",
    },
    {
      type: "match" as const,
      title: "Match Day 3",
      date: "Next Monday",
      description: "Storm Riders vs Champions United",
    },
  ];

  return (
    <div className="space-y-6">
      {/* League Header with Gradient */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button
                variant="outline"
                onClick={onBack}
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-6 w-6 text-white" />
                <h1 className="text-3xl font-bold">{league.name}</h1>
              </div>
              {league.description && (
                <p className="text-green-100">{league.description}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {league.teams.length}/{league.maxTeams}
            </div>
            <div className="text-sm text-green-100">Teams</div>
            <div className="mt-2">
              <StatusBadge status={league.status} />
            </div>
          </div>
        </div>
      </div>

      {/* League Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          icon={Users}
          value={league.teams.length}
          label="Teams"
          iconColor="text-blue-500"
        />
        <StatsCard
          icon={Calendar}
          value={league.status}
          label="Status"
          iconColor="text-green-500"
        />
        <StatsCard
          icon={Clock}
          value={league.maxTeams}
          label="Max Teams"
          iconColor="text-orange-500"
        />
        <StatsCard
          icon={Shield}
          value={league.admin?.name || league.admin?.email || "System"}
          label="Admin"
          iconColor="text-purple-500"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Leaderboard entries={mockLeaderboard} />
        <UpcomingEvents events={mockUpcomingEvents} />
      </div>

      <MemberCard members={league.leagueMembers || []} />

      {/* Teams */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Teams
            </CardTitle>
            {isMember && !hasTeam && isSignupOpen && !isFull && (
              <Button onClick={() => setShowCreateTeamForm(true)}>
                Create Team
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <CreateTeam
            leagueId={leagueId}
            open={showCreateTeamForm}
            onOpenChange={setShowCreateTeamForm}
          />

          {teamsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No teams yet</p>
              <p className="text-gray-400 text-sm">
                Be the first to create a team in this league!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
