"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import type { League } from "../../lib/types";
import { useAuth } from "../../hooks/useAuth";
import { StatusBadge } from "../ui/status-badge";
import { Trophy, Users, Calendar, Clock, Target, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LeagueCardProps {
  league: League;
  onJoin?: (leagueId: string) => void;
  onLeave?: (leagueId: string) => void;
  onView?: (leagueId: string) => void;
}

export function LeagueCard({
  league,
  onJoin,
  onLeave,
  onView,
}: LeagueCardProps) {
  const { user } = useAuth();
  const { t } = useTranslation('leagues');
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  
  const isAdmin = league.adminId === user?.id;
  const isMember = league.leagueMembers.some(
    (member) => member.userId === user?.id
  );
  const hasTeam = league.teams.some((team) => team.ownerId === user?.id);

  const signupDeadline = new Date(league.signupDeadline);
  const isFull = league.teams.length >= league.maxTeams;

  useEffect(() => {
    setIsSignupOpen(league.status === "SIGNUP" && new Date() < signupDeadline);
  }, [league.status, signupDeadline]);

  // Mock data for enhanced UI - in a real app, this would come from your backend
  const mockLeaderboard = [
    { position: 1, name: t('championsUnited'), points: 45, wins: 15, losses: 0 },
    { position: 2, name: t('eliteSquad'), points: 42, wins: 14, losses: 1 },
    { position: 3, name: t('victoryFc'), points: 39, wins: 13, losses: 2 },
  ];

  const mockUpcomingEvent = {
    type:
      league.status === "SIGNUP"
        ? "draft"
        : league.status === "DRAFT_READY"
        ? "draft"
        : "match",
    title:
      league.status === "SIGNUP"
        ? t('draftDay')
        : league.status === "DRAFT_READY"
        ? t('draftBegins')
        : t('matchDay') + " 5",
    date:
      league.status === "SIGNUP"
        ? t('tomorrow') + " 2:00 PM"
        : league.status === "DRAFT_READY"
        ? "Today 7:00 PM"
        : t('friday') + " 8:00 PM",
    description:
      league.status === "SIGNUP"
        ? t('finalDraftPreparation')
        : league.status === "DRAFT_READY"
        ? t('liveDraftSession')
        : t('championsUnitedVsEliteSquad'),
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "draft":
        return <Target className="h-4 w-4" />;
      case "match":
        return <Zap className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200 border-2 hover:border-blue-200 overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-5 w-5 text-white" />
              <CardTitle className="text-xl font-bold text-white">
                {league.name}
              </CardTitle>
            </div>
            {league.description && (
              <CardDescription className="text-sm text-blue-100">
                {league.description}
              </CardDescription>
            )}
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-md px-2 py-1">
            <StatusBadge status={league.status} />
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-4">
          {/* League Stats */}
          <div className="grid grid-cols-3 gap-4 py-2">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('teams')}
                </span>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {league.teams.length}/{league.maxTeams}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('method')}
                </span>
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {league.draftMethod}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('deadline')}
                </span>
              </div>
              <div className="text-xs font-bold text-gray-900 dark:text-white">
                {signupDeadline.toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Leaderboard Preview */}
          <div className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-semibold">{t('top3')}</span>
            </div>
            <div className="space-y-2">
              {mockLeaderboard.map((team) => (
                <div
                  key={team.position}
                  className="flex items-center justify-between text-xs py-1 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-muted-foreground">
                      #{team.position}
                    </span>
                    <span className="font-medium truncate max-w-[120px]">
                      {team.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="">{team.points}P</span>
                    <span className="text-green-600">{team.wins}W</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Event */}
          <div className="p-3">
            <div className="flex items-center gap-2 mb-3">
              {getEventIcon(mockUpcomingEvent.type)}
              <span className="text-sm font-semibold">{t('nextEvent')}</span>
            </div>
            <div className="text-sm space-y-1">
              <div className="font-medium">{mockUpcomingEvent.title}</div>
              <div className="text-xs">{mockUpcomingEvent.date}</div>
              <div className="text-xs">{mockUpcomingEvent.description}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {onView && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(league.id)}
                className="flex-1"
              >
{t('viewDetails')}
              </Button>
            )}

            {!isMember && isSignupOpen && !isFull && onJoin && (
              <Button
                size="sm"
                onClick={() => onJoin(league.id)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
{t('joinLeague')}
              </Button>
            )}

            {isMember && !isAdmin && onLeave && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onLeave(league.id)}
                className="flex-1"
              >
{t('leaveLeague')}
              </Button>
            )}

            {isMember && !hasTeam && isSignupOpen && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onView?.(league.id)}
                className="flex-1"
              >
{t('createTeam')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
