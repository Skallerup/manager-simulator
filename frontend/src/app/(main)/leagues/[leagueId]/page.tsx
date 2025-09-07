"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "../../../../lib/api";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Trophy, ArrowLeft, Users, Calendar } from "lucide-react";

interface League {
  id: string;
  name: string;
  description: string;
  level: number;
  maxTeams: number;
  status: string;
  teams: Array<{
    id: string;
    name: string;
    isBot: boolean;
  }>;
  seasons: Array<{
    id: string;
    year: number;
    status: string;
  }>;
}

// Generate standings from actual teams - all zeros since no matches played yet
const generateStandings = (teams: Array<{id: string, name: string, isBot: boolean}>) => {
  return teams.map((team, index) => ({
    position: index + 1,
    team: team.name,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDiff: 0,
    points: 0,
    isBot: team.isBot
  }));
};

export default function LeagueDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [league, setLeague] = useState<League | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeague = async () => {
      try {
        const data = await apiFetch<League>(`/api/leagues/${params.leagueId}`);
        setLeague(data);
      } catch (err) {
        console.error('Failed to fetch league:', err);
        setError('Failed to load league');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.leagueId) {
      fetchLeague();
    }
  }, [params.leagueId]);

  const getLevelInfo = (level: number) => {
    switch (level) {
      case 1:
        return { name: 'Superliga', color: 'text-yellow-600' };
      case 2:
        return { name: '1. Division', color: 'text-blue-600' };
      case 3:
        return { name: '2. Division', color: 'text-green-600' };
      default:
        return { name: 'Unknown', color: 'text-gray-600' };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error || !league) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/leagues')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tilbage til Ligaer
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Fejl</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error || 'Liga ikke fundet'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const levelInfo = getLevelInfo(league.level);
  const standings = generateStandings(league.teams);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/leagues')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tilbage til Ligaer
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className={`h-8 w-8 ${levelInfo.color}`} />
              {league.name}
            </h1>
            <p className="text-gray-600">{levelInfo.name} • {league.teams.length} hold</p>
          </div>
        </div>
      </div>

      {/* League Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Stilling
          </CardTitle>
          <CardDescription>
            Aktuel liga-tabel for {league.name} - Ingen kampe spillet endnu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-3 font-bold text-gray-700 text-sm uppercase tracking-wide">#</th>
                  <th className="text-left py-4 px-3 font-bold text-gray-700 text-sm uppercase tracking-wide">Hold</th>
                  <th className="text-center py-4 px-3 font-bold text-gray-700 text-sm uppercase tracking-wide">K</th>
                  <th className="text-center py-4 px-3 font-bold text-gray-700 text-sm uppercase tracking-wide">V</th>
                  <th className="text-center py-4 px-3 font-bold text-gray-700 text-sm uppercase tracking-wide">U</th>
                  <th className="text-center py-4 px-3 font-bold text-gray-700 text-sm uppercase tracking-wide">T</th>
                  <th className="text-center py-4 px-3 font-bold text-gray-700 text-sm uppercase tracking-wide">Mål+</th>
                  <th className="text-center py-4 px-3 font-bold text-gray-700 text-sm uppercase tracking-wide">Mål-</th>
                  <th className="text-center py-4 px-3 font-bold text-gray-700 text-sm uppercase tracking-wide">Diff</th>
                  <th className="text-center py-4 px-3 font-bold text-gray-700 text-sm uppercase tracking-wide">P</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((team, index) => (
                  <tr 
                    key={team.position}
                    className={`border-b transition-colors hover:bg-gray-50/50 ${
                      team.position <= 3 ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-400' : 
                      team.position >= 10 ? 'bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-l-red-400' : 
                      'bg-white'
                    }`}
                  >
                    <td className="py-4 px-3 font-semibold text-gray-900">
                      {team.position <= 3 ? (
                        <span className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="text-lg font-bold text-gray-900">{team.position}</span>
                        </span>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">{team.position}</span>
                      )}
                    </td>
                    <td className="py-4 px-3 font-semibold">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-900 font-medium">{team.team}</span>
                        {team.isBot && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full border border-gray-200 font-medium">
                            Bot
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-3 text-center text-gray-700 font-medium">{team.played}</td>
                    <td className="py-4 px-3 text-center text-gray-700 font-medium">{team.won}</td>
                    <td className="py-4 px-3 text-center text-gray-700 font-medium">{team.drawn}</td>
                    <td className="py-4 px-3 text-center text-gray-700 font-medium">{team.lost}</td>
                    <td className="py-4 px-3 text-center text-gray-700 font-medium">{team.goalsFor}</td>
                    <td className="py-4 px-3 text-center text-gray-700 font-medium">{team.goalsAgainst}</td>
                    <td className="py-4 px-3 text-center">
                      <span className={`font-semibold ${
                        team.goalDiff > 0 ? 'text-green-600' : 
                        team.goalDiff < 0 ? 'text-red-600' : 
                        'text-gray-700'
                      }`}>
                        {team.goalDiff > 0 ? '+' : ''}{team.goalDiff}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-center">
                      <span className="font-bold text-lg text-gray-900">{team.points}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Legend */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Forklaring</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400 rounded"></div>
                <span className="text-gray-700 font-medium">Oprykning (top 3)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-red-100 to-rose-100 border-2 border-red-400 rounded"></div>
                <span className="text-gray-700 font-medium">Nedrykning (bottom 3)</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-gray-700 font-medium">Mesterskab (top 3)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full border border-gray-200 font-medium">Bot</span>
                <span className="text-gray-700 font-medium">Bot hold</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
