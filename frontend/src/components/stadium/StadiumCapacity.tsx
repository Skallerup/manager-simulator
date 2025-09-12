"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Stadium, formatCurrency, formatNumber } from "@/lib/stadium";
import { useTranslation } from 'react-i18next';

interface StadiumCapacityProps {
  stadium: Stadium;
  onUpgrade: (type: string, cost: number) => void;
}

export function StadiumCapacity({ stadium, onUpgrade }: StadiumCapacityProps) {
  const { t } = useTranslation('stadium');
  const [selectedTier, setSelectedTier] = useState(stadium.tier);

  const tierData = [
    {
      tier: 1,
      name: t('capacity.tier1'),
      capacity: 20000,
      cost: 0,
      revenue: 500000,
      description: "Basic stadium with essential facilities"
    },
    {
      tier: 2,
      name: t('capacity.tier2'),
      capacity: 35000,
      cost: 5000000,
      revenue: 875000,
      description: "Improved seating and basic amenities"
    },
    {
      tier: 3,
      name: t('capacity.tier3'),
      capacity: 50000,
      cost: 15000000,
      revenue: 1250000,
      description: "Professional facilities and better atmosphere"
    },
    {
      tier: 4,
      name: t('capacity.tier4'),
      capacity: 75000,
      cost: 35000000,
      revenue: 1875000,
      description: "Elite stadium with premium facilities"
    },
    {
      tier: 5,
      name: t('capacity.tier5'),
      capacity: 100000,
      cost: 75000000,
      revenue: 2500000,
      description: "Legendary stadium with world-class facilities"
    }
  ];

  const currentTier = tierData.find(t => t.tier === stadium.tier) || tierData[0];
  const nextTier = tierData.find(t => t.tier === stadium.tier + 1);

  const getTierColor = (tier: number) => {
    if (tier <= stadium.tier) return "bg-green-100 text-green-800";
    if (tier === stadium.tier + 1) return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>{t('capacity.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold">{formatNumber(stadium.capacity)}</div>
              <p className="text-sm text-muted-foreground">{t('capacity.currentCapacity')}</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{formatNumber(currentTier.capacity)}</div>
              <p className="text-sm text-muted-foreground">{t('capacity.maxCapacity')}</p>
            </div>
            <div>
              <Badge className={getTierColor(stadium.tier)}>
                {currentTier.name}
              </Badge>
            </div>
          </div>
          
          <Progress 
            value={(stadium.capacity / currentTier.capacity) * 100} 
            className="h-2"
          />
        </CardContent>
      </Card>

      {/* Tier Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Tier Oversigt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tierData.map((tier) => (
              <div
                key={tier.tier}
                className={`p-4 rounded-lg border-2 transition-all ${
                  tier.tier === stadium.tier
                    ? 'border-green-500 bg-green-50'
                    : tier.tier === stadium.tier + 1
                    ? 'border-blue-500 bg-blue-50 cursor-pointer hover:bg-blue-100'
                    : 'border-gray-200 bg-gray-50'
                }`}
                onClick={() => tier.tier === stadium.tier + 1 && setSelectedTier(tier.tier)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge className={getTierColor(tier.tier)}>
                      Tier {tier.tier}
                    </Badge>
                    <div>
                      <h3 className="font-semibold">{tier.name}</h3>
                      <p className="text-sm text-muted-foreground">{tier.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatNumber(tier.capacity)}</div>
                    <div className="text-sm text-muted-foreground">Kapacitet</div>
                  </div>
                </div>
                
                {tier.tier === stadium.tier && (
                  <div className="mt-3 p-3 bg-green-100 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Månedlig Indtægt:</span>
                      <span className="font-semibold text-green-700">
                        {formatCurrency(tier.revenue)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Section */}
      {nextTier && (
        <Card>
          <CardHeader>
            <CardTitle>{t('capacity.expandCapacity')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Nuværende</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Kapacitet:</span>
                    <span>{formatNumber(currentTier.capacity)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Månedlig Indtægt:</span>
                    <span>{formatCurrency(currentTier.revenue)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Efter Opgradering</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Kapacitet:</span>
                    <span className="text-green-600 font-semibold">
                      {formatNumber(nextTier.capacity)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Månedlig Indtægt:</span>
                    <span className="text-green-600 font-semibold">
                      {formatCurrency(nextTier.revenue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">
                  {t('capacity.upgradeCost')}: {formatCurrency(nextTier.cost)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('capacity.revenueIncrease')}: {formatCurrency(nextTier.revenue - currentTier.revenue)}/måned
                </div>
              </div>
              <Button 
                onClick={() => onUpgrade('capacity', nextTier.cost)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {t('capacity.expandCapacity')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
