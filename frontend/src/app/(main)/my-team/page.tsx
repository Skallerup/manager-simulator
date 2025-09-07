"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Trophy, Target, Calendar, Star, Crown, Settings } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { authApiFetch } from "@/lib/api";
import { PlayerAvatar } from "@/components/player-avatar";

interface Player {
  id: string;
  name: string;
  position: string;
  formationPosition?: string;
  age: number;
  rating: number;
  isCaptain: boolean;
  isStarter: boolean;
}

interface TeamData {
  id: string;
  name: string;
  formation: string;
  colors: { primary: string; secondary: string } | null;
  logo: string | null;
  budget: number;
  overallRating: number;
  players: Player[];
  createdAt: string;
  updatedAt: string;
}

export default function MyTeamPage() {
  const { user } = useAuth();
  const { t } = useTranslation('team');
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingFormation, setIsUpdatingFormation] = useState(false);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const data = await authApiFetch('/api/teams/my-team');
        if (data) {
          setTeamData(data);
        } else {
          setError('Failed to load team data');
        }
      } catch (err) {
        setError('Failed to load team data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTeamData();
    }
  }, [user]);

  const setCaptain = async (playerId: string) => {
    if (!teamData) return;
    
    try {
      const updatedTeam = await authApiFetch(`/api/teams/${teamData.id}/captain/${playerId}`, {
        method: 'PUT'
      });
      
      if (updatedTeam) {
        setTeamData(updatedTeam);
      } else {
        setError('Failed to set captain');
      }
    } catch (err) {
      setError('Failed to set captain');
    }
  };

  const updateFormation = async (formation: string) => {
    if (!teamData) return;
    
    try {
      setIsUpdatingFormation(true);
      const response = await authApiFetch(`/api/teams/${teamData.id}/formation`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formation })
      });
      
      if (response) {
        // Refresh team data
        const updatedTeam = await authApiFetch('/api/teams/my-team');
        if (updatedTeam) {
          setTeamData(updatedTeam);
        }
      } else {
        setError('Failed to update formation');
      }
    } catch (err) {
      setError('Failed to update formation');
    } finally {
      setIsUpdatingFormation(false);
    }
  };

  const swapPlayers = async (fromPlayerId: string, toPlayerId: string) => {
    if (!teamData) return;
    
    try {
      const response = await authApiFetch(`/api/teams/${teamData.id}/swap-players`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromPlayerId, toPlayerId })
      });
      
      if (response) {
        // Refresh team data
        const updatedTeam = await authApiFetch('/api/teams/my-team');
        if (updatedTeam) {
          setTeamData(updatedTeam);
        }
      } else {
        setError('Failed to swap players');
      }
    } catch (err) {
      setError('Failed to swap players');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Indlæser holddata...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !teamData) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Intet hold fundet'}</p>
          <Button onClick={() => window.location.reload()}>
            Prøv igen
          </Button>
        </div>
      </div>
    );
  }

  const getPositionColor = (position: string) => {
    switch (position) {
      case "GOALKEEPER": return "bg-blue-100 text-blue-800";
      case "DEFENDER": return "bg-green-100 text-green-800";
      case "MIDFIELDER": return "bg-yellow-100 text-yellow-800";
      case "ATTACKER": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPositionName = (position: string) => {
    switch (position) {
      case "GOALKEEPER": return "Målmand";
      case "DEFENDER": return "Forsvar";
      case "MIDFIELDER": return "Midtbane";
      case "ATTACKER": return "Angriber";
      default: return position;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 85) return "text-green-600";
    if (rating >= 80) return "text-yellow-600";
    if (rating >= 75) return "text-orange-600";
    return "text-red-600";
  };

  const getLogoEmoji = (logo: string | null) => {
    switch (logo) {
      case "shield": return "🛡️";
      case "star": return "⭐";
      case "crown": return "👑";
      case "fire": return "🔥";
      case "lightning": return "⚡";
      default: return "⚽";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Team Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
            style={{ backgroundColor: teamData.colors?.primary || '#3B82F6' }}
          >
            {getLogoEmoji(teamData.logo)}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{teamData.name}</h1>
            <p className="text-muted-foreground">Formation: {teamData.formation}</p>
            <p className="text-sm text-muted-foreground">Samlet rating: {teamData.overallRating}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={teamData.formation} onValueChange={updateFormation} disabled={isUpdatingFormation}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Formation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4-4-2">4-4-2</SelectItem>
              <SelectItem value="4-3-3">4-3-3</SelectItem>
              <SelectItem value="3-5-2">3-5-2</SelectItem>
              <SelectItem value="5-3-2">5-3-2</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Rediger Hold
          </Button>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Samlet Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamData.overallRating}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spillere</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamData.players.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(teamData.budget / 100).toLocaleString()} kr</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kaptajn</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {teamData.players.find(p => p.isCaptain)?.name || 'Ingen'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formation View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            Formation: {teamData.formation}
          </CardTitle>
          <CardDescription>
            Din start-11 i {teamData.formation} formation. Træk spillere fra bænken for at skifte dem ud.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gradient-to-b from-green-400 to-green-600 rounded-lg p-8 min-h-[400px]">
            {/* Football field background */}
            <div className="absolute inset-0 bg-green-600 rounded-lg opacity-20"></div>
            <div className="absolute inset-0 border-4 border-white rounded-lg"></div>
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white"></div>
            <div className="absolute top-1/2 left-0 w-16 h-16 border-2 border-white rounded-full"></div>
            <div className="absolute top-1/2 right-0 w-16 h-16 border-2 border-white rounded-full"></div>
            
            {/* Formation positions */}
            <div className="relative z-10 grid grid-cols-11 gap-2 h-full">
              {teamData.players
                .filter(player => player.isStarter)
                .slice(0, 11)
                .map((player, index) => (
                  <div
                    key={player.id}
                    className="flex flex-col items-center p-2 bg-white/90 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => {/* Handle player click */}}
                  >
                    <PlayerAvatar 
                      playerName={player.name}
                      position={player.position}
                      size={32}
                      className="rounded-full"
                    />
                    <span className="text-xs font-medium mt-1 text-center">{player.name}</span>
                    <span className="text-xs text-gray-500">{player.formationPosition}</span>
                    {player.isCaptain && (
                      <Crown className="w-3 h-3 text-yellow-500" />
                    )}
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Players List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Trup ({teamData.players.length} spillere)
          </CardTitle>
          <CardDescription>
            Din nuværende trup og spillerrating. Klik "Sæt Kaptajn" for at gøre en spiller til din holdkaptajn (+5 bonus til alle statistikker).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Starters */}
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">Start-11</h4>
              {teamData.players
                .filter(player => player.isStarter)
                .map((player) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors ${
                      player.isCaptain ? 'ring-2 ring-yellow-400 bg-yellow-100' : 'bg-green-50'
                    }`}
                  >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <PlayerAvatar 
                      playerName={player.name}
                      position={player.position}
                      size={40}
                      className="rounded-full"
                    />
                    {player.isCaptain && (
                      <Crown className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className={`font-medium ${player.isCaptain ? 'text-gray-900' : ''}`}>{player.name}</p>
                      {player.isCaptain && (
                        <Badge className="bg-yellow-200 text-yellow-900 border-yellow-300">
                          Kaptajn
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPositionColor(player.position)}>
                        {getPositionName(player.position)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Alder: {player.age}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    <span className={`font-bold ${getRatingColor(player.rating)}`}>
                      {player.rating}
                    </span>
                  </div>
                      {!player.isCaptain && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCaptain(player.id)}
                        >
                          Sæt Kaptajn
                        </Button>
                      )}
                </div>
              </div>
            ))}
            </div>

            {/* Substitutes */}
            <div className="space-y-2 mt-6">
              <h4 className="font-semibold text-blue-600">Udskiftere (5)</h4>
              {teamData.players
                .filter(player => !player.isStarter)
                .map((player) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors ${
                      player.isCaptain ? 'ring-2 ring-yellow-400 bg-yellow-100' : 'bg-blue-50'
                    }`}
                  >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <PlayerAvatar 
                      playerName={player.name}
                      position={player.position}
                      size={40}
                      className="rounded-full"
                    />
                    {player.isCaptain && (
                      <Crown className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className={`font-medium ${player.isCaptain ? 'text-gray-900' : ''}`}>{player.name}</p>
                      {player.isCaptain && (
                        <Badge className="bg-yellow-200 text-yellow-900 border-yellow-300">
                          Kaptajn
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPositionColor(player.position)}>
                        {getPositionName(player.position)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Alder: {player.age}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    <span className={`font-bold ${getRatingColor(player.rating)}`}>
                      {player.rating}
                    </span>
                  </div>
                      {!player.isCaptain && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCaptain(player.id)}
                        >
                          Sæt Kaptajn
                        </Button>
                      )}
                </div>
              </div>
            ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
