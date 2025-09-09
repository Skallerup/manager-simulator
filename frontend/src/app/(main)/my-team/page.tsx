"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Trophy, Target, Calendar, Star, Crown, Settings, Search, Plus, Filter } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [formationPlayers, setFormationPlayers] = useState<{[key: string]: Player}>({});

  // Calculate team overall rating based on current formation
  const calculateTeamRating = () => {
    if (!teamData) return 0;
    
    // Use starters from teamData instead of formationPlayers
    const starters = teamData.players.filter(player => player.isStarter);
    if (starters.length === 0) return teamData.overallRating || 0;
    
    const totalRating = starters.reduce((sum, player) => sum + player.rating, 0);
    return Math.round(totalRating / starters.length);
  };

  const currentTeamRating = calculateTeamRating();

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const data = await authApiFetch('/api/teams/my-team');
        if (data) {
          setTeamData(data as TeamData);
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
        setTeamData(updatedTeam as TeamData);
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
          setTeamData(updatedTeam as TeamData);
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
          setTeamData(updatedTeam as TeamData);
        }
      } else {
        setError('Failed to swap players');
      }
    } catch (err) {
      setError('Failed to swap players');
    }
  };

  // Formation positions for 4-3-3
  const getFormationPositions = () => {
    const positions = [
      // Goalkeeper - bottom center
      { id: 'gk', name: 'Målmand', x: 50, y: 90, position: 'GOALKEEPER' },
      
      // Defenders (4) - back line
      { id: 'lb', name: 'Forsvar', x: 20, y: 70, position: 'DEFENDER' },
      { id: 'cb1', name: 'Forsvar', x: 40, y: 70, position: 'DEFENDER' },
      { id: 'cb2', name: 'Forsvar', x: 60, y: 70, position: 'DEFENDER' },
      { id: 'rb', name: 'Forsvar', x: 80, y: 70, position: 'DEFENDER' },
      
      // Midfielders (3) - middle line
      { id: 'cm1', name: 'Midtbane', x: 30, y: 45, position: 'MIDFIELDER' },
      { id: 'cm2', name: 'Midtbane', x: 50, y: 45, position: 'MIDFIELDER' },
      { id: 'cm3', name: 'Midtbane', x: 70, y: 45, position: 'MIDFIELDER' },
      
      // Forwards (3) - front line
      { id: 'lw', name: 'Angreb', x: 25, y: 20, position: 'ATTACKER' },
      { id: 'st', name: 'Angreb', x: 50, y: 15, position: 'ATTACKER' },
      { id: 'rw', name: 'Angreb', x: 75, y: 20, position: 'ATTACKER' },
    ];
    return positions;
  };

  // Initialize formation players when team data loads
  useEffect(() => {
    if (teamData) {
      // Only initialize if formationPlayers is empty (first load)
      if (Object.keys(formationPlayers).length === 0) {
        const initialFormation: {[key: string]: Player} = {};
        const starters = teamData.players.filter(player => player.isStarter);
        const positions = getFormationPositions();
        
        // Map starters to formation positions using saved formationPosition or default order
        starters.forEach((player, index) => {
          let targetPositionId;
          
          // Use saved formationPosition if available, otherwise use default order
          if (player.formationPosition) {
            targetPositionId = player.formationPosition;
          } else {
            targetPositionId = positions[index]?.id;
          }
          
          if (targetPositionId) {
            // Create a deep copy of the player object
            initialFormation[targetPositionId] = { ...player };
          }
        });
        
        setFormationPlayers(initialFormation);
      }
    }
  }, [teamData]);

  const addPlayerToFormation = (player: Player, positionId: string) => {
    setFormationPlayers(prev => ({
      ...prev,
      [positionId]: player
    }));
  };

  const removePlayerFromFormation = (positionId: string) => {
    setFormationPlayers(prev => {
      const newFormation = { ...prev };
      delete newFormation[positionId];
      return newFormation;
    });
  };

  const handleSaveFormation = async () => {
    try {
      setIsUpdatingFormation(true);
      
      if (!teamData) {
        throw new Error("No team data available");
      }

      // Get the current starters from teamData (not formationPlayers)
      const starters = teamData.players.filter(player => player.isStarter).map(player => player.id);
      
      // Create formation positions mapping
      const formationPositions: {[key: string]: string} = {};
      teamData.players.forEach(player => {
        if (player.isStarter && player.formationPosition) {
          formationPositions[player.id] = player.formationPosition;
        }
      });
      
      // Save to backend
      const response = await authApiFetch(`/api/teams/${teamData.id}/starters`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ starters, formationPositions }),
      });

      if (response) {
        // Show success message
        alert("Holdopstilling gemt! Din nye holdopstilling er blevet gemt succesfuldt.");
        
        // Update team data with new rating
        if (teamData) {
          setTeamData({
            ...teamData,
            overallRating: (response as any).overallRating || currentTeamRating
          });
        }
        
        // Refresh team data to get updated state
        const updatedData = await authApiFetch('/api/teams/my-team');
        if (updatedData) {
          setTeamData(updatedData as TeamData);
        }
      }
      
    } catch (err) {
      console.error("Error saving formation:", err);
      alert("Fejl: Kunne ikke gemme holdopstillingen. Prøv igen.");
    } finally {
      setIsUpdatingFormation(false);
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
      case "GOALKEEPER": return "bg-blue-200 text-blue-900 border-blue-600";
      case "DEFENDER": return "bg-green-200 text-green-900 border-green-600";
      case "MIDFIELDER": return "bg-yellow-200 text-yellow-900 border-yellow-600";
      case "ATTACKER": return "bg-red-200 text-red-900 border-red-600";
      default: return "bg-gray-200 text-gray-900 border-gray-600";
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

  // Filter and sort players
  const filteredPlayers = teamData.players
    .filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPosition = selectedPosition === "all" || player.position === selectedPosition;
      return matchesSearch && matchesPosition;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "name":
          return a.name.localeCompare(b.name);
        case "age":
          return a.age - b.age;
        default:
          return 0;
      }
    });

  const starters = filteredPlayers.filter(player => player.isStarter);
  const substitutes = filteredPlayers.filter(player => !player.isStarter);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Side - Formation */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-black">Nyt hold</h1>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                Rating: {currentTeamRating}
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-xl font-bold text-green-700 bg-green-100 px-3 py-1 rounded border border-green-600">50.000.000</span>
              <span className="text-lg font-semibold text-gray-800">Bank</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" className="text-gray-800 border-gray-600 hover:bg-gray-100">
              Annullér
            </Button>
            <Button 
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold"
              onClick={handleSaveFormation}
              disabled={isUpdatingFormation}
            >
              {isUpdatingFormation ? "Gemmer..." : "Gem"}
          </Button>
        </div>
      </div>

        {/* Football Field */}
        <div className="relative bg-gradient-to-b from-green-500 to-green-700 rounded-lg h-[500px] border-4 border-white overflow-hidden shadow-lg">
          {/* Field lines */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-white"></div>
          
          {/* Goal areas */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-20 border-2 border-white"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-40 h-20 border-2 border-white"></div>
          
          {/* Penalty areas */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-60 h-30 border-2 border-white"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-60 h-30 border-2 border-white"></div>
          
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white rounded-full"></div>
          
          {/* Field pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full" style={{
              backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }}></div>
          </div>
          
          {/* Formation positions */}
          {getFormationPositions().map((pos, index) => {
            const player = formationPlayers[pos.id];
            return (
              <div
                key={pos.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={() => {
                  if (player) {
                    removePlayerFromFormation(pos.id);
                  }
                }}
              >
                {player ? (
                  <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all cursor-pointer min-w-[90px] border-2 border-gray-600">
                    <PlayerAvatar 
                      playerName={player.name}
                      position={player.position}
                      size={36}
                      className="rounded-full"
                    />
                    <span className="text-sm font-bold mt-2 text-center text-black bg-white px-2 py-1 rounded border border-gray-300">{player.name}</span>
                    <span className="text-xs font-bold text-white bg-blue-700 px-2 py-1 rounded mt-1 border border-blue-800">{pos.name}</span>
                    {player.isCaptain && (
                      <Crown className="w-4 h-4 text-yellow-700 mt-1" />
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center p-3 bg-yellow-200 rounded-lg border-2 border-dashed border-yellow-700 min-w-[90px] hover:bg-yellow-300 transition-colors">
                    <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-lg">+</span>
                    </div>
                    <span className="text-xs font-bold mt-2 text-center text-yellow-900 bg-yellow-100 px-2 py-1 rounded border border-yellow-400">{pos.name}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Side - Player List */}
      <div className="w-96 bg-white border-l border-gray-200 p-4">
        {/* Search and Filter Header */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-700" />
            <Input
              placeholder="Søg efter spiller..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border-2 border-gray-400 text-gray-900 font-semibold"
            />
            </div>

          <div className="flex items-center space-x-2">
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger className="w-32 border-2 border-gray-400 text-gray-900 font-semibold">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="GOALKEEPER">Målmand</SelectItem>
                <SelectItem value="DEFENDER">Forsvar</SelectItem>
                <SelectItem value="MIDFIELDER">Midtbane</SelectItem>
                <SelectItem value="ATTACKER">Angreb</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32 border-2 border-gray-400 text-gray-900 font-semibold">
                <SelectValue placeholder="Sorter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="name">Navn</SelectItem>
                <SelectItem value="age">Alder</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" className="border-2 border-gray-400 text-gray-700">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Player List */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filteredPlayers.map((player) => {
            const isInFormation = Object.values(formationPlayers).some(p => p.id === player.id);
            
            // Check if there's an available position for this player's position type
            const positions = getFormationPositions();
            const availablePosition = positions.find(pos => 
              pos.position === player.position && !formationPlayers[pos.id]
            );
            const hasAvailablePosition = !!availablePosition;
            
            const isDisabled = isInFormation || !hasAvailablePosition;
            return (
                  <div
                    key={player.id}
                className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all bg-white shadow-lg ${
                  isDisabled ? 'opacity-50 bg-gray-200 cursor-not-allowed border-gray-500' : 'hover:shadow-xl hover:border-blue-500 cursor-pointer border-gray-400'
                }`}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div 
                    className={`w-10 h-10 rounded-full shadow-lg font-bold flex items-center justify-center ${
                      isDisabled 
                        ? 'bg-gray-400 text-gray-600 border-2 border-gray-500' 
                        : 'bg-blue-700 hover:bg-blue-800 text-white border-2 border-blue-800 cursor-pointer'
                    }`}
                    onClick={() => {
                      if (isDisabled) return;
                      
                      if (availablePosition) {
                        addPlayerToFormation(player, availablePosition.id);
                      }
                    }}
                  >
                    <Plus className="w-5 h-5" />
                  </div>
                  
                  <div className="flex items-center space-x-4 flex-1">
                    <PlayerAvatar 
                      playerName={player.name}
                      position={player.position}
                      size={48}
                      className="rounded-full"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <p className="font-bold text-xl text-black">{player.name}</p>
                    {player.isCaptain && (
                          <Crown className="w-5 h-5 text-yellow-700" />
                    )}
                  </div>
                      <div className="flex items-center space-x-3 mt-1">
                        <Badge className={`${getPositionColor(player.position)} font-bold text-sm px-3 py-1 border-2`}>
                          {getPositionName(player.position)}
                        </Badge>
                    </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-yellow-200 px-4 py-2 rounded-lg border-2 border-yellow-600">
                    <Star className="w-5 h-5 mr-2 text-yellow-800" />
                    <span className={`font-bold text-2xl text-black`}>
                      {player.rating}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-green-800 bg-green-100 px-3 py-1 rounded border border-green-600">
                      {(player.rating * 1000).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
            </div>
          </div>
    </div>
  );
}
