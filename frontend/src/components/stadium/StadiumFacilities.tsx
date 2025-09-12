"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Stadium, 
  StadiumFacility, 
  FacilityType, 
  formatCurrency, 
  formatNumber,
  getFacilityTypeLabel 
} from "@/lib/stadium";
import { useTranslation } from 'react-i18next';
import { Plus, Settings, Trash2 } from "lucide-react";

interface StadiumFacilitiesProps {
  stadium: Stadium;
  onAddFacility: (name: string, type: FacilityType, level: number) => void;
  onUpgradeFacility: (facilityId: string, level: number) => void;
}

export function StadiumFacilities({ stadium, onAddFacility, onUpgradeFacility }: StadiumFacilitiesProps) {
  const { t } = useTranslation('stadium');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newFacility, setNewFacility] = useState({
    name: '',
    type: FacilityType.SEATING,
    level: 1
  });

  const facilityTypes = Object.values(FacilityType);

  const handleAddFacility = () => {
    if (newFacility.name.trim()) {
      onAddFacility(newFacility.name, newFacility.type, newFacility.level);
      setNewFacility({ name: '', type: FacilityType.SEATING, level: 1 });
      setIsAddDialogOpen(false);
    }
  };

  const getFacilityIcon = (type: FacilityType) => {
    const iconMap: Record<FacilityType, string> = {
      [FacilityType.SEATING]: "🪑",
      [FacilityType.LED_SCREENS]: "📺",
      [FacilityType.SOUND_SYSTEM]: "🔊",
      [FacilityType.LIGHTING]: "💡",
      [FacilityType.PARKING]: "🅿️",
      [FacilityType.TRANSPORT]: "🚌",
      [FacilityType.FAN_ZONE]: "🎉",
      [FacilityType.MERCHANDISE]: "🛍️",
      [FacilityType.FOOD_BEVERAGE]: "🍔",
      [FacilityType.VIP_LOUNGE]: "👑",
      [FacilityType.WIFI]: "📶",
      [FacilityType.ACCESSIBILITY]: "♿",
      [FacilityType.SECURITY]: "🛡️",
      [FacilityType.MEDIA]: "📹",
      [FacilityType.SPONSOR]: "🏢",
    };
    return iconMap[type] || "🏗️";
  };

  const getLevelColor = (level: number) => {
    if (level >= 5) return "bg-purple-100 text-purple-800";
    if (level >= 4) return "bg-blue-100 text-blue-800";
    if (level >= 3) return "bg-green-100 text-green-800";
    if (level >= 2) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('facilities.title')}</h2>
          <p className="text-muted-foreground">{t('facilities.currentFacilities')}</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              {t('facilities.addFacility')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('facilities.addFacility')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="facility-name">Navn</Label>
                <Input
                  id="facility-name"
                  value={newFacility.name}
                  onChange={(e) => setNewFacility(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="F.eks. Hovedtribune"
                />
              </div>
              <div>
                <Label htmlFor="facility-type">Type</Label>
                <Select
                  value={newFacility.type}
                  onValueChange={(value) => setNewFacility(prev => ({ ...prev, type: value as FacilityType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {facilityTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {getFacilityIcon(type)} {getFacilityTypeLabel(type, t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="facility-level">Niveau</Label>
                <Select
                  value={newFacility.level.toString()}
                  onValueChange={(value) => setNewFacility(prev => ({ ...prev, level: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <SelectItem key={level} value={level.toString()}>
                        Niveau {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddFacility} className="w-full">
                {t('actions.build')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stadium.facilities.map((facility) => (
          <Card key={facility.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getFacilityIcon(facility.type)}</span>
                  <div>
                    <CardTitle className="text-lg">{facility.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {getFacilityTypeLabel(facility.type, t)}
                    </p>
                  </div>
                </div>
                <Badge className={getLevelColor(facility.level)}>
                  Niveau {facility.level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Indtægt</div>
                  <div className="font-semibold text-green-600">
                    {formatCurrency(facility.revenue)}/måned
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Omkostning</div>
                  <div className="font-semibold text-red-600">
                    {formatCurrency(facility.cost)}/måned
                  </div>
                </div>
              </div>

              {facility.capacity && (
                <div>
                  <div className="text-sm text-muted-foreground">Kapacitet</div>
                  <div className="font-semibold">{formatNumber(facility.capacity)}</div>
                </div>
              )}

              <Separator />

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpgradeFacility(facility.id, facility.level + 1)}
                  disabled={facility.level >= 5}
                  className="flex-1"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  {t('facilities.upgrade')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {stadium.facilities.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">🏟️</div>
            <h3 className="text-lg font-semibold mb-2">Ingen faciliteter endnu</h3>
            <p className="text-muted-foreground mb-4">
              Tilføj din første facilitet for at forbedre dit stadion
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('facilities.addFacility')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
