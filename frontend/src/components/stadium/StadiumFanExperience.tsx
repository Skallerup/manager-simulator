"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Stadium, StadiumStats, formatCurrency, formatNumber } from "@/lib/stadium";
import { useTranslation } from 'react-i18next';
import { Users, Heart, Wifi, ShoppingBag, Utensils, Crown } from "lucide-react";

interface StadiumFanExperienceProps {
  stadium: Stadium;
  stats: StadiumStats;
}

export function StadiumFanExperience({ stadium, stats }: StadiumFanExperienceProps) {
  const { t } = useTranslation('stadium');

  // Calculate fan experience metrics based on facilities
  const fanExperience = {
    atmosphere: stats.atmosphere,
    fanSatisfaction: Math.min(100, stats.atmosphere + (stats.prestige * 0.3)),
    averageAttendance: Math.floor(stadium.capacity * (stats.atmosphere / 100) * 0.8),
    fanZone: stadium.facilities.some(f => f.type === 'FAN_ZONE' && f.isActive),
    merchandiseShop: stadium.facilities.some(f => f.type === 'MERCHANDISE' && f.isActive),
    foodBeverage: stadium.facilities.some(f => f.type === 'FOOD_BEVERAGE' && f.isActive),
    vipLounge: stadium.facilities.some(f => f.type === 'VIP_LOUNGE' && f.isActive),
    wifiCoverage: stadium.facilities.some(f => f.type === 'WIFI' && f.isActive),
    accessibility: stadium.facilities.some(f => f.type === 'ACCESSIBILITY' && f.isActive),
  };

  const getSatisfactionColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getSatisfactionLabel = (score: number) => {
    if (score >= 80) return "Fremragende";
    if (score >= 60) return "God";
    if (score >= 40) return "Acceptabel";
    return "Dårlig";
  };

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('fanExperience.atmosphere')}
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fanExperience.atmosphere}/100</div>
            <Progress value={fanExperience.atmosphere} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {getSatisfactionLabel(fanExperience.atmosphere)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('fanExperience.fanSatisfaction')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSatisfactionColor(fanExperience.fanSatisfaction)}`}>
              {fanExperience.fanSatisfaction}/100
            </div>
            <Progress value={fanExperience.fanSatisfaction} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {getSatisfactionLabel(fanExperience.fanSatisfaction)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('fanExperience.averageAttendance')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(fanExperience.averageAttendance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('fanExperience.attendance')}
            </p>
            <Progress 
              value={(fanExperience.averageAttendance / stadium.capacity) * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Facility Status */}
      <Card>
        <CardHeader>
          <CardTitle>{t('fanExperience.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg border">
              <div className={`p-2 rounded-full ${fanExperience.fanZone ? 'bg-green-100' : 'bg-gray-100'}`}>
                <span className="text-xl">🎉</span>
              </div>
              <div>
                <div className="font-medium">{t('fanExperience.fanZone')}</div>
                <Badge variant={fanExperience.fanZone ? "default" : "secondary"}>
                  {fanExperience.fanZone ? "Aktiv" : "Inaktiv"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border">
              <div className={`p-2 rounded-full ${fanExperience.merchandiseShop ? 'bg-green-100' : 'bg-gray-100'}`}>
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">{t('fanExperience.merchandiseShop')}</div>
                <Badge variant={fanExperience.merchandiseShop ? "default" : "secondary"}>
                  {fanExperience.merchandiseShop ? "Aktiv" : "Inaktiv"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border">
              <div className={`p-2 rounded-full ${fanExperience.foodBeverage ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Utensils className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">{t('fanExperience.foodBeverage')}</div>
                <Badge variant={fanExperience.foodBeverage ? "default" : "secondary"}>
                  {fanExperience.foodBeverage ? "Aktiv" : "Inaktiv"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border">
              <div className={`p-2 rounded-full ${fanExperience.vipLounge ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">{t('fanExperience.vipLounge')}</div>
                <Badge variant={fanExperience.vipLounge ? "default" : "secondary"}>
                  {fanExperience.vipLounge ? "Aktiv" : "Inaktiv"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border">
              <div className={`p-2 rounded-full ${fanExperience.wifiCoverage ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Wifi className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">{t('fanExperience.wifiCoverage')}</div>
                <Badge variant={fanExperience.wifiCoverage ? "default" : "secondary"}>
                  {fanExperience.wifiCoverage ? "Aktiv" : "Inaktiv"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border">
              <div className={`p-2 rounded-full ${fanExperience.accessibility ? 'bg-green-100' : 'bg-gray-100'}`}>
                <span className="text-xl">♿</span>
              </div>
              <div>
                <div className="font-medium">{t('fanExperience.accessibility')}</div>
                <Badge variant={fanExperience.accessibility ? "default" : "secondary"}>
                  {fanExperience.accessibility ? "Aktiv" : "Inaktiv"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Fan Oplevelse Indvirkning</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Positiv Indvirkning</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Højere tilskuertal = mere indtægt</li>
                  <li>• Bedre atmosfære = hjemmefordel</li>
                  <li>• Fan tilfredshed = loyalitet</li>
                  <li>• Premium faciliteter = højere billetpriser</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Anbefalinger</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {!fanExperience.fanZone && <li>• Tilføj Fan Zone for bedre atmosfære</li>}
                  {!fanExperience.wifiCoverage && <li>• Installer WiFi for moderne fans</li>}
                  {!fanExperience.foodBeverage && <li>• Udvid mad & drikke faciliteter</li>}
                  {!fanExperience.vipLounge && <li>• Opret VIP område for premium indtægter</li>}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
