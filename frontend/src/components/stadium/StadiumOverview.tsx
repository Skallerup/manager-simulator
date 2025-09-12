"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Stadium, StadiumStats, formatCurrency, formatNumber } from "@/lib/stadium";
import { useTranslation } from 'react-i18next';

interface StadiumOverviewProps {
  stadium: Stadium;
  stats: StadiumStats;
}

export function StadiumOverview({ stadium, stats }: StadiumOverviewProps) {
  const { t } = useTranslation('stadium');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Capacity Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('overview.capacity')}
          </CardTitle>
          <Badge variant="secondary">Tier {stadium.tier}</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(stats.totalCapacity)}
          </div>
          <p className="text-xs text-muted-foreground">
            {t('capacity.currentCapacity')}
          </p>
        </CardContent>
      </Card>

      {/* Atmosphere Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('overview.atmosphere')}
          </CardTitle>
          <Badge variant="outline">{stats.atmosphere}/100</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.atmosphere}
          </div>
          <Progress value={stats.atmosphere} className="mt-2" />
        </CardContent>
      </Card>

      {/* Prestige Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('overview.prestige')}
          </CardTitle>
          <Badge variant="outline">{stats.prestige}/100</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.prestige}
          </div>
          <Progress value={stats.prestige} className="mt-2" />
        </CardContent>
      </Card>

      {/* Home Advantage Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('overview.homeAdvantage')}
          </CardTitle>
          <Badge variant="outline">+{(stats.homeAdvantage * 100).toFixed(1)}%</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            +{(stats.homeAdvantage * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {t('overview.homeAdvantage')}
          </p>
        </CardContent>
      </Card>

      {/* Revenue Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('overview.monthlyRevenue')}
          </CardTitle>
          <Badge variant="default">+</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground">
            {t('overview.monthlyRevenue')}
          </p>
        </CardContent>
      </Card>

      {/* Cost Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('overview.monthlyCost')}
          </CardTitle>
          <Badge variant="destructive">-</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(stats.totalCost)}
          </div>
          <p className="text-xs text-muted-foreground">
            {t('overview.monthlyCost')}
          </p>
        </CardContent>
      </Card>

      {/* Net Profit Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('overview.netProfit')}
          </CardTitle>
          <Badge variant={stats.netProfit >= 0 ? "default" : "destructive"}>
            {stats.netProfit >= 0 ? "+" : ""}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(stats.netProfit)}
          </div>
          <p className="text-xs text-muted-foreground">
            {t('overview.netProfit')}
          </p>
        </CardContent>
      </Card>

      {/* Active Facilities Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('facilities.title')}
          </CardTitle>
          <Badge variant="outline">{stats.activeFacilities}</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.activeFacilities}
          </div>
          <p className="text-xs text-muted-foreground">
            {t('facilities.currentFacilities')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
