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
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
  stadiumId: string;
}

export interface StadiumUpgrade {
  id: string;
  name: string;
  type: UpgradeType;
  cost: number;
  duration: number;
  status: UpgradeStatus;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
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

export interface CreateFacilityData {
  name: string;
  type: FacilityType;
  level?: number;
}

export interface CreateUpgradeData {
  name: string;
  type: UpgradeType;
  cost: number;
  duration: number;
}

// API functions
export const stadiumApi = {
  async getStadium(teamId: string): Promise<Stadium> {
    const response = await fetch(`/api/stadium/${teamId}`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch stadium');
    }
    return response.json();
  },

  async getStadiumStats(teamId: string): Promise<StadiumStats> {
    const response = await fetch(`/api/stadium/${teamId}/stats`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch stadium stats');
    }
    return response.json();
  },

  async createFacility(teamId: string, data: CreateFacilityData): Promise<StadiumFacility> {
    const response = await fetch(`/api/stadium/${teamId}/facilities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create facility');
    }
    return response.json();
  },

  async upgradeFacility(facilityId: string, level: number): Promise<StadiumFacility> {
    const response = await fetch(`/api/stadium/facilities/${facilityId}/upgrade`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ level }),
    });
    if (!response.ok) {
      throw new Error('Failed to upgrade facility');
    }
    return response.json();
  },

  async createUpgrade(teamId: string, data: CreateUpgradeData): Promise<StadiumUpgrade> {
    const response = await fetch(`/api/stadium/${teamId}/upgrades`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create upgrade');
    }
    return response.json();
  },

  async startUpgrade(upgradeId: string): Promise<StadiumUpgrade> {
    const response = await fetch(`/api/stadium/upgrades/${upgradeId}/start`, {
      method: 'PUT',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to start upgrade');
    }
    return response.json();
  },
};

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('da-DK').format(num);
};

export const getFacilityTypeLabel = (type: FacilityType, t: any): string => {
  const typeMap: Record<FacilityType, string> = {
    [FacilityType.SEATING]: t('facilities.facilityTypes.seating'),
    [FacilityType.LED_SCREENS]: t('facilities.facilityTypes.ledScreens'),
    [FacilityType.SOUND_SYSTEM]: t('facilities.facilityTypes.soundSystem'),
    [FacilityType.LIGHTING]: t('facilities.facilityTypes.lighting'),
    [FacilityType.PARKING]: t('facilities.facilityTypes.parking'),
    [FacilityType.TRANSPORT]: t('facilities.facilityTypes.transport'),
    [FacilityType.FAN_ZONE]: t('facilities.facilityTypes.fanZone'),
    [FacilityType.MERCHANDISE]: t('facilities.facilityTypes.merchandise'),
    [FacilityType.FOOD_BEVERAGE]: t('facilities.facilityTypes.foodBeverage'),
    [FacilityType.VIP_LOUNGE]: t('facilities.facilityTypes.vipLounge'),
    [FacilityType.WIFI]: t('facilities.facilityTypes.wifi'),
    [FacilityType.ACCESSIBILITY]: t('facilities.facilityTypes.accessibility'),
    [FacilityType.SECURITY]: t('facilities.facilityTypes.security'),
    [FacilityType.MEDIA]: t('facilities.facilityTypes.media'),
    [FacilityType.SPONSOR]: t('facilities.facilityTypes.sponsor'),
  };
  return typeMap[type] || type;
};

export const getUpgradeTypeLabel = (type: UpgradeType, t: any): string => {
  const typeMap: Record<UpgradeType, string> = {
    [UpgradeType.CAPACITY_EXPANSION]: t('upgrades.upgradeTypes.capacityExpansion'),
    [UpgradeType.FACILITY_UPGRADE]: t('upgrades.upgradeTypes.facilityUpgrade'),
    [UpgradeType.NEW_FACILITY]: t('upgrades.upgradeTypes.newFacility'),
    [UpgradeType.RENOVATION]: t('upgrades.upgradeTypes.renovation'),
    [UpgradeType.TECHNOLOGY]: t('upgrades.upgradeTypes.technology'),
    [UpgradeType.SUSTAINABILITY]: t('upgrades.upgradeTypes.sustainability'),
  };
  return typeMap[type] || type;
};

export const getUpgradeStatusLabel = (status: UpgradeStatus, t: any): string => {
  const statusMap: Record<UpgradeStatus, string> = {
    [UpgradeStatus.PLANNED]: t('upgrades.plannedUpgrades'),
    [UpgradeStatus.IN_PROGRESS]: t('upgrades.inProgress'),
    [UpgradeStatus.COMPLETED]: t('upgrades.completed'),
    [UpgradeStatus.CANCELLED]: t('actions.cancel'),
  };
  return statusMap[status] || status;
};
