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
import { MatchHighlights } from "@/components/highlights/MatchHighlights";

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
  highlights?: any[];
}

// Bot teams configuration with realistic players
const botTeams = [
  { 
    name: "Bot United", 
    difficulty: "Easy", 
    rating: 11, 
    color: "bg-green-500",
    players: [
      { name: "Bot Keeper", position: "GOALKEEPER", speed: 15, shooting: 5, passing: 8, defending: 12, stamina: 10, reflexes: 18, overall: 11 },
      { name: "Bot Defender 1", position: "DEFENDER", speed: 12, shooting: 6, passing: 9, defending: 16, stamina: 11, reflexes: 8, overall: 10 },
      { name: "Bot Defender 2", position: "DEFENDER", speed: 10, shooting: 4, passing: 7, defending: 15, stamina: 9, reflexes: 6, overall: 9 },
      { name: "Bot Defender 3", position: "DEFENDER", speed: 11, shooting: 5, passing: 8, defending: 14, stamina: 10, reflexes: 7, overall: 9 },
      { name: "Bot Defender 4", position: "DEFENDER", speed: 13, shooting: 6, passing: 9, defending: 17, stamina: 12, reflexes: 8, overall: 11 },
      { name: "Bot Midfielder 1", position: "MIDFIELDER", speed: 14, shooting: 8, passing: 12, defending: 10, stamina: 13, reflexes: 6, overall: 11 },
      { name: "Bot Midfielder 2", position: "MIDFIELDER", speed: 12, shooting: 7, passing: 11, defending: 9, stamina: 11, reflexes: 5, overall: 9 },
      { name: "Bot Midfielder 3", position: "MIDFIELDER", speed: 13, shooting: 9, passing: 13, defending: 11, stamina: 12, reflexes: 7, overall: 11 },
      { name: "Bot Forward 1", position: "FORWARD", speed: 16, shooting: 14, passing: 8, defending: 6, stamina: 14, reflexes: 5, overall: 11 },
      { name: "Bot Forward 2", position: "FORWARD", speed: 15, shooting: 13, passing: 7, defending: 5, stamina: 13, reflexes: 4, overall: 10 },
      { name: "Bot Striker", position: "FORWARD", speed: 17, shooting: 16, passing: 9, defending: 4, stamina: 15, reflexes: 6, overall: 12 }
    ]
  },
  { 
    name: "Bot City", 
    difficulty: "Medium", 
    rating: 75, 
    color: "bg-yellow-500",
    players: [
      { name: "Bot Keeper Pro", position: "GOALKEEPER", speed: 65, shooting: 25, passing: 45, defending: 70, stamina: 60, reflexes: 85, overall: 75 },
      { name: "Bot Defender Elite", position: "DEFENDER", speed: 60, shooting: 30, passing: 55, defending: 80, stamina: 65, reflexes: 40, overall: 72 },
      { name: "Bot Defender Pro", position: "DEFENDER", speed: 58, shooting: 28, passing: 52, defending: 78, stamina: 62, reflexes: 38, overall: 70 },
      { name: "Bot Defender Strong", position: "DEFENDER", speed: 62, shooting: 32, passing: 58, defending: 82, stamina: 68, reflexes: 42, overall: 74 },
      { name: "Bot Defender Fast", position: "DEFENDER", speed: 70, shooting: 35, passing: 60, defending: 75, stamina: 70, reflexes: 45, overall: 75 },
      { name: "Bot Midfielder Star", position: "MIDFIELDER", speed: 75, shooting: 55, passing: 80, defending: 60, stamina: 75, reflexes: 35, overall: 75 },
      { name: "Bot Midfielder Pro", position: "MIDFIELDER", speed: 72, shooting: 52, passing: 78, defending: 58, stamina: 72, reflexes: 32, overall: 72 },
      { name: "Bot Midfielder Elite", position: "MIDFIELDER", speed: 78, shooting: 58, passing: 82, defending: 62, stamina: 78, reflexes: 38, overall: 77 },
      { name: "Bot Forward Star", position: "FORWARD", speed: 80, shooting: 75, passing: 65, defending: 40, stamina: 80, reflexes: 30, overall: 75 },
      { name: "Bot Forward Pro", position: "FORWARD", speed: 78, shooting: 72, passing: 62, defending: 38, stamina: 78, reflexes: 28, overall: 72 },
      { name: "Bot Striker Elite", position: "FORWARD", speed: 82, shooting: 85, passing: 68, defending: 35, stamina: 82, reflexes: 32, overall: 78 }
    ]
  },
  { 
    name: "Bot Arsenal", 
    difficulty: "Hard", 
    rating: 85, 
    color: "bg-red-500",
    players: [
      { name: "Bot Keeper Elite", position: "GOALKEEPER", speed: 75, shooting: 35, passing: 55, defending: 80, stamina: 70, reflexes: 95, overall: 85 },
      { name: "Bot Defender Master", position: "DEFENDER", speed: 70, shooting: 40, passing: 65, defending: 90, stamina: 75, reflexes: 50, overall: 82 },
      { name: "Bot Defender Elite", position: "DEFENDER", speed: 68, shooting: 38, passing: 62, defending: 88, stamina: 72, reflexes: 48, overall: 80 },
      { name: "Bot Defender Pro", position: "DEFENDER", speed: 72, shooting: 42, passing: 68, defending: 92, stamina: 78, reflexes: 52, overall: 84 },
      { name: "Bot Defender Star", position: "DEFENDER", speed: 80, shooting: 45, passing: 70, defending: 85, stamina: 80, reflexes: 55, overall: 85 },
      { name: "Bot Midfielder Master", position: "MIDFIELDER", speed: 85, shooting: 65, passing: 90, defending: 70, stamina: 85, reflexes: 45, overall: 85 },
      { name: "Bot Midfielder Elite", position: "MIDFIELDER", speed: 82, shooting: 62, passing: 88, defending: 68, stamina: 82, reflexes: 42, overall: 82 },
      { name: "Bot Midfielder Pro", position: "MIDFIELDER", speed: 88, shooting: 68, passing: 92, defending: 72, stamina: 88, reflexes: 48, overall: 87 },
      { name: "Bot Forward Master", position: "FORWARD", speed: 90, shooting: 85, passing: 75, defending: 50, stamina: 90, reflexes: 40, overall: 85 },
      { name: "Bot Forward Elite", position: "FORWARD", speed: 88, shooting: 82, passing: 72, defending: 48, stamina: 88, reflexes: 38, overall: 82 },
      { name: "Bot Striker Master", position: "FORWARD", speed: 92, shooting: 95, passing: 78, defending: 45, stamina: 92, reflexes: 42, overall: 88 }
    ]
  },
  { 
    name: "Bot Chelsea", 
    difficulty: "Expert", 
    rating: 95, 
    color: "bg-purple-500",
    players: [
      { name: "Bot Keeper Legend", position: "GOALKEEPER", speed: 85, shooting: 45, passing: 65, defending: 90, stamina: 80, reflexes: 98, overall: 95 },
      { name: "Bot Defender Legend", position: "DEFENDER", speed: 80, shooting: 50, passing: 75, defending: 98, stamina: 85, reflexes: 60, overall: 92 },
      { name: "Bot Defender Master", position: "DEFENDER", speed: 78, shooting: 48, passing: 72, defending: 96, stamina: 82, reflexes: 58, overall: 90 },
      { name: "Bot Defender Elite", position: "DEFENDER", speed: 82, shooting: 52, passing: 78, defending: 100, stamina: 88, reflexes: 62, overall: 94 },
      { name: "Bot Defender Star", position: "DEFENDER", speed: 90, shooting: 55, passing: 80, defending: 95, stamina: 90, reflexes: 65, overall: 95 },
      { name: "Bot Midfielder Legend", position: "MIDFIELDER", speed: 95, shooting: 75, passing: 98, defending: 80, stamina: 95, reflexes: 55, overall: 95 },
      { name: "Bot Midfielder Master", position: "MIDFIELDER", speed: 92, shooting: 72, passing: 96, defending: 78, stamina: 92, reflexes: 52, overall: 92 },
      { name: "Bot Midfielder Elite", position: "MIDFIELDER", speed: 98, shooting: 78, passing: 100, defending: 82, stamina: 98, reflexes: 58, overall: 97 },
      { name: "Bot Forward Legend", position: "FORWARD", speed: 100, shooting: 95, passing: 85, defending: 60, stamina: 100, reflexes: 50, overall: 95 },
      { name: "Bot Forward Master", position: "FORWARD", speed: 98, shooting: 92, passing: 82, defending: 58, stamina: 98, reflexes: 48, overall: 92 },
      { name: "Bot Striker Legend", position: "FORWARD", speed: 100, shooting: 98, passing: 88, defending: 55, stamina: 100, reflexes: 52, overall: 98 }
    ]
  },
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
  const [showBotTeam, setShowBotTeam] = useState(false);

  // Load user team and match history
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Load user team
        const teamResponse = await authApiFetch('/api/teams/my-team');
        if (teamResponse) {
          console.log('Team response:', teamResponse);
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
            events: match.events || [],
            highlights: match.highlights || []
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
          
          // Simulate random events - ULTRA realistic with individual player skills
          const playerRating = userTeam?.overallRating || 
            (userTeam?.players?.filter(p => p.isStarter)?.length > 0 ? 
              Math.round(userTeam.players.filter(p => p.isStarter).reduce((sum, p) => sum + p.rating, 0) / userTeam.players.filter(p => p.isStarter).length) : 
              50
            );
          const botRating = selectedBot.rating;
          const strengthDifference = playerRating - botRating;
          
          // Calculate possession based on strength difference - MORE BALANCED
          let playerPossession = 0.5 + (strengthDifference / 100); // More balanced
          playerPossession = Math.max(0.15, Math.min(0.85, playerPossession));
          
          // Calculate event chance based on strength difference - MORE BALANCED
          const strengthRatio = playerRating / Math.max(botRating, 1);
          const baseEventChance = Math.min(0.4, 0.15 + (strengthRatio - 1) * 0.1); // More balanced event chance
          
          if (Math.random() < baseEventChance) {
            const team = Math.random() < playerPossession ? 'player' : 'bot';
            
            // Select specific player based on position and skills
            let selectedPlayer;
            if (team === 'player') {
              const playerStarters = userTeam?.players?.filter(p => p.isStarter) || [];
              selectedPlayer = playerStarters[Math.floor(Math.random() * playerStarters.length)];
            } else {
              // Select bot player based on position
              const botStarters = selectedBot.players || [];
              selectedPlayer = botStarters[Math.floor(Math.random() * botStarters.length)];
            }
            
            const playerName = selectedPlayer?.name || 'Player';
            
            // Calculate goal chance based on individual player skills - BALANCED
            let goalChance = 0.08; // Lower base chance
            
            if (team === 'player') {
              // Use player's shooting skill
              const shootingSkill = selectedPlayer?.shooting || 50;
              const overallSkill = selectedPlayer?.overall || 50;
              goalChance = Math.max(0.02, Math.min(0.4, 0.08 + (shootingSkill - 50) / 200 + (overallSkill - 50) / 400));
            } else {
              // Use bot player's shooting skill
              const shootingSkill = selectedPlayer?.shooting || 50;
              const overallSkill = selectedPlayer?.overall || 50;
              goalChance = Math.max(0.02, Math.min(0.4, 0.08 + (shootingSkill - 50) / 200 + (overallSkill - 50) / 400));
            }
            
            // Add team strength modifier - MORE BALANCED
            const strengthDiff = (playerRating - botRating) / 50;
            goalChance += strengthDiff * 0.15;
            goalChance = Math.max(0.02, Math.min(0.4, goalChance));
            
            if (Math.random() < goalChance) {
              // Goal!
              if (team === 'player') {
                setPlayerScore(prev => prev + 1);
                setMatchEvents(prev => [...prev, {
                  minute: newMinute,
                  type: 'goal',
                  team: 'player',
                  player: playerName,
                  description: `GOAL! ${playerName} scores! 🎉`
                }]);
              } else {
                setBotScore(prev => prev + 1);
                setMatchEvents(prev => [...prev, {
                  minute: newMinute,
                  type: 'goal',
                  team: 'bot',
                  player: playerName,
                  description: `${playerName} scores for ${selectedBot.name}! 😞`
                }]);
              }
            } else {
              // Shot or other event
              const eventTypes: MatchEvent['type'][] = ['shot', 'save', 'yellow_card'];
              const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
              
              const newEvent: MatchEvent = {
                minute: newMinute,
                type: randomType,
                team,
                player: playerName,
                description: team === 'player' 
                  ? t(`events.your_team_${randomType}`, { ns: 'match' })
                  : t(`events.bot_${randomType}`, { ns: 'match' })
              };
              
              setMatchEvents(prev => [...prev, newEvent]);
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="play">{t('play', { ns: 'match' })}</TabsTrigger>
          <TabsTrigger value="highlights">{t('highlights', { ns: 'match' })}</TabsTrigger>
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBot(bot);
                          setShowBotTeam(true);
                        }}
                      >
                        View Team
                      </Button>
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
                  <p className="text-sm text-muted-foreground">
                    Rating: {userTeam?.overallRating || 
                      (userTeam?.players?.filter(p => p.isStarter)?.length > 0 ? 
                        Math.round(userTeam.players.filter(p => p.isStarter).reduce((sum, p) => sum + p.rating, 0) / userTeam.players.filter(p => p.isStarter).length) : 
                        'N/A'
                      )
                    }
                  </p>
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

        <TabsContent value="highlights" className="space-y-4">
          {currentMatchId ? (
            <MatchHighlights 
              matchId={currentMatchId} 
              isProUser={user?.email === 'skallerup+3@gmail.com' || user?.email === 'skallerup+4@gmail.com' || user?.email === 'skallerup+5@gmail.com'}
              highlights={matchHistory.find(match => match.id === currentMatchId)?.highlights}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="w-5 h-5 mr-2" />
                  {t('highlights', { ns: 'match' })}
                </CardTitle>
                <CardDescription>
                  {t('highlightsDescription', { ns: 'match' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('noMatchSelected', { ns: 'match' })}</p>
                </div>
              </CardContent>
            </Card>
          )}
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

      {/* Bot Team Dialog */}
      {showBotTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedBot.name} - Team Details</h2>
              <Button 
                variant="outline" 
                onClick={() => setShowBotTeam(false)}
              >
                Close
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedBot.players?.map((player: any, index: number) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <PlayerAvatar
                      playerName={player.name}
                      position={player.position}
                      size={40}
                      className="rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-sm">{player.name}</h3>
                      <p className="text-xs text-muted-foreground">{player.position}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Overall:</span>
                      <span className="font-semibold bg-yellow-200 px-2 py-1 rounded-md border-2 border-yellow-400">
                        {player.overall}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className="flex justify-between">
                        <span>Speed:</span>
                        <span>{player.speed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shooting:</span>
                        <span>{player.shooting}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Passing:</span>
                        <span>{player.passing}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Defending:</span>
                        <span>{player.defending}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stamina:</span>
                        <span>{player.stamina}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reflexes:</span>
                        <span>{player.reflexes}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
