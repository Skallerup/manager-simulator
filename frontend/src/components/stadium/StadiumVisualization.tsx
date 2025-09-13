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
            
            {/* Individual Seat Rows - Lower Tier */}
            {Array.from({ length: Math.min(8, Math.floor(capacity / 5000)) }, (_, i) => {
              const rowRadiusX = (stadiumSize.width / 2 - 40) - (i * 8);
              const rowRadiusY = (stadiumSize.height / 2 - 40) - (i * 6);
              const seatCount = Math.floor((rowRadiusX * 2 * Math.PI) / 12);
              
              return (
                <g key={`lower-row-${i}`}>
                  {/* Seat Row Base */}
                  <ellipse
                    cx={stadiumSize.width / 2}
                    cy={stadiumSize.height / 2}
                    rx={rowRadiusX}
                    ry={rowRadiusY}
                    fill="#1F2937"
                    fillOpacity={0.8}
                    stroke="#374151"
                    strokeWidth="1"
                  />
                  
                  {/* Individual Seats */}
                  {Array.from({ length: Math.min(seatCount, 32) }, (_, seatIndex) => {
                    const angle = (seatIndex / seatCount) * Math.PI * 2;
                    const x = stadiumSize.width / 2 + Math.cos(angle) * rowRadiusX * 0.8;
                    const y = stadiumSize.height / 2 + Math.sin(angle) * rowRadiusY * 0.8;
                    
                    return (
                      <rect
                        key={`seat-${i}-${seatIndex}`}
                        x={x - 3}
                        y={y - 2}
                        width="6"
                        height="4"
                        fill={atmosphereColor}
                        fillOpacity={0.9}
                        stroke={tierColor}
                        strokeWidth="0.5"
                        rx="1"
                      />
                    );
                  })}
                </g>
              );
            })}
            
            {/* Individual Seat Rows - Upper Tier */}
            {Array.from({ length: Math.min(6, Math.floor(capacity / 8000)) }, (_, i) => {
              const rowIndex = Math.min(8, Math.floor(capacity / 5000)) + i;
              const rowRadiusX = (stadiumSize.width / 2 - 80) - (i * 6);
              const rowRadiusY = (stadiumSize.height / 2 - 60) - (i * 4);
              const seatCount = Math.floor((rowRadiusX * 2 * Math.PI) / 10);
              
              return (
                <g key={`upper-row-${i}`}>
                  {/* Seat Row Base */}
                  <ellipse
                    cx={stadiumSize.width / 2}
                    cy={stadiumSize.height / 2}
                    rx={rowRadiusX}
                    ry={rowRadiusY}
                    fill="#1F2937"
                    fillOpacity={0.8}
                    stroke="#374151"
                    strokeWidth="1"
                  />
                  
                  {/* Individual Seats */}
                  {Array.from({ length: Math.min(seatCount, 24) }, (_, seatIndex) => {
                    const angle = (seatIndex / seatCount) * Math.PI * 2;
                    const x = stadiumSize.width / 2 + Math.cos(angle) * rowRadiusX * 0.8;
                    const y = stadiumSize.height / 2 + Math.sin(angle) * rowRadiusY * 0.8;
                    
                    return (
                      <rect
                        key={`seat-upper-${i}-${seatIndex}`}
                        x={x - 2.5}
                        y={y - 1.5}
                        width="5"
                        height="3"
                        fill={atmosphereColor}
                        fillOpacity={0.9}
                        stroke={tierColor}
                        strokeWidth="0.5"
                        rx="0.5"
                      />
                    );
                  })}
                </g>
              );
            })}
              
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

            {/* Prestige Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="absolute -top-2 -right-2 bg-white rounded-lg p-2 shadow-lg border-2"
              style={{ borderColor: tierColor }}
            >
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" style={{ color: tierColor }} />
                <span className="text-xs font-semibold" style={{ color: tierColor }}>
                  Prestige
                </span>
              </div>
            </motion.div>

            {/* Home Advantage Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="absolute -bottom-2 -left-2 bg-white rounded-lg p-2 shadow-lg border-2"
              style={{ borderColor: atmosphereColor }}
            >
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4" style={{ color: atmosphereColor }} />
                <span className="text-xs font-semibold" style={{ color: atmosphereColor }}>
                  Hjemmefordel
                </span>
              </div>
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
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="h-4 w-4 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">
                {prestige}%
              </div>
            </div>
            <div className="text-sm text-gray-600">Prestige</div>
            <div className="text-xs text-gray-500 mt-1">
              Stadion status & renommé
            </div>
          </div>
        </motion.div>

        {/* Home Advantage Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border-2 border-green-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-green-600" />
              <span className="font-semibold text-green-800 text-lg">
                Hjemmefordel
              </span>
            </div>
            <div className="text-2xl font-bold text-green-800">
              +{Math.round(homeAdvantage * 100)}%
            </div>
            <div className="text-sm text-green-600">
              (Baseret på atmosfære: {atmosphere}%)
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StadiumVisualization;
