export interface Stadium {
  id: string;
  name: string;
  capacity: number;
  tier: number;
  atmosphere: number;
  maintenanceCost: number;
  monthlyRevenue: number;
  homeAdvantage: number;
  prestige: number;
  createdAt: Date;
  updatedAt: Date;
  teamId: string;
  facilities: StadiumFacility[];
  upgrades: StadiumUpgrade[];
}

export interface StadiumFacility {
  id: string;
  name: string;
  type: FacilityType;
  level: number;
  capacity?: number;
  revenue: number;
  cost: number;
  effect?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  stadiumId: string;
}

export interface StadiumUpgrade {
  id: string;
  name: string;
  type: UpgradeType;
  cost: number;
  duration: number;
  status: UpgradeStatus;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  stadiumId: string;
}

export enum FacilityType {
  SEATING = 'SEATING',
  LED_SCREENS = 'LED_SCREENS',
  SOUND_SYSTEM = 'SOUND_SYSTEM',
  LIGHTING = 'LIGHTING',
  PARKING = 'PARKING',
  TRANSPORT = 'TRANSPORT',
  FAN_ZONE = 'FAN_ZONE',
  MERCHANDISE = 'MERCHANDISE',
  FOOD_BEVERAGE = 'FOOD_BEVERAGE',
  VIP_LOUNGE = 'VIP_LOUNGE',
  WIFI = 'WIFI',
  ACCESSIBILITY = 'ACCESSIBILITY',
  SECURITY = 'SECURITY',
  MEDIA = 'MEDIA',
  SPONSOR = 'SPONSOR'
}

export enum UpgradeType {
  CAPACITY_EXPANSION = 'CAPACITY_EXPANSION',
  FACILITY_UPGRADE = 'FACILITY_UPGRADE',
  NEW_FACILITY = 'NEW_FACILITY',
  RENOVATION = 'RENOVATION',
  TECHNOLOGY = 'TECHNOLOGY',
  SUSTAINABILITY = 'SUSTAINABILITY'
}

export enum UpgradeStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface CreateStadiumData {
  name: string;
  teamId: string;
}

export interface CreateFacilityData {
  name: string;
  type: FacilityType;
  stadiumId: string;
}

export interface CreateUpgradeData {
  name: string;
  type: UpgradeType;
  cost: number;
  duration: number;
  stadiumId: string;
}

export interface StadiumStats {
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
