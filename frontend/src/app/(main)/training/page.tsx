'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useTeams } from '@/hooks/useTeams';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Trophy, Users, Target, Play, Pause, RotateCcw } from 'lucide-react';

interface LeagueTeam {
  id: string;
  name: string;
  overallRating: number;
  formation: string;
  isBot: boolean;
  owner?: {
    id: string;
    name: string;
  };
}

interface TrainingMatch {
  id: string;
  userTeam: {
    id: string;
    name: string;
  };
  opponentTeam: {
    id: string;
    name: string;
  };
  userScore: number;
  opponentScore: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  events: string | null;
  highlights: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function TrainingPage() {
  const { t } = useTranslation('training');
  const { user } = useAuth();
  const { userTeam } = useTeams();
  const [leagueTeams, setLeagueTeams] = useState<LeagueTeam[]>([]);
  const [selectedOpponent, setSelectedOpponent] = useState<string>('');
  const [trainingMatches, setTrainingMatches] = useState<TrainingMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<TrainingMatch | null>(null);
  const [matchProgress, setMatchProgress] = useState(0);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [matchEvents, setMatchEvents] = useState<any[]>([]);
  const [userScore, setUserScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [isMatchSaved, setIsMatchSaved] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Load league teams and training matches in parallel
        const [teamsResponse, matchesResponse] = await Promise.all([
          apiFetch('/api/training-matches/league-teams'),
          apiFetch('/api/training-matches')
        ]);
        
        setLeagueTeams(teamsResponse as LeagueTeam[]);
        setTrainingMatches(matchesResponse as TrainingMatch[]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  // No local simulation - backend handles everything

  const createTrainingMatch = async () => {
    if (!selectedOpponent) return;
    
    try {
      setIsCreating(true);
      
      const response = await apiFetch('/api/training-matches', {
        method: 'POST',
        body: JSON.stringify({
          opponentTeamId: selectedOpponent
        })
      });
      
      setTrainingMatches(prev => [response as TrainingMatch, ...prev]);
      setSelectedOpponent('');
    } catch (error) {
      console.error('Error creating training match:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const startMatch = async (match: TrainingMatch) => {
    try {
      setCurrentMatch(match);
      setIsPlaying(true);
      setMatchProgress(0);
      setCurrentMinute(0);
      setMatchEvents([]);
      setUserScore(0);
      setOpponentScore(0);
      setIsMatchSaved(false);
      
      // Simulate the match on backend immediately
      await simulateMatchOnBackend(match);
    } catch (error) {
      console.error('Error starting match:', error);
    }
  };

  const pauseMatch = () => {
    setIsPlaying(false);
  };

  const resetMatch = () => {
    setIsPlaying(false);
    setMatchProgress(0);
    setCurrentMinute(0);
    setMatchEvents([]);
    setUserScore(0);
    setOpponentScore(0);
    setCurrentMatch(null);
    setIsMatchSaved(false);
  };

  const simulateMatchOnBackend = async (match: TrainingMatch) => {
    try {
      // Simulate the match on backend
      const result = await apiFetch(`/api/training-matches/${match.id}/simulate`, {
        method: 'POST'
      });
      
      // Update local state with results
      setTrainingMatches(prev => 
        prev.map(m => 
          m.id === match.id 
            ? { ...m, ...result, status: 'COMPLETED' }
            : m
        )
      );
      
      // Update current match state
      if (currentMatch && currentMatch.id === match.id) {
        setUserScore(result.userScore);
        setOpponentScore(result.opponentScore);
        setMatchEvents(result.events || []);
        setMatchProgress(100);
        setCurrentMinute(90);
        setIsMatchSaved(true);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error simulating match:', error);
    }
  };

  // saveMatch function removed - backend handles simulation

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Træningskampe</h1>
          <p className="text-muted-foreground">
            Spil mod andre hold i din liga for at teste din taktik
          </p>
        </div>
        <Trophy className="h-8 w-8 text-yellow-500" />
      </div>

      {/* Create New Training Match */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Opret Træningskamp
          </CardTitle>
          <CardDescription>
            Vælg et hold fra din liga at spille mod
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={selectedOpponent} onValueChange={setSelectedOpponent}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Vælg modstander..." />
              </SelectTrigger>
              <SelectContent>
                {leagueTeams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{team.name}</span>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant="secondary">
                          Rating: {team.overallRating}
                        </Badge>
                        <Badge variant="outline">
                          {team.formation}
                        </Badge>
                        {team.isBot && (
                          <Badge variant="destructive">Bot</Badge>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={createTrainingMatch} 
              disabled={!selectedOpponent || isCreating}
              className="px-8"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Opret Kamp'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Match Simulation */}
      {currentMatch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              {currentMatch.userTeam.name} vs {currentMatch.opponentTeam.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Match Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Minut {currentMinute}/90</span>
                <span>{Math.round(matchProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${matchProgress}%` }}
                />
              </div>
            </div>

            {/* Score */}
            <div className="flex items-center justify-center gap-8 text-2xl font-bold">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">{currentMatch.userTeam.name}</div>
                <div className="text-4xl">{userScore}</div>
              </div>
              <div className="text-muted-foreground">-</div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">{currentMatch.opponentTeam.name}</div>
                <div className="text-4xl">{opponentScore}</div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2 justify-center">
              {!isPlaying ? (
                <Button onClick={() => setIsPlaying(true)} disabled={matchProgress >= 100}>
                  <Play className="h-4 w-4 mr-2" />
                  Fortsæt
                </Button>
              ) : (
                <Button onClick={pauseMatch}>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              )}
              <Button variant="outline" onClick={resetMatch}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Nulstil
              </Button>
            </div>

            {/* Match Events */}
            {matchEvents.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Kampbegivenheder</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {matchEvents.slice(-5).map((event, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      {event.minute}' - {event.description}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isMatchSaved && (
              <Alert>
                <AlertDescription>
                  Kampen er gemt og simuleret!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Training Matches History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Træningskampe
          </CardTitle>
          <CardDescription>
            Dine tidligere og planlagte træningskampe
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trainingMatches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Ingen træningskampe endnu. Opret din første kamp ovenfor!
            </div>
          ) : (
            <div className="space-y-4">
              {trainingMatches.map((match) => (
                <div 
                  key={match.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">{match.userTeam.name}</div>
                      <div className="text-2xl font-bold">{match.userScore}</div>
                    </div>
                    <div className="text-muted-foreground">vs</div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">{match.opponentTeam.name}</div>
                      <div className="text-2xl font-bold">{match.opponentScore}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      match.status === 'COMPLETED' ? 'default' :
                      match.status === 'IN_PROGRESS' ? 'secondary' :
                      'outline'
                    }>
                      {match.status === 'COMPLETED' ? 'Færdig' :
                       match.status === 'IN_PROGRESS' ? 'I gang' :
                       match.status === 'SCHEDULED' ? 'Planlagt' : 'Afbrudt'}
                    </Badge>
                    
                    {match.status === 'SCHEDULED' && (
                      <Button 
                        size="sm" 
                        onClick={() => startMatch(match)}
                        disabled={currentMatch !== null}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
