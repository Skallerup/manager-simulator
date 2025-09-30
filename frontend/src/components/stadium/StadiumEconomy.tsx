"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Stadium, StadiumStats, formatCurrency, formatNumber } from "@/lib/stadium";
import { useTranslation } from 'react-i18next';
import { DollarSign, TrendingUp, TrendingDown, Cog } from "lucide-react";

interface StadiumEconomyProps {
  stadium: Stadium;
  stats: StadiumStats;
  teamBudget: number;
  onUpdatePrices: (prices: { basic: number; premium: number; vip: number }) => void;
}

export function StadiumEconomy({ stadium, stats, teamBudget, onUpdatePrices }: StadiumEconomyProps) {
  const { t } = useTranslation('stadium');
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [ticketPrices, setTicketPrices] = useState({
    basic: 200, // Basic ticket price in DKK
    premium: 500, // Premium ticket price in DKK
    vip: 1500, // VIP ticket price in DKK
  });

  const calculateRevenue = () => {
    const basicSeats = Math.floor(stadium.capacity * 0.7); // 70% basic seats
    const premiumSeats = Math.floor(stadium.capacity * 0.25); // 25% premium seats
    const vipSeats = Math.floor(stadium.capacity * 0.05); // 5% VIP seats
    
    const basicRevenue = basicSeats * ticketPrices.basic * 20; // 20 home games per season
    const premiumRevenue = premiumSeats * ticketPrices.premium * 20;
    const vipRevenue = vipSeats * ticketPrices.vip * 20;
    
    return {
      basic: basicRevenue,
      premium: premiumRevenue,
      vip: vipRevenue,
      total: basicRevenue + premiumRevenue + vipRevenue,
      basicSeats,
      premiumSeats,
      vipSeats,
    };
  };

  const revenue = calculateRevenue();
  const roi = stats.netProfit > 0 ? ((stats.netProfit * 12) / (stadium.capacity * 1000)) * 100 : 0;

  const handleUpdatePrices = () => {
    onUpdatePrices(ticketPrices);
    setIsPriceDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('economy.revenue')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('economy.monthlyRevenue')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('economy.costs')}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalCost)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('economy.monthlyCost')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('economy.profit')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('economy.monthlyCost')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('economy.roi')}
            </CardTitle>
            <Badge variant="outline">{roi.toFixed(1)}%</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roi.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Årlig ROI
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ticket Pricing */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('economy.ticketPrices')}</CardTitle>
            <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Cog className="w-4 h-4 mr-2" />
                  {t('economy.setPrices')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('economy.setPrices')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="basic-price">Basic Billet (DKK)</Label>
                    <Input
                      id="basic-price"
                      type="number"
                      value={ticketPrices.basic}
                      onChange={(e) => setTicketPrices(prev => ({ ...prev, basic: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="premium-price">Premium Billet (DKK)</Label>
                    <Input
                      id="premium-price"
                      type="number"
                      value={ticketPrices.premium}
                      onChange={(e) => setTicketPrices(prev => ({ ...prev, premium: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vip-price">VIP Billet (DKK)</Label>
                    <Input
                      id="vip-price"
                      type="number"
                      value={ticketPrices.vip}
                      onChange={(e) => setTicketPrices(prev => ({ ...prev, vip: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <Button onClick={handleUpdatePrices} className="w-full">
                    {t('actions.save')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Basic</h4>
                <Badge variant="secondary">{formatNumber(revenue.basicSeats)} sæder</Badge>
              </div>
              <div className="text-2xl font-bold">{ticketPrices.basic} DKK</div>
              <div className="text-sm text-muted-foreground">
                {formatCurrency(revenue.basic)}/sæson
              </div>
            </div>

            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Premium</h4>
                <Badge variant="default">{formatNumber(revenue.premiumSeats)} sæder</Badge>
              </div>
              <div className="text-2xl font-bold">{ticketPrices.premium} DKK</div>
              <div className="text-sm text-muted-foreground">
                {formatCurrency(revenue.premium)}/sæson
              </div>
            </div>

            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">VIP</h4>
                <Badge variant="outline">{formatNumber(revenue.vipSeats)} sæder</Badge>
              </div>
              <div className="text-2xl font-bold">{ticketPrices.vip} DKK</div>
              <div className="text-sm text-muted-foreground">
                {formatCurrency(revenue.vip)}/sæson
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(revenue.total)}
            </div>
            <p className="text-muted-foreground">Total sæson indtægt fra billetter</p>
          </div>
        </CardContent>
      </Card>

      {/* Budget & Investment */}
      <Card>
        <CardHeader>
          <CardTitle>Budget & Investering</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-4">Hold Budget</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Nuværende Budget:</span>
                  <span className="font-semibold">{formatCurrency(teamBudget)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Månedlig Stadion Indtægt:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(stats.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Månedlige Stadion Omkostninger:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(stats.totalCost)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Netto Stadion Profit:</span>
                  <span className={stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(stats.netProfit)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Investerings Muligheder</h4>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border">
                  <div className="font-medium">Kapacitets Udvidelse</div>
                  <div className="text-sm text-muted-foreground">
                    Udvid stadion til næste tier
                  </div>
                  <div className="text-sm font-semibold text-blue-600">
                    Fra {formatNumber(stadium.capacity)} til {formatNumber(stadium.capacity * 1.5)}
                  </div>
                </div>
                <div className="p-3 rounded-lg border">
                  <div className="font-medium">Nye Faciliteter</div>
                  <div className="text-sm text-muted-foreground">
                    Tilføj VIP lounge, fan zone, etc.
                  </div>
                  <div className="text-sm font-semibold text-blue-600">
                    Øg atmosfære og indtægter
                  </div>
                </div>
                <div className="p-3 rounded-lg border">
                  <div className="font-medium">Teknologi Opgradering</div>
                  <div className="text-sm text-muted-foreground">
                    LED skærme, lydsystem, WiFi
                  </div>
                  <div className="text-sm font-semibold text-blue-600">
                    Forbedre fan oplevelse
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
