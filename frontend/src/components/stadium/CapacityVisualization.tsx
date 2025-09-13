"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Building2, Target } from 'lucide-react';

interface CapacityVisualizationProps {
  currentCapacity: number;
  maxCapacity: number;
  tier: number;
  nextTierCapacity?: number;
}

const CapacityVisualization: React.FC<CapacityVisualizationProps> = ({
  currentCapacity,
  maxCapacity,
  tier,
  nextTierCapacity
}) => {
  const capacityPercentage = (currentCapacity / maxCapacity) * 100;
  
  // Calculate progress to next tier
  const nextTierProgress = nextTierCapacity 
    ? Math.min(100, ((currentCapacity - maxCapacity * 0.8) / (nextTierCapacity - maxCapacity * 0.8)) * 100)
    : 0;

  // Get tier colors
  const getTierColor = (tier: number) => {
    const colors = ['#6B7280', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];
    return colors[Math.min(tier - 1, 4)];
  };

  const tierColor = getTierColor(tier);
  const nextTierColor = getTierColor(tier + 1);

  return (
    <div className="w-full space-y-6">
      {/* Current Capacity Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Nuværende Kapacitet</h3>
                <p className="text-sm text-gray-600">Tier {tier} Stadion</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-800">
                {currentCapacity.toLocaleString('da-DK')}
              </div>
              <div className="text-sm text-blue-600">pladser</div>
            </div>
          </div>

          {/* Capacity Bar */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${capacityPercentage}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                style={{ backgroundColor: tierColor }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>0</span>
              <span className="font-medium">{capacityPercentage.toFixed(1)}%</span>
              <span>{maxCapacity.toLocaleString('da-DK')}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Next Tier Progress */}
      {nextTierCapacity && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Næste Tier</h3>
                <p className="text-sm text-gray-600">Tier {tier + 1} - {nextTierCapacity.toLocaleString('da-DK')} pladser</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-800">
                {nextTierProgress.toFixed(1)}%
              </div>
              <div className="text-sm text-green-600">til næste tier</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${nextTierProgress}%` }}
                transition={{ duration: 1, delay: 0.7 }}
                className="h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600"
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{Math.floor(maxCapacity * 0.8).toLocaleString('da-DK')}</span>
              <span className="font-medium">Fremgang</span>
              <span>{nextTierCapacity.toLocaleString('da-DK')}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Capacity Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Stadium Size Comparison */}
        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-5 w-5 text-gray-600" />
            <h4 className="font-semibold text-gray-900">Stadion Størrelse</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Lille</span>
              <span className="text-sm text-gray-600">Stor</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                style={{ width: `${Math.min(100, (currentCapacity / 100000) * 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 text-center">
              {currentCapacity < 35000 ? 'Kompakt' : 
               currentCapacity < 50000 ? 'Medium' :
               currentCapacity < 75000 ? 'Stor' : 'Gigantisk'}
            </div>
          </div>
        </div>

        {/* Capacity Utilization */}
        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-5 w-5 text-gray-600" />
            <h4 className="font-semibold text-gray-900">Kapacitets Udnyttelse</h4>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {capacityPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">
              {capacityPercentage > 80 ? 'Optimal' :
               capacityPercentage > 60 ? 'God' :
               capacityPercentage > 40 ? 'Moderat' : 'Lav'}
            </div>
          </div>
        </div>

        {/* Tier Benefits */}
        <div className="bg-white rounded-lg p-4 border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: tierColor }} />
            <h4 className="font-semibold text-gray-900">Tier {tier} Fordele</h4>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div>• {currentCapacity.toLocaleString('da-DK')} pladser</div>
            <div>• {Math.floor(currentCapacity * 25).toLocaleString('da-DK')} kr/måned</div>
            <div>• +{Math.round((tier - 1) * 2)}% prestige</div>
            <div>• +{Math.round((tier - 1) * 1)}% atmosfære</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CapacityVisualization;
