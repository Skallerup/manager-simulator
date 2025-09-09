"use client";
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trophy, 
  Target, 
  Clock, 
  Users, 
  Zap,
  Shield,
  Sword,
  BookOpen,
  History
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch, authApiFetch } from "@/lib/api";
import { PlayerAvatar } from "@/components/player-avatar";

// Match simulation types
interface MatchEvent {
  minute: number;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'shot' | 'save';
  team: 'player' | 'bot';
  player: string;
  description: string;
}

interface MatchResult {
  id: string;
  date: string;
  playerScore: number;
  botScore: number;
  playerTeam: string;
  botTeam: string;
  events: MatchEvent[];
  duration: number; // in minutes
}

// Bot teams configuration
const botTeams = [
  { name: "Bot United", difficulty: "Easy", rating: 11, color: "bg-green-500" },
  { name: "Bot City", difficulty: "Medium", rating: 75, color: "bg-yellow-500" },
  { name: "Bot Arsenal", difficulty: "Hard", rating: 85, color: "bg-red-500" },
  { name: "Bot Chelsea", difficulty: "Expert", rating: 95, color: "bg-purple-500" },
];

export default function MatchPage() {
  const { t } = useTranslation('match');
  const { user } = useAuth();
  const [selectedBot, setSelectedBot] = useState(botTeams[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [matchProgress, setMatchProgress] = useState(0);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [matchEvents, setMatchEvents] = useState<MatchEvent[]>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [matchHistory, setMatchHistory] = useState<MatchResult[]>([]);
  const [userTeam, setUserTeam] = useState<any>(null);
  const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMatchSaved, setIsMatchSaved] = useState(false);

  // Load user team and match history
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Load user team
        const teamResponse = await authApiFetch('/api/teams/my-team');
        if (teamResponse) {
          setUserTeam(teamResponse);
        }
        
        // Load match history
        const historyResponse = await authApiFetch('/api/matches/bot');
        if (historyResponse && Array.isArray(historyResponse)) {
          const formattedHistory = historyResponse.map((match: any) => ({
            id: match.id,
            date: new Date(match.createdAt).toISOString().split('T')[0],
            playerScore: match.userScore || 0,
            botScore: match.botScore || 0,
            playerTeam: match.userTeam?.name || 'Your Team',
            botTeam: `Bot ${match.botDifficulty}`,
            duration: 90,
            events: match.events || []
          }));
          setMatchHistory(formattedHistory);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  // Simulate match progression
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && matchProgress < 100) {
      interval = setInterval(() => {
        setMatchProgress(prev => {
          const newProgress = prev + 1;
          const newMinute = Math.floor((newProgress / 100) * 90);
          setCurrentMinute(newMinute);
          
          // Check if match is finished
          if (newProgress >= 100) {
            setIsPlaying(false);
            saveMatch();
            return 100;
          }
          
          // Simulate random events
          if (Math.random() < 0.1) { // 10% chance per second
            const eventTypes: MatchEvent['type'][] = ['shot', 'save', 'yellow_card'];
            const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            // Calculate team strength difference
            const playerRating = userTeam?.overallRating || 50;
            const botRating = selectedBot.rating;
            const totalRating = playerRating + botRating;
            
            // Player team gets ball based on their relative strength
            const playerPossession = playerRating / totalRating;
            const team = Math.random() < playerPossession ? 'player' : 'bot';
            const player = team === 'player' 
              ? (userTeam?.players?.[Math.floor(Math.random() * (userTeam?.players?.length || 1))]?.name || 'Player')
              : `${selectedBot.name} Player`;
            
            const newEvent: MatchEvent = {
              minute: newMinute,
              type: randomType,
              team,
              player,
              description: team === 'player' 
                ? t(`events.your_team_${randomType}`, { ns: 'match' })
                : t(`events.bot_${randomType}`, { ns: 'match' })
            };
            
            setMatchEvents(prev => [...prev, newEvent]);
            
            // Simulate goals based on team strength
            if (randomType === 'shot') {
              // Calculate goal chance based on team strength
              const attackingTeamRating = team === 'player' ? playerRating : botRating;
              const defendingTeamRating = team === 'player' ? botRating : playerRating;
              
              // Base goal chance is 20%, modified by strength difference
              const strengthDifference = (attackingTeamRating - defendingTeamRating) / 100;
              const goalChance = Math.max(0.05, Math.min(0.6, 0.2 + strengthDifference * 0.3));
              
              if (Math.random() < goalChance) {
                if (team === 'player') {
                  setPlayerScore(prev => prev + 1);
                  setMatchEvents(prev => [...prev, {
                    minute: newMinute,
                    type: 'goal',
                    team: 'player',
                    player,
                    description: 'GOAL! 🎉'
                  }]);
                } else {
                  setBotScore(prev => prev + 1);
                  setMatchEvents(prev => [...prev, {
                    minute: newMinute,
                    type: 'goal',
                    team: 'bot',
                    player,
                    description: 'Bot scores! 😞'
                  }]);
                }
              }
            }
          }
          
          return newProgress;
        });
      }, 100); // Update every 100ms for smooth animation
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, matchProgress, selectedBot]);

  const startMatch = async () => {
    if (!user || !userTeam) return;
    
    try {
      // Create bot match
      const matchResponse = await apiFetch('/api/matches/bot', {
        method: 'POST',
        body: JSON.stringify({
          botDifficulty: selectedBot.difficulty,
          botRating: selectedBot.rating
        })
      });
      
      setCurrentMatchId((matchResponse as any).id);
      setIsPlaying(true);
      setMatchProgress(0);
      setCurrentMinute(0);
      setMatchEvents([]);
      setPlayerScore(0);
      setBotScore(0);
      setIsMatchSaved(false);
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
    setPlayerScore(0);
    setBotScore(0);
    setCurrentMatchId(null);
    setIsMatchSaved(false);
  };

  const saveMatch = async () => {
    if (!currentMatchId || isMatchSaved) return;
    
    try {
      await apiFetch(`/api/matches/bot/${currentMatchId}/simulate`, {
        method: 'POST',
        body: JSON.stringify({
          events: matchEvents
        })
      });
      
      setIsMatchSaved(true);
      
      // Reload match history
      if (user) {
        const historyResponse = await authApiFetch('/api/matches/bot');
        if (historyResponse && Array.isArray(historyResponse)) {
          const formattedHistory = historyResponse.map((match: any) => ({
            id: match.id,
            date: new Date(match.createdAt).toISOString().split('T')[0],
            playerScore: match.userScore || 0,
            botScore: match.botScore || 0,
            playerTeam: match.userTeam?.name || 'Your Team',
            botTeam: `Bot ${match.botDifficulty}`,
            duration: 90,
            events: match.events || []
          }));
          setMatchHistory(formattedHistory);
        }
      }
    } catch (error) {
      console.error('Error saving match:', error);
    }
  };

  const getEventIcon = (type: MatchEvent['type']) => {
    switch (type) {
      case 'goal': return <Target className="w-4 h-4 text-green-500" />;
      case 'yellow_card': return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'red_card': return <Zap className="w-4 h-4 text-red-500" />;
      case 'shot': return <Sword className="w-4 h-4 text-blue-500" />;
      case 'save': return <Shield className="w-4 h-4 text-purple-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-muted-foreground">Loading match data...</p>
        </div>
      </div>
    );
  }

  if (!userTeam) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">No Team Found</h1>
          <p className="text-muted-foreground mb-6">You need to create a team before playing matches.</p>
          <Button onClick={() => window.location.href = '/my-team'}>
            Go to My Team
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title', { ns: 'match' })}</h1>
          <p className="text-muted-foreground">{t('description', { ns: 'match' })}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={isPlaying ? pauseMatch : startMatch}
            disabled={matchProgress >= 100}
            className="flex items-center space-x-2"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? t('pause', { ns: 'match' }) : t('startMatch', { ns: 'match' })}</span>
          </Button>
          <Button
            onClick={resetMatch}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('reset', { ns: 'match' })}</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="play" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="play">{t('play', { ns: 'match' })}</TabsTrigger>
          <TabsTrigger value="history">{t('history', { ns: 'match' })}</TabsTrigger>
          <TabsTrigger value="documentation">{t('documentation', { ns: 'match' })}</TabsTrigger>
        </TabsList>

        <TabsContent value="play" className="space-y-6">
          {/* Bot Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                {t('selectOpponent', { ns: 'match' })}
              </CardTitle>
              <CardDescription>
                {t('selectOpponentDescription', { ns: 'match' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {botTeams.map((bot) => (
                  <Card
                    key={bot.name}
                    className={`cursor-pointer transition-all ${
                      selectedBot.name === bot.name 
                        ? 'ring-2 ring-blue-500' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedBot(bot)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white ${bot.color}`}>
                        🤖
                      </div>
                      <h3 className="font-semibold">{bot.name}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {bot.difficulty}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        Rating: {bot.rating}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Match Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t('matchInProgress', { ns: 'match' })}</span>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{currentMinute}'</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Match Progress */}
              <div className="mb-6">
                <Progress value={matchProgress} className="w-full h-2" />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>0'</span>
                  <span>45'</span>
                  <span>90'</span>
                </div>
              </div>

              {/* Score Display */}
              <div className="grid grid-cols-3 gap-4 items-center text-center mb-6">
                <div>
                  <h3 className="font-bold text-lg">{userTeam?.name || 'Your Team'}</h3>
                  <div className="text-4xl font-bold text-blue-600">{playerScore}</div>
                  <p className="text-sm text-muted-foreground">Rating: {userTeam?.overallRating || 'N/A'}</p>
                </div>
                <div className="text-2xl font-bold">VS</div>
                <div>
                  <h3 className="font-bold text-lg">{selectedBot.name}</h3>
                  <div className="text-4xl font-bold text-red-600">{botScore}</div>
                  <p className="text-sm text-muted-foreground">Rating: {selectedBot.rating}</p>
                </div>
              </div>

              {/* Live Events */}
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <h4 className="font-semibold">{t('liveEvents', { ns: 'match' })}</h4>
                {matchEvents.length === 0 ? (
                  <p className="text-muted-foreground text-sm">{t('noEvents', { ns: 'match' })}</p>
                ) : (
                  matchEvents.slice(-10).reverse().map((event, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      {getEventIcon(event.type)}
                      <span className="font-mono">{event.minute}'</span>
                      <span className={event.team === 'player' ? 'text-blue-600' : 'text-red-600'}>
                        {event.player}
                      </span>
                      <span>{event.description}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="w-5 h-5 mr-2" />
                {t('matchHistory', { ns: 'match' })}
              </CardTitle>
              <CardDescription>
                {t('matchHistoryDescription', { ns: 'match' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {matchHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">{t('noMatches', { ns: 'match' })}</p>
              ) : (
                <div className="space-y-4">
                  {matchHistory.map((match) => (
                    <Card key={match.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="font-bold">{match.playerTeam}</div>
                            <div className="text-2xl font-bold text-blue-600">{match.playerScore}</div>
                          </div>
                          <div className="text-muted-foreground">VS</div>
                          <div className="text-center">
                            <div className="font-bold">{match.botTeam}</div>
                            <div className="text-2xl font-bold text-red-600">{match.botScore}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">{match.date}</div>
                          <div className="text-sm">{match.duration} min</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                {t('howItWorks', { ns: 'match' })}
              </CardTitle>
              <CardDescription>
                {t('documentationDescription', { ns: 'match' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('simulationEngine', { ns: 'match' })}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('simulationEngineDescription', { ns: 'match' })}
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>{t('ratingSystem', { ns: 'match' })}</li>
                  <li>{t('randomEvents', { ns: 'match' })}</li>
                  <li>{t('difficultyScaling', { ns: 'match' })}</li>
                  <li>{t('realTimeSimulation', { ns: 'match' })}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">{t('matchMechanics', { ns: 'match' })}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('matchMechanicsDescription', { ns: 'match' })}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">{t('events', { ns: 'match' })}</h4>
                    <ul className="text-sm space-y-1">
                      <li>• {t('goals', { ns: 'match' })}</li>
                      <li>• {t('cards', { ns: 'match' })}</li>
                      <li>• {t('shots', { ns: 'match' })}</li>
                      <li>• {t('saves', { ns: 'match' })}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t('difficultyLevels', { ns: 'match' })}</h4>
                    <ul className="text-sm space-y-1">
                      <li>• <span className="text-green-600">Easy (65)</span></li>
                      <li>• <span className="text-yellow-600">Medium (75)</span></li>
                      <li>• <span className="text-red-600">Hard (85)</span></li>
                      <li>• <span className="text-purple-600">Expert (95)</span></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">{t('tips', { ns: 'match' })}</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>{t('tip1', { ns: 'match' })}</li>
                  <li>{t('tip2', { ns: 'match' })}</li>
                  <li>{t('tip3', { ns: 'match' })}</li>
                  <li>{t('tip4', { ns: 'match' })}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
