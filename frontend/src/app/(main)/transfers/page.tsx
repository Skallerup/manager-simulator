"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { authApiFetch } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ShoppingCart, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Star,
  UserPlus,
  UserMinus,
  X
} from "lucide-react";
import { PlayerAvatar } from "@/components/player-avatar";

interface Player {
  id: string;
  name: string;
  age: number;
  position: string;
  speed: number;
  shooting: number;
  passing: number;
  defending: number;
  stamina: number;
  reflexes: number;
  marketValue: number;
  isGenerated: boolean;
}

interface Transfer {
  id: string;
  playerId: string;
  fromTeamId: string | null;
  toTeamId: string | null;
  askingPrice: number;
  status: string;
  createdAt: string;
  player: Player;
  fromTeam?: {
    id: string;
    name: string;
  };
  toTeam?: {
    id: string;
    name: string;
  };
}

interface TeamData {
  id: string;
  name: string;
  budget: number;
  players: {
    id: string;
    name: string;
    position: string;
    age: number;
    rating: number;
    isCaptain: boolean;
    isStarter: boolean;
  }[];
}

export default function TransfersPage() {
  const { user } = useAuth();
  const { t } = useTranslation('transfers');
  const [availableTransfers, setAvailableTransfers] = useState<Transfer[]>([]);
  const [freeTransferPlayers, setFreeTransferPlayers] = useState<Transfer[]>([]);
  const [myTransfers, setMyTransfers] = useState<Transfer[]>([]);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [askingPrice, setAskingPrice] = useState<string>("");
  const [playerMinimumPrices, setPlayerMinimumPrices] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch available transfers
        const transfersResponse = await authApiFetch('/api/transfers/available');
        if (transfersResponse) {
          setAvailableTransfers(transfersResponse as Transfer[]);
        }

        // Fetch free transfer players
        const freeTransferResponse = await authApiFetch('/api/transfers/free-transfer');
        if (freeTransferResponse) {
          setFreeTransferPlayers(freeTransferResponse as Transfer[]);
        }

        // Fetch my transfers
        const myTransfersResponse = await authApiFetch('/api/transfers/my-team');
        if (myTransfersResponse) {
          setMyTransfers(myTransfersResponse as Transfer[]);
        }

        // Fetch team data
        const teamResponse = await authApiFetch('/api/teams/my-team');
        if (teamResponse) {
          setTeamData(teamResponse as TeamData);
        }
      } catch (err) {
        setError('Failed to load transfer data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const buyPlayer = async (transferId: string) => {
    try {
      const response = await authApiFetch(`/api/transfers/buy/${transferId}`, {
        method: 'POST'
      });
      
      if (response) {
        // Refresh data
        window.location.reload();
      } else {
        setError('Failed to buy player');
      }
    } catch (err: any) {
      console.error('Error buying player:', err);
      // Extract error message from response
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to buy player';
      setError(errorMessage);
    }
  };

  const listPlayerForTransfer = async (playerId: string) => {
    if (!askingPrice || isNaN(Number(askingPrice))) {
      setError('Please enter a valid asking price');
      return;
    }

    try {
      const response = await authApiFetch(`/api/transfers/list/${playerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ askingPrice: Number(askingPrice) }) // Price already in øre
      });
      
      if (response) {
        setSelectedPlayer(null);
        setAskingPrice("");
        // Refresh data
        window.location.reload();
      } else {
        setError('Failed to list player for transfer');
      }
    } catch (err: any) {
      console.error('Error listing player for transfer:', err);
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to list player for transfer';
      setError(errorMessage);
    }
  };

  const cancelTransfer = async (transferId: string) => {
    try {
      const response = await authApiFetch(`/api/transfers/cancel/${transferId}`, {
        method: 'DELETE'
      });
      
      if (response) {
        // Refresh data
        window.location.reload();
      } else {
        setError('Failed to cancel transfer');
      }
    } catch (err) {
      setError('Failed to cancel transfer');
    }
  };

  const firePlayer = async (playerId: string) => {
    if (!confirm('Er du sikker på at du vil fyre denne spiller? De vil blive tilgængelige gratis for andre hold.')) {
      return;
    }

    try {
      const response = await authApiFetch(`/api/transfers/fire/${playerId}`, {
        method: 'DELETE'
      });
      
      if (response) {
        // Refresh data
        window.location.reload();
      } else {
        setError('Failed to fire player');
      }
    } catch (err: any) {
      console.error('Error firing player:', err);
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to fire player';
      setError(errorMessage);
    }
  };

  const signFreeTransferPlayer = async (playerId: string) => {
    try {
      const response = await authApiFetch(`/api/transfers/sign-free/${playerId}`, {
        method: 'POST'
      });
      
      if (response) {
        // Refresh data
        window.location.reload();
      } else {
        setError('Failed to sign free transfer player');
      }
    } catch (err: any) {
      console.error('Error signing free transfer player:', err);
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to sign free transfer player';
      setError(errorMessage);
    }
  };

  const calculatePlayerRating = (player: Player) => {
    return Math.round((player.speed + player.shooting + player.passing + 
                      player.defending + player.stamina + player.reflexes) / 6);
  };

  const fetchPlayerMinimumPrice = async (playerId: string) => {
    try {
      const response = await authApiFetch(`/api/transfers/minimum-price/${playerId}`);
      if (response) {
        setPlayerMinimumPrices(prev => ({
          ...prev,
          [playerId]: response
        }));
        // Set minimum price as default
        setAskingPrice((response as any).minimumPrice.toString());
      }
    } catch (err) {
      console.error('Error fetching minimum price:', err);
    }
  };

  const formatPrice = (price: number) => {
    return (price / 100).toLocaleString('da-DK') + ' kr';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading transfers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        {teamData && (
          <div className="text-right space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">{t('budget')}</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPrice(teamData.budget)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Spillere</p>
              <p className="text-lg font-semibold">
                {teamData.players?.length || 0}/16
                {(teamData.players?.length || 0) >= 16 && (
                  <span className="text-red-500 ml-1">(Fuld)</span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available">{t('availablePlayers')}</TabsTrigger>
          <TabsTrigger value="free-transfer">{t('freeTransfer')}</TabsTrigger>
          <TabsTrigger value="my-transfers">{t('myTransfers')}</TabsTrigger>
          <TabsTrigger value="my-players">{t('myPlayers')}</TabsTrigger>
        </TabsList>

        {/* Available Players */}
        <TabsContent value="available" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                {t('availablePlayers')}
              </CardTitle>
              <CardDescription>
                {t('availablePlayersDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableTransfers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {t('noPlayersAvailable')}
                </p>
              ) : (
                <div className="space-y-4">
                  {(teamData?.players?.length || 0) >= 16 && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                      <p className="text-orange-600 dark:text-orange-400 font-semibold mb-1">
                        {t('teamFull')}
                      </p>
                      <p className="text-orange-500 dark:text-orange-300 text-sm">
                        Du skal sælge spillere før du kan købe nye. Gå til "Mine Spillere" tab for at liste spillere til salg.
                      </p>
                    </div>
                  )}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {availableTransfers.map((transfer) => (
                      <Card key={transfer.id} className="relative">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <PlayerAvatar 
                              playerName={transfer.player.name}
                              position={transfer.player.position}
                              size={48}
                              className="flex-shrink-0"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold">{transfer.player.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {transfer.player.age} years • {transfer.player.position}
                              </p>
                            </div>
                            <Badge variant="secondary">
                              {calculatePlayerRating(transfer.player)} OVR
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                            <div className="flex justify-between">
                              <span>{t('speed')}:</span>
                              <span>{transfer.player.speed}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{t('shooting')}:</span>
                              <span>{transfer.player.shooting}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{t('passing')}:</span>
                              <span>{transfer.player.passing}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{t('defending')}:</span>
                              <span>{transfer.player.defending}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-bold text-green-600">
                                {formatPrice(transfer.askingPrice)}
                              </p>
                              {transfer.fromTeam && (
                                <p className="text-xs text-muted-foreground">
                                  From: {transfer.fromTeam.name}
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => buyPlayer(transfer.id)}
                              disabled={!teamData || teamData.budget < transfer.askingPrice || (teamData?.players?.length || 0) >= 16}
                              title={
                                !teamData 
                                  ? t('loading') 
                                  : teamData.budget < transfer.askingPrice 
                                    ? t('insufficientBudget') 
                                    : (teamData?.players?.length || 0) >= 16
                                      ? t('teamFull')
                                      : t('buy')
                              }
                            >
                              <UserPlus className="w-4 h-4 mr-1" />
                              {t('buy')}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Free Transfer Players */}
        <TabsContent value="free-transfer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserMinus className="w-5 h-5" />
                {t('freeTransfer')}
              </CardTitle>
              <CardDescription>
                {t('freeTransferDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {freeTransferPlayers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {t('noFreeTransferPlayers')}
                </p>
              ) : (
                <div className="space-y-4">
                  {(teamData?.players?.length || 0) >= 16 && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                      <p className="text-orange-600 dark:text-orange-400 font-semibold mb-1">
                        {t('teamFull')}
                      </p>
                      <p className="text-orange-500 dark:text-orange-300 text-sm">
                        Du skal sælge spillere før du kan hente nye. Gå til "Mine Spillere" tab for at liste spillere til salg.
                      </p>
                    </div>
                  )}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {freeTransferPlayers.map((transfer) => (
                      <Card key={transfer.id} className="relative">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <PlayerAvatar 
                              playerName={transfer.player.name}
                              position={transfer.player.position}
                              size={48}
                              className="flex-shrink-0"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold">{transfer.player.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {transfer.player.age} years • {transfer.player.position}
                              </p>
                            </div>
                            <Badge variant="secondary">
                              {calculatePlayerRating(transfer.player)} OVR
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                            <div className="flex justify-between">
                              <span>{t('speed')}:</span>
                              <span>{transfer.player.speed}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{t('shooting')}:</span>
                              <span>{transfer.player.shooting}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{t('passing')}:</span>
                              <span>{transfer.player.passing}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{t('defending')}:</span>
                              <span>{transfer.player.defending}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-bold text-green-600">
                                GRATIS
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Fyret spiller
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => signFreeTransferPlayer(transfer.playerId)}
                              disabled={(teamData?.players?.length || 0) >= 16}
                              title={
                                (teamData?.players?.length || 0) >= 16
                                  ? t('teamFull')
                                  : t('signFree')
                              }
                            >
                              <UserPlus className="w-4 h-4 mr-1" />
                              {t('signFree')}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Transfers */}
        <TabsContent value="my-transfers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {t('myTransfers')}
              </CardTitle>
              <CardDescription>
                {t('myTransfersDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myTransfers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {t('noTransfersListed')}
                </p>
              ) : (
                <div className="space-y-4">
                  {myTransfers.map((transfer) => (
                    <Card key={transfer.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{transfer.player.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {transfer.player.age} years • {transfer.player.position} • 
                              {calculatePlayerRating(transfer.player)} OVR
                            </p>
                            <p className="text-lg font-bold text-green-600">
                              {formatPrice(transfer.askingPrice)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              transfer.status === 'LISTED' ? 'default' :
                              transfer.status === 'COMPLETED' ? 'secondary' : 'destructive'
                            }>
                              {transfer.status}
                            </Badge>
                            {transfer.status === 'LISTED' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => cancelTransfer(transfer.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Players */}
        <TabsContent value="my-players" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t('myPlayers')}
              </CardTitle>
              <CardDescription>
                {t('myPlayersDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!teamData ? (
                <p className="text-center text-muted-foreground py-8">
                  {t('noTeamData')}
                </p>
              ) : (
                <div className="space-y-4">
                  {teamData.players.map((player) => (
                    <Card key={player.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <PlayerAvatar 
                            playerName={player.name}
                            position={player.position}
                            size={48}
                            className="flex-shrink-0"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold flex items-center gap-2">
                              {player.name}
                              {player.isCaptain && (
                                <Star className="w-4 h-4 text-yellow-500" />
                              )}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {player.age} years • {player.position} • {player.rating} OVR
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedPlayer === player.id ? (
                              <div className="flex items-center gap-2">
                                <div className="space-y-1">
                                  <Input
                                    type="number"
                                    placeholder="Asking price"
                                    value={askingPrice}
                                    onChange={(e) => setAskingPrice(e.target.value)}
                                    className="w-32"
                                    min={playerMinimumPrices[player.id]?.minimumPrice || 0}
                                  />
                                  {playerMinimumPrices[player.id] && (
                                    <p className="text-xs text-muted-foreground">
                                      Min: {playerMinimumPrices[player.id].formattedMinimumPrice}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => listPlayerForTransfer(player.id)}
                                >
                                  List
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedPlayer(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedPlayer(player.id);
                                    fetchPlayerMinimumPrice(player.id);
                                  }}
                                >
                                  <UserMinus className="w-4 h-4 mr-1" />
                                  {t('listForTransfer')}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => firePlayer(player.id)}
                                  title="Fyr spiller - de bliver tilgængelige gratis for andre hold"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  {t('firePlayer')}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
