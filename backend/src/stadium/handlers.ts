import { Request, Response } from 'express';
import { PrismaClient, FacilityType as PrismaFacilityType } from '@prisma/client';
import { 
  Stadium, 
  StadiumFacility, 
  StadiumUpgrade, 
  FacilityType, 
  UpgradeType, 
  UpgradeStatus,
  CreateStadiumData,
  CreateFacilityData,
  CreateUpgradeData,
  StadiumStats
} from './types';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

const prisma = new PrismaClient();

// Helper function to verify team ownership
async function verifyTeamOwnership(teamId: string, userId: string) {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      ownerId: userId
    }
  });
  return team;
}

// Helper function to check and deduct budget
async function checkAndDeductBudget(teamId: string, cost: number) {
  const team = await prisma.team.findUnique({
    where: { id: teamId }
  });

  if (!team) {
    throw new Error('Team not found');
  }

  const budget = Number(team.budget);
  const costBigInt = BigInt(cost);

  if (team.budget < costBigInt) {
    throw new Error(`Insufficient budget. Required: ${cost} øre, Available: ${budget} øre`);
  }

  // Deduct the cost
  const newBudget = team.budget - costBigInt;
  await prisma.team.update({
    where: { id: teamId },
    data: { budget: newBudget }
  });

  return Number(newBudget); // Return new budget as number
}

// Helper function to get or create stadium
async function getOrCreateStadium(teamId: string, teamName: string) {
  let stadium = await prisma.stadium.findUnique({
    where: { teamId },
    include: {
      facilities: true,
      upgrades: true
    }
  });

  if (!stadium) {
    stadium = await prisma.stadium.create({
      data: {
        name: `${teamName} Stadium`,
        teamId,
        capacity: 20000,
        tier: 1,
        atmosphere: 50,
        maintenanceCost: 100000,
        monthlyRevenue: 500000,
        homeAdvantage: 0.05,
        prestige: 50
      },
      include: {
        facilities: true,
        upgrades: true
      }
    });
  }

  return stadium;
}

// Get stadium for a team
export const getStadium = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const team = await verifyTeamOwnership(teamId, userId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const stadium = await getOrCreateStadium(teamId, team.name);
    res.json(stadium);
  } catch (error) {
    console.error('Error getting stadium:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get stadium statistics
export const getStadiumStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const team = await verifyTeamOwnership(teamId, userId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const stadium = await prisma.stadium.findUnique({
      where: { teamId },
      include: {
        facilities: true,
        upgrades: true
      }
    });

    if (!stadium) {
      return res.status(404).json({ error: 'Stadium not found' });
    }

    const stats = calculateStadiumStats(stadium);
    res.json(stats);
  } catch (error) {
    console.error('Error getting stadium stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new facility
export const createFacility = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const { name, type, level = 1 } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const team = await verifyTeamOwnership(teamId, userId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const stadium = await prisma.stadium.findUnique({
      where: { teamId }
    });

    if (!stadium) {
      return res.status(404).json({ error: 'Stadium not found' });
    }

    // Check if team has enough budget
    const facilityData = calculateFacilityData(type, level);
    if (team.budget < facilityData.cost) {
      return res.status(400).json({ error: 'Insufficient budget' });
    }

    const facility = await prisma.stadiumFacility.create({
      data: {
        name,
        type,
        level,
        capacity: facilityData.capacity,
        revenue: facilityData.revenue,
        cost: facilityData.cost,
        effect: facilityData.effect,
        stadiumId: stadium.id
      }
    });

    // Deduct cost from team budget
    await prisma.team.update({
      where: { id: teamId },
      data: {
        budget: team.budget - facilityData.cost
      }
    });

    // Update stadium stats
    await updateStadiumStats(stadium.id);

    res.json(facility);
  } catch (error) {
    console.error('Error creating facility:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Upgrade a facility
export const upgradeFacility = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { facilityId } = req.params;
    const { level } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const facility = await prisma.stadiumFacility.findUnique({
      where: { id: facilityId },
      include: {
        stadium: {
          include: {
            team: true
          }
        }
      }
    });

    if (!facility) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    // Verify team ownership
    if (facility.stadium.team.ownerId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Check if team has enough budget for upgrade
    const facilityData = calculateFacilityData(facility.type as FacilityType, level);
    const upgradeCost = facilityData.cost - facility.cost;
    const teamBudget = Number(facility.stadium.team.budget);
    
    if (teamBudget < upgradeCost) {
      return res.status(400).json({ error: 'Insufficient budget for upgrade' });
    }

    const updatedFacility = await prisma.stadiumFacility.update({
      where: { id: facilityId },
      data: {
        level,
        capacity: facilityData.capacity,
        revenue: facilityData.revenue,
        cost: facilityData.cost,
        effect: facilityData.effect
      }
    });

    // Deduct upgrade cost from team budget
    const newBudget = facility.stadium.team.budget - BigInt(upgradeCost);
    await prisma.team.update({
      where: { id: facility.stadium.teamId },
      data: {
        budget: newBudget
      }
    });

    // Update stadium stats
    await updateStadiumStats(facility.stadiumId);

    res.json(updatedFacility);
  } catch (error) {
    console.error('Error upgrading facility:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a stadium upgrade
export const createUpgrade = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const { name, type, cost, duration } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const team = await verifyTeamOwnership(teamId, userId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const stadium = await prisma.stadium.findUnique({
      where: { teamId }
    });

    if (!stadium) {
      return res.status(404).json({ error: 'Stadium not found' });
    }

    // Check if team has enough budget
    const teamBudget = Number(team.budget);
    if (teamBudget < cost) {
      return res.status(400).json({ error: 'Insufficient budget' });
    }

    const upgrade = await prisma.stadiumUpgrade.create({
      data: {
        name,
        type,
        cost,
        duration,
        stadiumId: stadium.id
      }
    });

    // Deduct cost from team budget
    const newBudget = team.budget - BigInt(cost);
    await prisma.team.update({
      where: { id: teamId },
      data: {
        budget: newBudget
      }
    });

    res.json(upgrade);
  } catch (error) {
    console.error('Error creating upgrade:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Start an upgrade
export const startUpgrade = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { upgradeId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const upgrade = await prisma.stadiumUpgrade.findUnique({
      where: { id: upgradeId },
      include: {
        stadium: {
          include: {
            team: true
          }
        }
      }
    });

    if (!upgrade) {
      return res.status(404).json({ error: 'Upgrade not found' });
    }

    // Verify team ownership
    if (upgrade.stadium.team.ownerId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (upgrade.status !== UpgradeStatus.PLANNED) {
      return res.status(400).json({ error: 'Upgrade is not in planned status' });
    }

    const updatedUpgrade = await prisma.stadiumUpgrade.update({
      where: { id: upgradeId },
      data: {
        status: UpgradeStatus.IN_PROGRESS,
        startedAt: new Date()
      }
    });

    res.json(updatedUpgrade);
  } catch (error) {
    console.error('Error starting upgrade:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Upgrade stadium tier directly
export const upgradeTier = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const team = await verifyTeamOwnership(teamId, userId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const stadium = await prisma.stadium.findUnique({
      where: { teamId },
      include: { facilities: true }
    });

    if (!stadium) {
      return res.status(404).json({ error: 'Stadium not found' });
    }

    // Calculate next tier cost and capacity
    const tierData = [
      { tier: 1, capacity: 20000, cost: 0 },
      { tier: 2, capacity: 35000, cost: 5000000 },
      { tier: 3, capacity: 50000, cost: 15000000 },
      { tier: 4, capacity: 75000, cost: 35000000 },
      { tier: 5, capacity: 100000, cost: 75000000 }
    ];

    const currentTier = tierData.find(t => t.tier === stadium.tier);
    const nextTier = tierData.find(t => t.tier === stadium.tier + 1);

    if (!nextTier) {
      return res.status(400).json({ error: 'Stadium is already at maximum tier' });
    }

    const teamBudget = Number(team.budget);
    if (teamBudget < nextTier.cost) {
      return res.status(400).json({ error: 'Insufficient budget for tier upgrade' });
    }

    // Update stadium to next tier
    const newBudget = team.budget - BigInt(nextTier.cost);
    
    await prisma.team.update({
      where: { id: teamId },
      data: { budget: newBudget }
    });

    await prisma.stadium.update({
      where: { id: stadium.id },
      data: {
        tier: nextTier.tier,
        capacity: nextTier.capacity,
        monthlyRevenue: Math.floor(nextTier.capacity * 25) // 25 øre per seat per month
      }
    });

    // Update stadium stats to recalculate everything
    await updateStadiumStats(stadium.id);

    res.json({ 
      message: `Stadium upgraded to Tier ${nextTier.tier}`,
      newTier: nextTier.tier,
      newCapacity: nextTier.capacity,
      remainingBudget: Number(newBudget)
    });
  } catch (error) {
    console.error('Error upgrading tier:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to calculate facility data based on type and level
function calculateFacilityData(type: FacilityType, level: number) {
  const baseMultiplier = Math.pow(1.5, level - 1);
  
  const facilityConfigs = {
    [FacilityType.SEATING]: {
      capacity: Math.floor(5000 * baseMultiplier),
      revenue: Math.floor(100000 * baseMultiplier),
      cost: Math.floor(50000 * baseMultiplier),
      effect: { capacity: Math.floor(5000 * baseMultiplier) }
    },
    [FacilityType.LED_SCREENS]: {
      capacity: null,
      revenue: Math.floor(25000 * baseMultiplier),
      cost: Math.floor(15000 * baseMultiplier),
      effect: { atmosphere: Math.floor(5 * level) }
    },
    [FacilityType.SOUND_SYSTEM]: {
      capacity: null,
      revenue: Math.floor(20000 * baseMultiplier),
      cost: Math.floor(10000 * baseMultiplier),
      effect: { atmosphere: Math.floor(3 * level) }
    },
    [FacilityType.PARKING]: {
      capacity: Math.floor(1000 * baseMultiplier),
      revenue: Math.floor(30000 * baseMultiplier),
      cost: Math.floor(20000 * baseMultiplier),
      effect: { accessibility: Math.floor(2 * level) }
    },
    [FacilityType.VIP_LOUNGE]: {
      capacity: Math.floor(100 * baseMultiplier),
      revenue: Math.floor(50000 * baseMultiplier),
      cost: Math.floor(25000 * baseMultiplier),
      effect: { prestige: Math.floor(3 * level) }
    },
    [FacilityType.FAN_ZONE]: {
      capacity: null,
      revenue: Math.floor(15000 * baseMultiplier),
      cost: Math.floor(8000 * baseMultiplier),
      effect: { atmosphere: Math.floor(2 * level) }
    },
    [FacilityType.FOOD_BEVERAGE]: {
      capacity: null,
      revenue: Math.floor(30000 * baseMultiplier),
      cost: Math.floor(12000 * baseMultiplier),
      effect: { revenue: Math.floor(30000 * baseMultiplier) }
    }
  };

  const config = facilityConfigs[type] || {
    capacity: null,
    revenue: Math.floor(10000 * baseMultiplier),
    cost: Math.floor(5000 * baseMultiplier),
    effect: {}
  };

  return {
    ...config,
    effect: JSON.stringify(config.effect)
  };
}

// Helper function to calculate stadium statistics
function calculateStadiumStats(stadium: any): StadiumStats {
  const totalRevenue = stadium.facilities
    .filter((f: any) => f.isActive)
    .reduce((sum: number, f: any) => sum + f.revenue, 0) + stadium.monthlyRevenue;

  const totalCost = stadium.facilities
    .filter((f: any) => f.isActive)
    .reduce((sum: number, f: any) => sum + f.cost, 0) + stadium.maintenanceCost;

  const netProfit = totalRevenue - totalCost;
  const activeFacilities = stadium.facilities.filter((f: any) => f.isActive).length;
  const activeUpgrades = stadium.upgrades.filter((u: any) => u.status === UpgradeStatus.IN_PROGRESS).length;

  return {
    totalCapacity: stadium.capacity,
    totalRevenue,
    totalCost,
    netProfit,
    atmosphere: stadium.atmosphere,
    prestige: stadium.prestige,
    homeAdvantage: stadium.homeAdvantage,
    activeFacilities,
    activeUpgrades
  };
}

// Helper function to update stadium statistics
async function updateStadiumStats(stadiumId: string) {
  console.log(`=== updateStadiumStats DEBUG START for stadiumId: ${stadiumId} ===`);
  
  const stadium = await prisma.stadium.findUnique({
    where: { id: stadiumId },
    include: { facilities: true }
  });

  if (!stadium) {
    console.log('updateStadiumStats - Stadium not found');
    return;
  }

  console.log(`updateStadiumStats - Current stadium tier: ${stadium.tier}, capacity: ${stadium.capacity}`);
  console.log(`updateStadiumStats - Stadium facilities:`, stadium.facilities.map(f => ({
    type: f.type,
    level: f.level,
    capacity: f.capacity,
    isActive: f.isActive
  })));

  const totalCapacity = stadium.facilities
    .filter(f => f.type === FacilityType.SEATING && f.isActive)
    .reduce((sum, f) => sum + (f.capacity || 0), 20000); // Base capacity

  console.log(`updateStadiumStats - Calculated totalCapacity: ${totalCapacity}`);

  const totalRevenue = stadium.facilities
    .filter(f => f.isActive)
    .reduce((sum, f) => sum + f.revenue, 0) + stadium.monthlyRevenue;

  const totalCost = stadium.facilities
    .filter(f => f.isActive)
    .reduce((sum, f) => sum + f.cost, 0) + stadium.maintenanceCost;

  const atmosphereBonus = stadium.facilities
    .filter(f => f.isActive && (f.type === FacilityType.LED_SCREENS || f.type === FacilityType.SOUND_SYSTEM || f.type === FacilityType.FAN_ZONE))
    .reduce((sum, f) => {
      const effect = f.effect ? JSON.parse(f.effect) : {};
      return sum + (effect.atmosphere || 0);
    }, 50); // Base atmosphere

  const prestigeBonus = stadium.facilities
    .filter(f => f.isActive && f.type === FacilityType.VIP_LOUNGE)
    .reduce((sum, f) => {
      const effect = f.effect ? JSON.parse(f.effect) : {};
      return sum + (effect.prestige || 0);
    }, 50); // Base prestige

  // Calculate tier based on capacity
  let newTier = 1;
  if (totalCapacity >= 100000) newTier = 5;
  else if (totalCapacity >= 75000) newTier = 4;
  else if (totalCapacity >= 50000) newTier = 3;
  else if (totalCapacity >= 35000) newTier = 2;
  else newTier = 1;

  console.log(`updateStadiumStats - New tier calculation: ${newTier} (capacity: ${totalCapacity})`);
  console.log(`updateStadiumStats - Tier thresholds: 35k(T2), 50k(T3), 75k(T4), 100k(T5)`);

  const updateData = {
    capacity: totalCapacity,
    tier: newTier,
    monthlyRevenue: totalRevenue,
    maintenanceCost: totalCost,
    atmosphere: Math.min(100, atmosphereBonus),
    prestige: Math.min(100, prestigeBonus),
    homeAdvantage: Math.min(0.2, 0.05 + (atmosphereBonus - 50) * 0.001)
  };

  console.log(`updateStadiumStats - Update data:`, updateData);

  await prisma.stadium.update({
    where: { id: stadiumId },
    data: updateData
  });

  console.log(`updateStadiumStats - Stadium updated successfully`);
  console.log(`=== updateStadiumStats DEBUG END ===`);
}