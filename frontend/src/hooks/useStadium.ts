import { useState, useEffect } from 'react';
import { Stadium, StadiumStats, StadiumFacility, StadiumUpgrade, CreateFacilityData, CreateUpgradeData, stadiumApi } from '@/lib/stadium';

export const useStadium = (teamId: string) => {
  const [stadium, setStadium] = useState<Stadium | null>(null);
  const [stats, setStats] = useState<StadiumStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStadium = async () => {
    try {
      setLoading(true);
      setError(null);
      const [stadiumData, statsData] = await Promise.all([
        stadiumApi.getStadium(teamId),
        stadiumApi.getStadiumStats(teamId)
      ]);
      setStadium(stadiumData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stadium data');
    } finally {
      setLoading(false);
    }
  };

  const createFacility = async (data: CreateFacilityData) => {
    try {
      const newFacility = await stadiumApi.createFacility(teamId, data);
      await fetchStadium(); // Refresh data
      return newFacility;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create facility');
      throw err;
    }
  };

  const upgradeFacility = async (facilityId: string, level: number) => {
    try {
      const updatedFacility = await stadiumApi.upgradeFacility(facilityId, level);
      await fetchStadium(); // Refresh data
      return updatedFacility;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upgrade facility');
      throw err;
    }
  };

  const createUpgrade = async (data: CreateUpgradeData) => {
    try {
      const newUpgrade = await stadiumApi.createUpgrade(teamId, data);
      await fetchStadium(); // Refresh data
      return newUpgrade;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create upgrade');
      throw err;
    }
  };

  const startUpgrade = async (upgradeId: string) => {
    try {
      const updatedUpgrade = await stadiumApi.startUpgrade(upgradeId);
      await fetchStadium(); // Refresh data
      return updatedUpgrade;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start upgrade');
      throw err;
    }
  };

  useEffect(() => {
    if (teamId) {
      fetchStadium();
    }
  }, [teamId]);

  return {
    stadium,
    stats,
    loading,
    error,
    refetch: fetchStadium,
    createFacility,
    upgradeFacility,
    createUpgrade,
    startUpgrade,
  };
};
