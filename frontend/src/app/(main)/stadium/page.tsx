"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FacilityType, formatCurrency } from "@/lib/stadium";
import { useTranslation } from 'react-i18next';
import { Loader2, AlertCircle, Building2, Users, TrendingUp, DollarSign, Plus, Settings } from "lucide-react";
import { authApiFetch } from "@/lib/api";

interface Stadium {
  id: string;
  name: string;
  capacity: number;
  tier: number;
  atmosphere: number;
  maintenanceCost: number;
  monthlyRevenue: number;
  homeAdvantage: number;
  prestige: number;
  teamId: string;
  facilities: any[];
  upgrades: any[];
}

interface StadiumStats {
  totalCapacity: number;
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  atmosphere: number;
  prestige: number;
  homeAdvantage: number;
  activeFacilities: number;
  activeUpgrades: number;
}

interface TeamData {
  id: string;
  name: string;
  budget: number;
}

export default function StadiumPage() {
  const { t } = useTranslation('stadium');
  const [activeTab, setActiveTab] = useState("overview");
  const [stadium, setStadium] = useState<Stadium | null>(null);
  const [stats, setStats] = useState<StadiumStats | null>(null);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStadiumData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get team data first to get teamId
      const team = await authApiFetch('/api/teams/my-team');
      if (!team || !team.id) {
        throw new Error('No team found');
      }
      
      setTeamData(team);
      
      // Get stadium data in parallel
      const [stadiumData, statsData] = await Promise.all([
        authApiFetch(`/api/stadium/${team.id}`),
        authApiFetch(`/api/stadium/${team.id}/stats`)
      ]);
      
      setStadium(stadiumData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stadium data');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAction = useCallback(async (action: () => Promise<any>, actionId: string) => {
    try {
      setActionLoading(actionId);
      await action();
      await fetchStadiumData(); // Refresh data
    } catch (err) {
      console.error(`Error in ${actionId}:`, err);
      setError(err instanceof Error ? err.message : `Failed to ${actionId}`);
    } finally {
      setActionLoading(null);
    }
  }, [fetchStadiumData]);

  const createFacility = useCallback(async (name: string, type: FacilityType, level: number) => {
    if (!teamData) return;
    
    await authApiFetch(`/api/stadium/${teamData.id}/facilities`, {
      method: 'POST',
      body: JSON.stringify({ name, type, level })
    });
  }, [teamData]);

  const createUpgrade = useCallback(async (name: string, type: string, cost: number, duration: number) => {
    if (!teamData) return;
    
    await authApiFetch(`/api/stadium/${teamData.id}/upgrades`, {
      method: 'POST',
      body: JSON.stringify({ name, type, cost, duration })
    });
  }, [teamData]);

  useEffect(() => {
    fetchStadiumData();
  }, [fetchStadiumData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Indlæser stadion data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="max-w-md p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <div className="text-red-800">
              {error}
              <button 
                onClick={fetchStadiumData}
                className="ml-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm"
              >
                Prøv igen
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stadium || !stats || !teamData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="max-w-md p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <div className="text-red-800">
              Kunne ikke indlæse stadion data
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", name: "Oversigt", icon: Building2 },
    { id: "capacity", name: "Kapacitet", icon: Users },
    { id: "facilities", name: "Faciliteter", icon: Building2 },
    { id: "experience", name: "Fan Oplevelse", icon: TrendingUp },
    { id: "economy", name: "Økonomi", icon: DollarSign },
  ];

  const facilityTypes = [
    { name: "LED Skærme", type: "LED_SCREENS", cost: 15000, level: 1 },
    { name: "VIP Lounge", type: "VIP_LOUNGE", cost: 25000, level: 1 },
    { name: "Fan Zone", type: "FAN_ZONE", cost: 8000, level: 1 },
    { name: "Parkering", type: "PARKING", cost: 20000, level: 1 },
    { name: "Mad & Drikke", type: "FOOD_BEVERAGE", cost: 12000, level: 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            {stadium.name}
          </h1>
          <p className="text-muted-foreground">Administrer dit stadion og dets faciliteter</p>
        </div>
        <button 
          onClick={fetchStadiumData} 
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Opdater
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Kapacitet</p>
                <p className="text-2xl font-bold">{stadium.capacity.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Atmosfære</p>
                <p className="text-2xl font-bold">{stadium.atmosphere}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Månedlig Indtægt</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Faciliteter</p>
                <p className="text-2xl font-bold">{stats.activeFacilities}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stadion Oversigt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Grundlæggende Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Navn:</span>
                        <span className="font-medium">{stadium.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kapacitet:</span>
                        <span className="font-medium">{stadium.capacity.toLocaleString()} sæder</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tier:</span>
                        <span className="font-medium">Level {stadium.tier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Atmosfære:</span>
                        <span className="font-medium">{stadium.atmosphere}%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Økonomi</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Månedlig Indtægt:</span>
                        <span className="font-medium text-green-600">{formatCurrency(stadium.monthlyRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vedligeholdelse:</span>
                        <span className="font-medium text-red-600">{formatCurrency(stadium.maintenanceCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hjemmefordel:</span>
                        <span className="font-medium">+{(stadium.homeAdvantage * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "capacity" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kapacitet & Udvidelse</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Nuværende Kapacitet</h4>
                    <div className="text-3xl font-bold">{stadium.capacity.toLocaleString()} sæder</div>
                    <div className="text-sm text-muted-foreground">Tier {stadium.tier}</div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Kapacitet Udvidelse</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Udvid dit stadion til næste tier for at øge kapaciteten og indtægterne.
                    </p>
                    <button 
                      onClick={() => handleAction(
                        () => createUpgrade("Kapacitet Udvidelse", "CAPACITY_EXPANSION", 5000000, 60),
                        "capacity-upgrade"
                      )}
                      disabled={teamData.budget < 5000000 || actionLoading === "capacity-upgrade"}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {actionLoading === "capacity-upgrade" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      Udvid til Tier {stadium.tier + 1} (5,000,000 DKK)
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "facilities" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stadion Faciliteter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Nye Faciliteter</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {facilityTypes.map((facility) => (
                        <div key={facility.type} className="border rounded-lg p-4">
                          <h5 className="font-medium">{facility.name}</h5>
                          <p className="text-sm text-muted-foreground mb-2">
                            Level {facility.level} • {formatCurrency(facility.cost)}
                          </p>
                          <button 
                            onClick={() => handleAction(
                              () => createFacility(facility.name, facility.type as FacilityType, facility.level),
                              `facility-${facility.type}`
                            )}
                            disabled={teamData.budget < facility.cost || actionLoading === `facility-${facility.type}`}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {actionLoading === `facility-${facility.type}` ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}
                            Tilføj
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "experience" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fan Oplevelse</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Atmosfære</h4>
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold">{stadium.atmosphere}%</div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${stadium.atmosphere}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Prestige</h4>
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold">{stadium.prestige}</div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${stadium.prestige}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "economy" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Økonomi & Indtægter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</div>
                      <div className="text-sm text-muted-foreground">Månedlig Indtægt</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalCost)}</div>
                      <div className="text-sm text-muted-foreground">Månedlige Omkostninger</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(stats.netProfit)}
                      </div>
                      <div className="text-sm text-muted-foreground">Netto Profit</div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Billet Priser</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Basic</label>
                        <input 
                          type="number" 
                          defaultValue="150" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Premium</label>
                        <input 
                          type="number" 
                          defaultValue="300" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">VIP</label>
                        <input 
                          type="number" 
                          defaultValue="500" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Opdater Priser
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}