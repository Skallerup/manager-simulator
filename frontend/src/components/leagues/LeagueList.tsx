"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useTranslation } from "react-i18next";
import { Trophy, Users, TrendingUp, TrendingDown, Star, Search } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";

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

interface LeagueListProps {}

export function LeagueList({}: LeagueListProps) {
  const router = useRouter();
  const { t } = useTranslation('leagues');
  const { user } = useAuth();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [userLeague, setUserLeague] = useState<League | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const data = await apiFetch<League[]>('/api/leagues');
        setLeagues(data);

        // Find user's league
        if (user) {
          const response = await apiFetch<{league: League, userTeam: any}>('/api/leagues/user/current');
          if (response) {
            setUserLeague(response.league);
          }
        }
      } catch (err) {
        console.error('Failed to fetch leagues:', err);
        setError('Failed to load leagues');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeagues();
  }, [user]);

  const handleViewLeague = (leagueId: string) => {
    router.push(`/leagues/${leagueId}`);
  };

  // Filter leagues and teams based on search query
  const filteredLeagues = leagues.filter(league => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      league.name.toLowerCase().includes(query) ||
      league.description.toLowerCase().includes(query) ||
      league.teams?.some(team => 
        team.name.toLowerCase().includes(query)
      )
    );
  });

  const getLevelInfo = (level: number) => {
    switch (level) {
      case 1:
        return { name: 'Superliga', color: 'text-yellow-600', icon: Trophy };
      case 2:
        return { name: '1. Division', color: 'text-blue-600', icon: TrendingUp };
      case 3:
        return { name: '2. Division', color: 'text-green-600', icon: TrendingDown };
      default:
        return { name: 'Unknown', color: 'text-gray-600', icon: Trophy };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Ligaer</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
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
          <CardTitle>Fejl</CardTitle>
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
        <h2 className="text-2xl font-bold">Ligaer</h2>
      </div>

      {/* User's League Section */}
      {userLeague && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">Min Liga</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50" onClick={() => handleViewLeague(userLeague.id)}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    {userLeague.name}
                  </CardTitle>
                  <span className="text-sm font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                    Din Liga
                  </span>
                </div>
                <CardDescription>{userLeague.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Hold: {userLeague.teams?.length || 0}/{userLeague.maxTeams}
                    </span>
                    <span className="text-gray-500">
                      {userLeague.teams?.filter(team => !team.isBot).length || 0} spillere, {userLeague.teams?.filter(team => team.isBot).length || 0} bots
                    </span>
                  </div>

                  {userLeague.seasons && userLeague.seasons.length > 0 && (
                    <div className="text-sm text-gray-600">
                      Sæson: {userLeague.seasons[0].year}
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewLeague(userLeague.id);
                      }}
                    >
                      Se min liga
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* All Leagues Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Alle Ligaer</h3>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Søg efter ligaer eller hold..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {filteredLeagues.length === 0 ? (
          <div className="text-center py-8">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen resultater</h3>
            <p className="mt-1 text-sm text-gray-500">
              Prøv at søge efter noget andet eller tjek stavningen.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
            {filteredLeagues.map((league) => {
              const levelInfo = getLevelInfo(league.level);
              const Icon = levelInfo.icon;
              const userTeams = league.teams?.filter(team => !team.isBot) || [];
              const botTeams = league.teams?.filter(team => team.isBot) || [];

              return (
                <Card key={league.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewLeague(league.id)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${levelInfo.color}`} />
                        {league.name}
                      </CardTitle>
                      <span className={`text-sm font-medium px-2 py-1 rounded-full bg-gray-100 ${levelInfo.color}`}>
                        Niveau {league.level}
                      </span>
                    </div>
                    <CardDescription>{league.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Hold: {league.teams?.length || 0}/{league.maxTeams}
                        </span>
                        <span className="text-gray-500">
                          {userTeams.length} spillere, {botTeams.length} bots
                        </span>
                      </div>

                      {league.seasons && league.seasons.length > 0 && (
                        <div className="text-sm text-gray-600">
                          Sæson: {league.seasons[0].year}
                        </div>
                      )}

                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewLeague(league.id);
                          }}
                        >
                          Se liga
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}