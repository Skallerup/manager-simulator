"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FacilityType, formatCurrency } from "@/lib/stadium";
import { useTranslation } from 'react-i18next';
import { Loader2, AlertCircle, Building2, Users, TrendingUp, DollarSign, Plus, Settings, Info, Calculator, Target } from "lucide-react";
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

// Facility explanations
const getFacilityExplanation = (type: FacilityType) => {
  const explanations: Record<FacilityType, { title: string; description: string; benefits: string[] }> = {
    SEATING: {
      title: "Siddepladser",
      description: "Forbedrer komforten for tilskuere og øger kapaciteten",
      benefits: ["Øger kapacitet", "Forbedrer atmosfære", "Højere indtægter"]
    },
    LED_SCREENS: {
      title: "LED Skærme",
      description: "Moderne skærme der viser kampstatistikker og reklamer",
      benefits: ["Øger sponsorindtægter", "Forbedrer fanoplevelse", "Moderne udseende"]
    },
    SOUND_SYSTEM: {
      title: "Lydanlæg",
      description: "Højttalere der skaber bedre atmosfære under kampe",
      benefits: ["Forbedrer atmosfære", "Bedre fanoplevelse", "Højere prestige"]
    },
    LIGHTING: {
      title: "Belysning",
      description: "Professionel belysning til kampe og events",
      benefits: ["Bedre TV-kvalitet", "Fleksible spilletider", "Højere prestige"]
    },
    PARKING: {
      title: "Parkering",
      description: "Parkering for tilskuere og VIP-gæster",
      benefits: ["Øger tilgængelighed", "VIP-indtægter", "Bedre fanoplevelse"]
    },
    TRANSPORT: {
      title: "Transport",
      description: "Bus- og togforbindelser til stadion",
      benefits: ["Øger tilgængelighed", "Flere tilskuere", "Miljøvenlig"]
    },
    FAN_ZONE: {
      title: "Fan Zone",
      description: "Område med aktiviteter og underholdning for fans",
      benefits: ["Øger atmosfære", "Højere indtægter", "Bedre fanoplevelse"]
    },
    MERCHANDISE: {
      title: "Merchandise",
      description: "Butikker der sælger holdtrøjer og souvenirs",
      benefits: ["Højere indtægter", "Brand awareness", "Fan engagement"]
    },
    FOOD_BEVERAGE: {
      title: "Mad & Drikke",
      description: "Restauranter og barer i stadion",
      benefits: ["Højere indtægter", "Bedre fanoplevelse", "Længere ophold"]
    },
    VIP_LOUNGE: {
      title: "VIP Lounge",
      description: "Eksklusivt område for VIP-gæster",
      benefits: ["Høje VIP-indtægter", "Sponsorforhold", "Prestige"]
    },
    WIFI: {
      title: "WiFi",
      description: "Gratis internetadgang for tilskuere",
      benefits: ["Bedre fanoplevelse", "Social media engagement", "Moderne faciliteter"]
    },
    ACCESSIBILITY: {
      title: "Tilgængelighed",
      description: "Faciliteter for handicappede tilskuere",
      benefits: ["Inklusion", "Flere tilskuere", "Positivt omdømme"]
    },
    SECURITY: {
      title: "Sikkerhed",
      description: "Sikkerhedssystemer og personale",
      benefits: ["Sikkerhed", "Professionel drift", "Tillid"]
    },
    MEDIA: {
      title: "Medie",
      description: "Faciliteter for journalister og TV-hold",
      benefits: ["Bedre mediedækning", "Højere prestige", "Sponsorværdi"]
    },
    SPONSOR: {
      title: "Sponsor",
      description: "Reklamepladser og sponsorfaciliteter",
      benefits: ["Højere sponsorindtægter", "Brand exposure", "Økonomisk stabilitet"]
    }
  };
  
  return explanations[type] || { title: type, description: "Facilitet", benefits: [] };
};

// Upgrade explanations
const getUpgradeExplanation = (type: string) => {
  const explanations: Record<string, { title: string; description: string; benefits: string[]; duration: string }> = {
    CAPACITY_EXPANSION: {
      title: "Kapacitet Udvidelse",
      description: "Udvid dit stadion til næste tier for at øge kapaciteten betydeligt",
      benefits: ["Øger kapacitet med 10,000+ sæder", "Højere indtægter", "Bedre prestige", "Flere tilskuere"],
      duration: "60 dage"
    },
    FACILITY_UPGRADE: {
      title: "Facilitet Opgradering",
      description: "Opgrader eksisterende faciliteter til højere niveau",
      benefits: ["Bedre faciliteter", "Højere indtægter", "Forbedret fanoplevelse", "Moderne udstyr"],
      duration: "30 dage"
    },
    NEW_FACILITY: {
      title: "Ny Facilitet",
      description: "Byg helt nye faciliteter til dit stadion",
      benefits: ["Nye indtægtskilder", "Bedre fanoplevelse", "Moderne faciliteter", "Konkurrencefordel"],
      duration: "45 dage"
    },
    RENOVATION: {
      title: "Renovering",
      description: "Renover eksisterende områder for at forbedre kvaliteten",
      benefits: ["Forbedret udseende", "Højere prestige", "Bedre atmosfære", "Moderne design"],
      duration: "40 dage"
    },
    TECHNOLOGY: {
      title: "Teknologi",
      description: "Opgrader teknologiske systemer og infrastruktur",
      benefits: ["Moderne teknologi", "Bedre effektivitet", "Højere prestige", "Fremtidssikret"],
      duration: "35 dage"
    },
    SUSTAINABILITY: {
      title: "Bæredygtighed",
      description: "Implementer miljøvenlige løsninger og grøn teknologi",
      benefits: ["Miljøvenlig", "Lavere omkostninger", "Positivt omdømme", "Fremtidssikret"],
      duration: "50 dage"
    }
  };
  
  return explanations[type] || { title: type, description: "Opgradering", benefits: [], duration: "30 dage" };
};

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

  const upgradeTier = useCallback(async () => {
    if (!teamData) return;
    
    await authApiFetch(`/api/stadium/${teamData.id}/tier`, {
      method: 'PUT'
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
    { name: "LED Skærme", type: "LED_SCREENS", cost: 1500000, level: 1 },
    { name: "VIP Lounge", type: "VIP_LOUNGE", cost: 2500000, level: 1 },
    { name: "Fan Zone", type: "FAN_ZONE", cost: 800000, level: 1 },
    { name: "Parkering", type: "PARKING", cost: 2000000, level: 1 },
    { name: "Mad & Drikke", type: "FOOD_BEVERAGE", cost: 1200000, level: 1 },
    { name: "Siddepladser", type: "SEATING", cost: 1000000, level: 1 },
    { name: "Lydanlæg", type: "SOUND_SYSTEM", cost: 500000, level: 1 },
    { name: "Belysning", type: "LIGHTING", cost: 800000, level: 1 },
    { name: "WiFi", type: "WIFI", cost: 300000, level: 1 },
    { name: "Sikkerhed", type: "SECURITY", cost: 600000, level: 1 },
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

      {/* Budget Warning */}
      {teamData.budget < 1000000 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900 mb-1">Lavt Budget Advarsel</h4>
              <p className="text-sm text-yellow-700">
                Dit hold budget er lavt ({formatCurrency(teamData.budget)}). Du kan kun tilføje billige faciliteter eller vente på flere indtægter.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Budget Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Hold Budget</h3>
                <p className="text-3xl font-bold text-blue-800">{formatCurrency(teamData.budget)}</p>
                <p className="text-sm text-blue-600">Tilgængeligt for stadion investeringer</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-600 mb-1">Månedlig Netto</div>
              <div className="text-xl font-semibold text-blue-800">
                {stats.netProfit >= 0 ? '+' : ''}{formatCurrency(stats.netProfit)}
              </div>
              <div className="text-xs text-blue-500">
                {formatCurrency(stats.totalRevenue)} - {formatCurrency(stats.totalCost)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                        <span>Hold Budget:</span>
                        <span className="font-medium text-blue-600">{formatCurrency(teamData.budget)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Månedlig Indtægt:</span>
                        <span className="font-medium text-green-600">{formatCurrency(stadium.monthlyRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vedligeholdelse:</span>
                        <span className="font-medium text-red-600">{formatCurrency(stadium.maintenanceCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Netto Profit:</span>
                        <span className={`font-medium ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(stats.netProfit)}
                        </span>
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
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-blue-900 mb-1">Hvad gør en kapacitet udvidelse?</h5>
                          <p className="text-sm text-blue-700 mb-2">
                            Du udvider dit stadion til næste tier, hvilket øger kapaciteten betydeligt og giver dig mulighed for at have flere tilskuere til dine kampe.
                          </p>
                          <div className="text-xs text-blue-600">
                            <strong>Fordele:</strong> Øger kapacitet med 10,000+ sæder • Højere indtægter • Bedre prestige • Flere tilskuere
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Nuværende Tier:</span>
                        <span className="font-medium">Tier {stadium.tier}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Næste Tier:</span>
                        <span className="font-medium">Tier {stadium.tier + 1}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Kostnad:</span>
                        <span className={`font-medium ${teamData.budget >= 5000000 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(5000000)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Varighed:</span>
                        <span className="font-medium">60 dage</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAction(
                        () => upgradeTier(),
                        "tier-upgrade"
                      )}
                      disabled={teamData.budget < 5000000 || actionLoading === "tier-upgrade"}
                      className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {actionLoading === "tier-upgrade" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {teamData.budget < 5000000 ? 'Ikke råd til udvidelse' : `Udvid til Tier ${stadium.tier + 1}`}
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
                    <p className="text-sm text-muted-foreground mb-4">
                      Vælg faciliteter at tilføje til dit stadion. Hver facilitet giver forskellige fordele og indtægter.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {facilityTypes.map((facility) => {
                        const explanation = getFacilityExplanation(facility.type as FacilityType);
                        const canAfford = teamData.budget >= facility.cost;
                        return (
                          <div key={facility.type} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium">{explanation.title}</h5>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {explanation.description}
                            </p>
                            <div className="space-y-2 mb-3">
                              <div className="flex justify-between text-sm">
                                <span>Kostnad:</span>
                                <span className={`font-medium ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatCurrency(facility.cost)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Level:</span>
                                <span className="font-medium">{facility.level}</span>
                              </div>
                            </div>
                            <div className="mb-3">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Fordele:</p>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                {explanation.benefits.map((benefit, index) => (
                                  <li key={index} className="flex items-center gap-1">
                                    <Target className="h-3 w-3 text-green-500" />
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <button 
                              onClick={() => handleAction(
                                () => createFacility(facility.name, facility.type as FacilityType, facility.level),
                                `facility-${facility.type}`
                              )}
                              disabled={!canAfford || actionLoading === `facility-${facility.type}`}
                              className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {actionLoading === `facility-${facility.type}` ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Plus className="h-3 w-3" />
                              )}
                              {!canAfford ? 'Ikke råd' : 'Tilføj'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "experience" && (
          <div className="space-y-6">
            {/* Fan Experience Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Fan Oplevelse Oversigt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-blue-900 mb-2">Hvad er Fan Oplevelse?</h5>
                      <p className="text-sm text-blue-700 mb-3">
                        Fan Oplevelse måler hvor godt dine tilskuere har det i dit stadion. Det påvirker både indtægter, 
                        hjemmefordel og dit holds omdømme. Jo bedre oplevelse, jo flere fans kommer tilbage og anbefaler dit stadion.
                      </p>
                      <div className="text-xs text-blue-600">
                        <strong>Påvirkning:</strong> Højere indtægter • Bedre hjemmefordel • Flere tilskuere • Stærkere fanbase
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Atmosphere */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        Atmosfære
                      </h4>
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold text-blue-600">{stadium.atmosphere}%</div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                              style={{ width: `${stadium.atmosphere}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h5 className="font-medium text-sm mb-2">Hvad påvirker atmosfære?</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• <strong>Lydanlæg:</strong> Bedre lyd = bedre atmosfære</li>
                        <li>• <strong>Belysning:</strong> Professionel belysning skaber stemning</li>
                        <li>• <strong>Fan Zone:</strong> Aktiviteter og underholdning</li>
                        <li>• <strong>WiFi:</strong> Fans kan dele oplevelsen på sociale medier</li>
                        <li>• <strong>Mad & Drikke:</strong> Gode faciliteter holder fans glade</li>
                      </ul>
                    </div>
                  </div>

                  {/* Prestige */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        Prestige
                      </h4>
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold text-purple-600">{stadium.prestige}</div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-purple-600 h-3 rounded-full transition-all duration-300" 
                              style={{ width: `${stadium.prestige}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h5 className="font-medium text-sm mb-2">Hvad påvirker prestige?</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• <strong>VIP Lounge:</strong> Eksklusive faciliteter</li>
                        <li>• <strong>LED Skærme:</strong> Moderne teknologi</li>
                        <li>• <strong>Medie faciliteter:</strong> Professionel mediedækning</li>
                        <li>• <strong>Stadion tier:</strong> Højere tier = mere prestige</li>
                        <li>• <strong>Sponsor faciliteter:</strong> Professionelle reklamepladser</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Impact on Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Påvirkning på Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      +{(stadium.homeAdvantage * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm font-medium text-green-800">Hjemmefordel</div>
                    <div className="text-xs text-green-600 mt-1">
                      {stadium.atmosphere > 70 ? 'Stærk fanbase!' : 'Kan forbedres'}
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {Math.round((stadium.atmosphere + stadium.prestige) / 2)}%
                    </div>
                    <div className="text-sm font-medium text-blue-800">Samlet Oplevelse</div>
                    <div className="text-xs text-blue-600 mt-1">
                      {Math.round((stadium.atmosphere + stadium.prestige) / 2) > 75 ? 'Fremragende!' : 'God, men kan forbedres'}
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {stadium.capacity.toLocaleString()}
                    </div>
                    <div className="text-sm font-medium text-purple-800">Kapacitet</div>
                    <div className="text-xs text-purple-600 mt-1">
                      {stadium.capacity > 30000 ? 'Stort stadion!' : 'Kompakt stadion'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips for Improvement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Tips til Forbedring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2 text-green-700">For Bedre Atmosfære</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Tilføj lydanlæg for bedre lyd</li>
                      <li>• Opgrader belysning til professionel standard</li>
                      <li>• Byg Fan Zone med aktiviteter</li>
                      <li>• Installer WiFi for social media deling</li>
                      <li>• Forbedre mad & drikke faciliteter</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2 text-purple-700">For Højere Prestige</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Byg VIP Lounge for eksklusive gæster</li>
                      <li>• Installer LED skærme for moderne udseende</li>
                      <li>• Forbedre medie faciliteter</li>
                      <li>• Udvid stadion til højere tier</li>
                      <li>• Tilføj sponsor faciliteter</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "economy" && (
          <div className="space-y-6">
            {/* Budget Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Budget Oversigt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Hold Budget</h4>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {formatCurrency(teamData.budget)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tilgængeligt budget for stadion investeringer
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Månedlig ROI</h4>
                    <div className={`text-3xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'} mb-2`}>
                      {formatCurrency(stats.netProfit)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Netto profit fra stadion operationer
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Budget Status</h4>
                    <div className={`text-2xl font-bold mb-2 ${
                      teamData.budget > 5000000 ? 'text-green-600' : 
                      teamData.budget > 2000000 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {teamData.budget > 5000000 ? 'Høj' : 
                       teamData.budget > 2000000 ? 'Medium' : 'Lav'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {teamData.budget > 5000000 ? 'Kan investere i dyre faciliteter' : 
                       teamData.budget > 2000000 ? 'Kan investere i medium faciliteter' : 'Begrænset investeringsmuligheder'}
                    </div>
                  </div>
                </div>
                
                {/* Budget Breakdown */}
                <div className="mt-6 pt-6 border-t">
                  <h5 className="font-semibold mb-4">Budget Fordeling</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Månedlig Indtægt:</span>
                        <span className="font-medium text-green-600">+{formatCurrency(stats.totalRevenue)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Månedlige Omkostninger:</span>
                        <span className="font-medium text-red-600">-{formatCurrency(stats.totalCost)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                        <span>Netto Månedlig:</span>
                        <span className={stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {stats.netProfit >= 0 ? '+' : ''}{formatCurrency(stats.netProfit)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Budget:</span>
                        <span className="font-medium text-blue-600">{formatCurrency(teamData.budget)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Faciliteter:</span>
                        <span className="font-medium">{stats.activeFacilities} aktive</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Opgraderinger:</span>
                        <span className="font-medium">{stats.activeUpgrades} aktive</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Finansiel Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</div>
                    <div className="text-sm text-muted-foreground">Månedlig Indtægt</div>
                    <div className="text-xs text-green-600 mt-1">+{((stats.totalRevenue / (stats.totalCost || 1)) * 100).toFixed(1)}% af omkostninger</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalCost)}</div>
                    <div className="text-sm text-muted-foreground">Månedlige Omkostninger</div>
                    <div className="text-xs text-red-600 mt-1">Vedligeholdelse og drift</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(stats.netProfit)}
                    </div>
                    <div className="text-sm text-muted-foreground">Netto Profit</div>
                    <div className={`text-xs mt-1 ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.netProfit >= 0 ? 'Profitabel' : 'Underskud'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ROI Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  ROI Beregner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Beregn return on investment (ROI) for forskellige stadion investeringer.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Investering (DKK)</label>
                      <input 
                        type="number" 
                        placeholder="1000000" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        id="investment-amount"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Månedlig Indtægt (DKK)</label>
                      <input 
                        type="number" 
                        placeholder="50000" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        id="monthly-revenue"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const investment = parseInt((document.getElementById('investment-amount') as HTMLInputElement)?.value || '0');
                      const revenue = parseInt((document.getElementById('monthly-revenue') as HTMLInputElement)?.value || '0');
                      if (investment > 0 && revenue > 0) {
                        const months = Math.ceil(investment / revenue);
                        const annualROI = ((revenue * 12) / investment) * 100;
                        alert(`ROI: ${annualROI.toFixed(1)}% årligt\nTilbagebetalingstid: ${months} måneder`);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Beregn ROI
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}