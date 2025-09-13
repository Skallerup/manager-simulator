"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, Star, Zap } from 'lucide-react';

interface StadiumVisualizationProps {
  capacity: number;
  tier: number;
  atmosphere: number;
  prestige: number;
  homeAdvantage: number;
  name: string;
}

const StadiumVisualization: React.FC<StadiumVisualizationProps> = ({
  capacity,
  tier,
  atmosphere,
  prestige,
  homeAdvantage,
  name
}) => {
  // Calculate stadium size based on capacity
  const getStadiumSize = (capacity: number) => {
    if (capacity >= 100000) return { width: 400, height: 300, scale: 1.2 };
    if (capacity >= 75000) return { width: 350, height: 280, scale: 1.1 };
    if (capacity >= 50000) return { width: 300, height: 250, scale: 1.0 };
    if (capacity >= 35000) return { width: 250, height: 220, scale: 0.9 };
    return { width: 200, height: 180, scale: 0.8 };
  };

  // Calculate tier color
  const getTierColor = (tier: number) => {
    const colors = [
      '#6B7280', // Tier 1 - Gray
      '#10B981', // Tier 2 - Green
      '#3B82F6', // Tier 3 - Blue
      '#8B5CF6', // Tier 4 - Purple
      '#F59E0B'  // Tier 5 - Gold
    ];
    return colors[Math.min(tier - 1, 4)];
  };

  // Calculate atmosphere color
  const getAtmosphereColor = (atmosphere: number) => {
    if (atmosphere >= 80) return '#10B981'; // Green
    if (atmosphere >= 60) return '#3B82F6'; // Blue
    if (atmosphere >= 40) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const stadiumSize = getStadiumSize(capacity);
  const tierColor = getTierColor(tier);
  const atmosphereColor = getAtmosphereColor(atmosphere);

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        {/* Stadium Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{name}</h2>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              <span>Tier {tier}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{capacity.toLocaleString('da-DK')} pladser</span>
            </div>
          </div>
        </div>

        {/* Stadium Visualization */}
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: stadiumSize.scale, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
            style={{ width: stadiumSize.width, height: stadiumSize.height }}
          >
            {/* Stadium Base */}
            <svg
              width={stadiumSize.width}
              height={stadiumSize.height}
              viewBox={`0 0 ${stadiumSize.width} ${stadiumSize.height}`}
              className="drop-shadow-lg"
            >
              {/* Stadium Structure */}
              <ellipse
                cx={stadiumSize.width / 2}
                cy={stadiumSize.height / 2}
                rx={stadiumSize.width / 2 - 20}
                ry={stadiumSize.height / 2 - 20}
                fill={tierColor}
                fillOpacity={0.3}
                stroke={tierColor}
                strokeWidth="3"
              />
              
              {/* Stadium Seats */}
              <ellipse
                cx={stadiumSize.width / 2}
                cy={stadiumSize.height / 2}
                rx={stadiumSize.width / 2 - 40}
                ry={stadiumSize.height / 2 - 40}
                fill={atmosphereColor}
                fillOpacity={0.6}
                stroke={atmosphereColor}
                strokeWidth="2"
              />
              
              {/* Center Field */}
              <ellipse
                cx={stadiumSize.width / 2}
                cy={stadiumSize.height / 2}
                rx={stadiumSize.width / 4}
                ry={stadiumSize.height / 4}
                fill="#10B981"
                fillOpacity={0.8}
              />
              
              {/* Field Lines */}
              <line
                x1={stadiumSize.width / 2 - stadiumSize.width / 8}
                y1={stadiumSize.height / 2}
                x2={stadiumSize.width / 2 + stadiumSize.width / 8}
                y2={stadiumSize.height / 2}
                stroke="white"
                strokeWidth="2"
              />
              <circle
                cx={stadiumSize.width / 2}
                cy={stadiumSize.height / 2}
                r={stadiumSize.width / 12}
                fill="none"
                stroke="white"
                strokeWidth="2"
              />
            </svg>

            {/* Floating Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg border-2"
              style={{ borderColor: tierColor }}
            >
              <Star className="h-6 w-6" style={{ color: tierColor }} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="absolute -bottom-4 -left-4 bg-white rounded-full p-3 shadow-lg border-2"
              style={{ borderColor: atmosphereColor }}
            >
              <Zap className="h-6 w-6" style={{ color: atmosphereColor }} />
            </motion.div>
          </motion.div>
        </div>

        {/* Stadium Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold" style={{ color: tierColor }}>
              Tier {tier}
            </div>
            <div className="text-sm text-gray-600">Stadion Niveau</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {capacity.toLocaleString('da-DK')}
            </div>
            <div className="text-sm text-gray-600">Kapacitet</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold" style={{ color: atmosphereColor }}>
              {atmosphere}%
            </div>
            <div className="text-sm text-gray-600">Atmosfære</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {prestige}%
            </div>
            <div className="text-sm text-gray-600">Prestige</div>
          </div>
        </motion.div>

        {/* Home Advantage Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-full border-2 border-green-200">
            <Zap className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-800">
              Hjemmefordel: +{Math.round(homeAdvantage * 100)}%
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StadiumVisualization;
