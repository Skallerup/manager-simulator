"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Star, Crown, Zap, Swords, ArrowRightLeft, Shield, DollarSign, TrendingUp } from "lucide-react";
import { authApiFetch } from "@/lib/api";
import { PlayerAvatar } from "@/components/player-avatar";

interface Player {
  id: string;
  name: string;
  position: string;
  formationPosition?: string;
  age: number;
  rating: number;
  isStarter: boolean;
  isCaptain: boolean;
  speed?: number;
  shooting?: number;
  passing?: number;
  defending?: number;
  stamina?: number;
  reflexes?: number;
}

interface TeamData {
  id: string;
  name: string;
  overallRating: number;
  formation: string;
  players: Player[];
}

// Formation definitions
const formationDefinitions = {
  "4-3-3": {
    positions: [
      { id: "gk", name: "MÅ", position: "GOALKEEPER", x: 50, y: 88 },
      { id: "lb", name: "VB", position: "DEFENDER", x: 15, y: 72 },
      { id: "cb1", name: "CB", position: "DEFENDER", x: 35, y: 72 },
      { id: "cb2", name: "CB", position: "DEFENDER", x: 65, y: 72 },
      { id: "rb", name: "HB", position: "DEFENDER", x: 85, y: 72 },
      { id: "cm1", name: "CM", position: "MIDFIELDER", x: 25, y: 52 },
      { id: "cm2", name: "CM", position: "MIDFIELDER", x: 50, y: 52 },
      { id: "cm3", name: "CM", position: "MIDFIELDER", x: 75, y: 52 },
      { id: "lw", name: "VK", position: "ATTACKER", x: 20, y: 32 },
      { id: "st", name: "AN", position: "ATTACKER", x: 50, y: 32 },
      { id: "rw", name: "HK", position: "ATTACKER", x: 80, y: 32 }
    ]
  },
  "4-4-2": {
    positions: [
      { id: "gk", name: "MÅ", position: "GOALKEEPER", x: 50, y: 88 },
      { id: "lb", name: "VB", position: "DEFENDER", x: 15, y: 72 },
      { id: "cb1", name: "CB", position: "DEFENDER", x: 35, y: 72 },
      { id: "cb2", name: "CB", position: "DEFENDER", x: 65, y: 72 },
      { id: "rb", name: "HB", position: "DEFENDER", x: 85, y: 72 },
      { id: "lm", name: "VM", position: "MIDFIELDER", x: 20, y: 52 },
      { id: "cm1", name: "CM", position: "MIDFIELDER", x: 40, y: 52 },
      { id: "cm2", name: "CM", position: "MIDFIELDER", x: 60, y: 52 },
      { id: "rm", name: "HM", position: "MIDFIELDER", x: 80, y: 52 },
      { id: "st1", name: "AN", position: "ATTACKER", x: 35, y: 32 },
      { id: "st2", name: "AN", position: "ATTACKER", x: 65, y: 32 }
    ]
  },
  "3-5-2": {
    positions: [
      { id: "gk", name: "MÅ", position: "GOALKEEPER", x: 50, y: 88 },
      { id: "cb1", name: "CB", position: "DEFENDER", x: 25, y: 72 },
      { id: "cb2", name: "CB", position: "DEFENDER", x: 50, y: 72 },
      { id: "cb3", name: "CB", position: "DEFENDER", x: 75, y: 72 },
      { id: "lm", name: "VM", position: "MIDFIELDER", x: 15, y: 52 },
      { id: "cm1", name: "CM", position: "MIDFIELDER", x: 35, y: 52 },
      { id: "cm2", name: "CM", position: "MIDFIELDER", x: 50, y: 52 },
      { id: "cm3", name: "CM", position: "MIDFIELDER", x: 65, y: 52 },
      { id: "rm", name: "HM", position: "MIDFIELDER", x: 85, y: 52 },
      { id: "st1", name: "AN", position: "ATTACKER", x: 35, y: 32 },
      { id: "st2", name: "AN", position: "ATTACKER", x: 65, y: 32 }
    ]
  },
  "5-3-2": {
    positions: [
      { id: "gk", name: "MÅ", position: "GOALKEEPER", x: 50, y: 88 },
      { id: "lwb", name: "VB", position: "DEFENDER", x: 10, y: 72 },
      { id: "cb1", name: "CB", position: "DEFENDER", x: 30, y: 72 },
      { id: "cb2", name: "CB", position: "DEFENDER", x: 50, y: 72 },
      { id: "cb3", name: "CB", position: "DEFENDER", x: 70, y: 72 },
      { id: "rwb", name: "HB", position: "DEFENDER", x: 90, y: 72 },
      { id: "cm1", name: "CM", position: "MIDFIELDER", x: 35, y: 52 },
      { id: "cm2", name: "CM", position: "MIDFIELDER", x: 50, y: 52 },
      { id: "cm3", name: "CM", position: "MIDFIELDER", x: 65, y: 52 },
      { id: "st1", name: "AN", position: "ATTACKER", x: 35, y: 32 },
      { id: "st2", name: "AN", position: "ATTACKER", x: 65, y: 32 }
    ]
  }
};

export default function MyTeamPage() {
  const { user } = useAuth();
  
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFormation, setSelectedFormation] = useState("5-3-2");
  const [formationPlayers, setFormationPlayers] = useState<{[key: string]: Player}>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedPlayerForTransfer, setSelectedPlayerForTransfer] = useState<Player | null>(null);
  const [askingPrice, setAskingPrice] = useState("");
  const [minimumPrice, setMinimumPrice] = useState(0);
  const [isListingTransfer, setIsListingTransfer] = useState(false);
  const [isSettingCaptain, setIsSettingCaptain] = useState(false);

  // Load team data
  useEffect(() => {
    const loadTeamData = async () => {
      try {
        setLoading(true);
        const data = await authApiFetch('/api/teams/my-team');
        if (data) {
          setTeamData(data as TeamData);
          setSelectedFormation((data as TeamData).formation || "5-3-2");
        }
      } catch (err) {
        console.error("Error loading team data:", err);
        setError("Kunne ikke indlæse holddata");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadTeamData();
    }
  }, [user]);

  // Initialize formation players when team data loads
  useEffect(() => {
    if (teamData) {
      const initialFormation: {[key: string]: Player} = {};
      const usedPlayerIds = new Set<string>();
      
      teamData.players.forEach(player => {
        if (player.isStarter && player.formationPosition && !usedPlayerIds.has(player.id)) {
          initialFormation[player.formationPosition] = player;
          usedPlayerIds.add(player.id);
        }
      });
      
      // Ensure we don't exceed 11 players
      const players = Object.values(initialFormation);
      if (players.length > 11) {
        const limitedPlayers = players.slice(0, 11);
        const limitedFormation: {[key: string]: Player} = {};
        limitedPlayers.forEach((p, index) => {
          const positionId = Object.keys(initialFormation)[index];
          if (positionId) {
            limitedFormation[positionId] = p;
          }
        });
        setFormationPlayers(limitedFormation);
      } else {
        setFormationPlayers(initialFormation);
      }
    }
  }, [teamData]);

  // Update formation players when team data changes (after save)
  useEffect(() => {
    if (teamData) {
      const currentFormation = Object.values(formationPlayers);
      const teamStarters = teamData.players.filter(p => p.isStarter);
      
      // Only update if we have starters and they're different from current formation
      if (teamStarters.length > 0) {
        const currentPlayerIds = currentFormation.map(p => p.id).sort();
        const teamStarterIds = teamStarters.map(p => p.id).sort();
        
        // Check if the starter lists are different
        const needsUpdate = currentPlayerIds.length !== teamStarterIds.length ||
          currentPlayerIds.some((id, index) => id !== teamStarterIds[index]);
        
        if (needsUpdate) {
          const updatedFormation: {[key: string]: Player} = {};
          const positions = getFormationPositions();
          const usedPlayerIds = new Set<string>();
          
          // Place starters in their positions based on formationPosition
          teamStarters.forEach(player => {
            if (player.formationPosition) {
              // Use the saved formation position
              updatedFormation[player.formationPosition] = player;
              usedPlayerIds.add(player.id);
            } else {
              // Find a suitable position if no formation position is saved
              const position = positions.find(pos => 
                pos.position === player.position && !usedPlayerIds.has(player.id)
              );
              if (position) {
                updatedFormation[position.id] = player;
                usedPlayerIds.add(player.id);
              }
            }
          });
          
          setFormationPlayers(updatedFormation);
        }
      }
    }
  }, [teamData, selectedFormation]);

  // Get formation positions for current formation
  const getFormationPositions = () => {
    return formationDefinitions[selectedFormation as keyof typeof formationDefinitions]?.positions || [];
  };

  const addPlayerToFormation = (player: Player, positionId: string) => {
    setFormationPlayers(prev => {
      // Remove player from any existing position first
      const cleaned = Object.fromEntries(
        Object.entries(prev).filter(([_, p]) => p.id !== player.id)
      );
      
      // Add player to new position
      const updated = {
        ...cleaned,
        [positionId]: player
      };
      
      // Ensure we don't exceed 11 players
      const players = Object.values(updated);
      if (players.length > 11) {
        // Keep only the first 11 players
        const limitedPlayers = players.slice(0, 11);
        const limitedFormation: {[key: string]: Player} = {};
        limitedPlayers.forEach((p, index) => {
          const positionId = Object.keys(updated)[index];
          if (positionId) {
            limitedFormation[positionId] = p;
          }
        });
        return limitedFormation;
      }
      
      return updated;
    });
  };

  const removePlayerFromFormation = (positionId: string) => {
    setFormationPlayers(prev => {
      const newFormation = { ...prev };
      delete newFormation[positionId];
      return newFormation;
    });
  };

  // Auto-fill empty positions with suitable players
  const autoFillFormation = () => {
    if (!teamData) return;
    
    const positions = getFormationPositions();
    const newFormation: {[key: string]: Player} = {};
    const usedPlayerIds = new Set<string>();
    
    // First, try to place existing players in their preferred positions
    positions.forEach(pos => {
      const existingPlayer = Object.values(formationPlayers).find(p => 
        p.position === pos.position && !usedPlayerIds.has(p.id)
      );
      if (existingPlayer) {
        newFormation[pos.id] = existingPlayer;
        usedPlayerIds.add(existingPlayer.id);
      }
    });
    
    // Then fill remaining positions with suitable players from teamData
    positions.forEach(pos => {
      if (!newFormation[pos.id]) {
        const suitablePlayer = teamData.players.find(p => 
          p.position === pos.position && 
          !usedPlayerIds.has(p.id)
        );
        if (suitablePlayer) {
          newFormation[pos.id] = suitablePlayer;
          usedPlayerIds.add(suitablePlayer.id);
        }
      }
    });
    
    setFormationPlayers(newFormation);
  };

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

  // Calculate team rating dynamically based on current formation
  const calculateDynamicTeamRating = () => {
    const playersInFormation = Object.values(formationPlayers);
    
    // Ensure we don't exceed 11 players (football team limit)
    const validPlayers = playersInFormation.slice(0, 11);
    
    if (validPlayers.length === 0) {
      return 0;
    }

    const totalStats = validPlayers.reduce((sum, player) => {
      let playerStats = (player.speed || 0) + (player.shooting || 0) + (player.passing || 0) + 
                       (player.defending || 0) + (player.stamina || 0) + (player.reflexes || 0);
      
      // Captain bonus: +5 to all stats for the captain
      if (player.isCaptain) {
        playerStats += 30; // 5 points per stat * 6 stats
      }
      
      return sum + playerStats;
    }, 0);

    const averageStats = totalStats / (validPlayers.length * 6); // 6 stats per player
    
    // Penalty for incomplete teams (less than 11 players)
    if (validPlayers.length < 11) {
      const penalty = (11 - validPlayers.length) * 3; // 3 points penalty per missing player
      return Math.max(0, Math.round(averageStats - penalty));
    }
    
    // Minimum team strength requirement
    if (validPlayers.length < 5) {
      return 0; // Teams with less than 5 players have 0 strength
    }
    
    return Math.round(averageStats);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
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
      <div className="space-y-6 p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Intet hold fundet'}</p>
          <Button onClick={() => window.location.reload()}>
            Prøv igen
          </Button>
        </div>
      </div>
    );
  }

  const currentTeamRating = calculateDynamicTeamRating();

  // Transfer functions
  const handleTransferClick = async (player: Player) => {
    try {
      setSelectedPlayerForTransfer(player);
      setAskingPrice("");
      
      // Get minimum price for the player
      const response = await authApiFetch(`/api/transfers/minimum-price/${player.id}`) as any;
      if (response) {
        setMinimumPrice(response.minimumPrice);
        setAskingPrice(response.suggestedPrice.toString());
      }
      
      setTransferModalOpen(true);
    } catch (error) {
      console.error("Error getting minimum price:", error);
      setError("Kunne ikke hente minimumspris for spilleren");
    }
  };

  const handleListForTransfer = async () => {
    if (!selectedPlayerForTransfer || !askingPrice) return;
    
    try {
      setIsListingTransfer(true);
      const response = await authApiFetch(`/api/transfers/list/${selectedPlayerForTransfer.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          askingPrice: parseInt(askingPrice)
        })
      });
      
      if (response) {
        setTransferModalOpen(false);
        setSelectedPlayerForTransfer(null);
        setAskingPrice("");
        // Reload team data to reflect changes
        const data = await authApiFetch('/api/teams/my-team');
        if (data) {
          setTeamData(data as TeamData);
        }
      }
    } catch (error: any) {
      console.error("Error listing player for transfer:", error);
      setError(error.message || "Kunne ikke sætte spiller på transfer");
    } finally {
      setIsListingTransfer(false);
    }
  };

  // Captain functions
  const handleSetCaptain = async (player: Player) => {
    if (!teamData) return;
    
    // Check if player is in formation
    const isInFormation = Object.values(formationPlayers).some(p => p.id === player.id);
    if (!isInFormation) {
      alert("Kaptajnen skal være i formationen!");
      return;
    }
    
    try {
      setIsSettingCaptain(true);
      const response = await authApiFetch(`/api/teams/${teamData.id}/captain/${player.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response) {
        // Update local team data
        setTeamData(prev => prev ? {
          ...prev,
          players: prev.players.map(p => ({
            ...p,
            isCaptain: p.id === player.id
          }))
        } : null);
        
        // Update formation players if the captain is in formation
        setFormationPlayers(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(key => {
            if (updated[key].id === player.id) {
              updated[key] = { ...updated[key], isCaptain: true };
            } else {
              updated[key] = { ...updated[key], isCaptain: false };
            }
          });
          return updated;
        });
        
        alert(`${player.name} er nu kaptajn!`);
      }
    } catch (error: any) {
      console.error("Error setting captain:", error);
      setError(error.message || "Kunne ikke sætte kaptajn");
    } finally {
      setIsSettingCaptain(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold">Mit Hold</h1>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              Rating: {currentTeamRating}
              {currentTeamRating !== (teamData.overallRating || 0) && (
                <span className="ml-2 text-orange-600">(ændret)</span>
              )}
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              Formation: {Math.min(Object.values(formationPlayers).length, 11)}/11
            </div>
            <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
              Total: {teamData?.players.length || 0} spillere
            </div>
          </div>
          
          {/* Formation and Captain Selectors */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold text-muted-foreground">Formation:</span>
              <Select value={selectedFormation} onValueChange={(newFormation) => {
                setSelectedFormation(newFormation);
                // Clear formation and auto-fill with existing players when formation changes
                setFormationPlayers({});
                setTimeout(() => {
                  autoFillFormation();
                }, 100);
              }}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Vælg formation" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(formationDefinitions).map((formation) => (
                    <SelectItem key={formation} value={formation}>
                      {formation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold text-muted-foreground">Kaptajn:</span>
              <Select 
                value={Object.values(formationPlayers).find(p => p.isCaptain)?.id || ""} 
                onValueChange={(playerId) => {
                  const player = Object.values(formationPlayers).find(p => p.id === playerId);
                  if (player) {
                    handleSetCaptain(player);
                  }
                }}
                disabled={isSettingCaptain || Object.values(formationPlayers).length === 0}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={Object.values(formationPlayers).length === 0 ? "Ingen spillere i formation" : "Vælg kaptajn"} />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(formationPlayers).map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      <div className="flex items-center space-x-2">
                        {player.isCaptain && <Crown className="w-4 h-4 text-yellow-600" />}
                        <span>{player.name}</span>
                        <span className="text-sm text-muted-foreground">({getPositionName(player.position)})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Annullér
          </Button>
          <Button variant="outline" onClick={autoFillFormation}>
            Auto-fyld
          </Button>
          <Button onClick={async () => {
            try {
              const starters = Object.values(formationPlayers).map(player => player.id);
              const formationPositions: {[key: string]: string} = {};
              Object.entries(formationPlayers).forEach(([positionId, player]) => {
                formationPositions[player.id] = positionId;
              });
              
              
              const response = await authApiFetch(`/api/teams/${teamData.id}/starters`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ starters, formationPositions, formation: selectedFormation }),
              });

              if (response) {
                // Update local team data with new rating and formation
                setTeamData(prev => prev ? {
                  ...prev,
                  overallRating: currentTeamRating,
                  formation: selectedFormation,
                  players: prev.players.map(player => {
                    const isStarter = Object.values(formationPlayers).some(fp => fp.id === player.id);
                    const formationPosition = isStarter ? 
                      Object.entries(formationPlayers).find(([_, p]) => p.id === player.id)?.[0] : undefined;
                    
                    return {
                      ...player,
                      isStarter,
                      formationPosition: formationPosition || undefined
                    };
                  })
                } : null);
                alert("Holdopstilling gemt!");
              }
            } catch (err) {
              console.error("Error saving formation:", err);
              alert("Fejl: Kunne ikke gemme holdopstillingen. Prøv igen.");
            }
          }}>
            Gem
          </Button>
        </div>
      </div>

      {/* Football Field */}
      <div className="relative bg-gradient-to-b from-green-500 to-green-700 rounded-lg h-[600px] border-4 border-white overflow-hidden shadow-lg max-w-6xl mx-auto">
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
        {getFormationPositions().map((pos) => {
          const player = formationPlayers[pos.id];
          return (
            <div
              key={pos.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              {player ? (
                <div 
                  className="flex flex-col items-center p-4 bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all cursor-pointer min-w-[110px] border-2 border-gray-600 hover:border-red-500"
                  onClick={() => removePlayerFromFormation(pos.id)}
                  title="Klik for at fjerne spiller"
                >
                  <PlayerAvatar 
                    playerName={player.name}
                    position={player.position}
                    size={36}
                    className="rounded-full"
                  />
                  <span className="text-sm font-bold mt-2 text-center text-black bg-white px-2 py-1 rounded border border-gray-300">{player.name}</span>
                  <span className="text-xs font-bold text-white bg-blue-700 px-2 py-1 rounded mt-1 border border-blue-800">{pos.name}</span>
                  {player.isCaptain && (
                    <Crown className="w-6 h-6 text-yellow-700 mt-1 drop-shadow-lg" />
                  )}
                </div>
              ) : (
                <div 
                  className="flex flex-col items-center p-4 bg-yellow-200 rounded-lg border-2 border-dashed border-yellow-700 min-w-[110px] hover:bg-yellow-300 transition-colors cursor-pointer"
                  onClick={() => {
                    // Find a suitable player for this position
                    const suitablePlayer = teamData.players.find(p => 
                      p.position === pos.position && 
                      !Object.values(formationPlayers).some(fp => fp.id === p.id)
                    );
                    if (suitablePlayer) {
                      addPlayerToFormation(suitablePlayer, pos.id);
                    }
                  }}
                  title="Klik for at tilføje spiller"
                >
                  <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-xl">+</span>
                  </div>
                  <span className="text-xs font-bold mt-2 text-center text-yellow-900 bg-yellow-100 px-2 py-1 rounded border border-yellow-400">{pos.name}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Player List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Spillere</h2>
        
        {/* Search */}
        <div className="flex items-center space-x-2 mb-6">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Søg efter spiller..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Player Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {teamData.players
            .filter(player => player.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((player) => {
              const isInFormation = Object.values(formationPlayers).some(p => p.id === player.id);
              const positions = getFormationPositions();
              const suitablePosition = positions.find(pos => 
                pos.position === player.position && !formationPlayers[pos.id]
              );
              const canAdd = !isInFormation && suitablePosition;
              
              
              return (
              <Card 
                key={player.id} 
                className={`hover:shadow-lg transition-all cursor-pointer ${canAdd ? 'hover:bg-green-50' : 'opacity-50 cursor-not-allowed'}`}
                onClick={() => {
                  if (canAdd) {
                    addPlayerToFormation(player, suitablePosition.id);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <PlayerAvatar 
                        playerName={player.name}
                        position={player.position}
                        size={40}
                        className="rounded-full"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-lg">{player.name}</p>
                          {player.isCaptain && (
                            <Crown className="w-4 h-4 text-yellow-700" />
                          )}
                        </div>
                        <Badge className={`${getPositionColor(player.position)} font-bold text-xs px-2 py-1`}>
                          {getPositionName(player.position)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTransferClick(player);
                        }}
                        className="text-xs px-2 py-1 h-7"
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Transfer
                      </Button>
                      <div className="w-8 h-8 rounded-full shadow-lg font-bold flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center justify-center bg-yellow-200 px-2 py-1 rounded-md border-2 border-yellow-400 mb-3">
                    <Star className="w-3 h-3 mr-1 text-yellow-800" />
                    <span className="font-bold text-sm text-yellow-900">
                      {player.rating}
                    </span>
                  </div>
                  
                  {/* Player Stats */}
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground font-semibold text-center">Evner:</div>
                    <div className="flex justify-center space-x-3">
                      {/* Speed */}
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center border border-blue-300">
                          <Zap className="w-3 h-3 text-blue-800" />
                        </div>
                        <div className="text-xs font-bold mt-1">{player.speed || 'N/A'}</div>
                      </div>
                      
                      {/* Shooting */}
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center border border-red-300">
                          <Swords className="w-3 h-3 text-red-800" />
                        </div>
                        <div className="text-xs font-bold mt-1">{player.shooting || 'N/A'}</div>
                      </div>
                      
                      {/* Passing */}
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center border border-green-300">
                          <ArrowRightLeft className="w-3 h-3 text-green-800" />
                        </div>
                        <div className="text-xs font-bold mt-1">{player.passing || 'N/A'}</div>
                      </div>
                      
                      {/* Defense */}
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center border border-purple-300">
                          <Shield className="w-3 h-3 text-purple-800" />
                        </div>
                        <div className="text-xs font-bold mt-1">{player.defending || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              );
            })}
        </div>
      </div>

      {/* Transfer Modal */}
      <Dialog open={transferModalOpen} onOpenChange={setTransferModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sæt spiller på transfer</DialogTitle>
            <DialogDescription>
              Sæt {selectedPlayerForTransfer?.name} på transfermarkedet
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <PlayerAvatar 
                playerName={selectedPlayerForTransfer?.name || ''}
                position={selectedPlayerForTransfer?.position || ''}
                size={40}
                className="rounded-full"
              />
              <div>
                <p className="font-semibold text-black">{selectedPlayerForTransfer?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {getPositionName(selectedPlayerForTransfer?.position || '')} • Rating: {selectedPlayerForTransfer?.rating}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="askingPrice">Asking pris</Label>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="askingPrice"
                  type="number"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(e.target.value)}
                  placeholder="Indtast asking pris"
                  min={minimumPrice}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum pris: {minimumPrice.toLocaleString()} kr
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTransferModalOpen(false)}
              disabled={isListingTransfer}
            >
              Annuller
            </Button>
            <Button
              onClick={handleListForTransfer}
              disabled={!askingPrice || parseInt(askingPrice) < minimumPrice || isListingTransfer}
            >
              {isListingTransfer ? 'Sætter på transfer...' : 'Sæt på transfer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}