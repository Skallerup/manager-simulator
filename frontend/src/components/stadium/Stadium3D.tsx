"use client";

import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Cylinder } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

interface Stadium3DProps {
  capacity: number;
  tier: number;
  atmosphere: number;
  prestige: number;
  homeAdvantage: number;
  name: string;
}

// 3D Stadium Component
function Stadium3DModel({ capacity, tier, atmosphere, prestige }: Omit<Stadium3DProps, 'name'>) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  // Calculate stadium dimensions based on capacity
  const getStadiumDimensions = (capacity: number) => {
    const baseRadius = 2;
    const capacityMultiplier = Math.sqrt(capacity / 20000); // Base capacity 20k
    return {
      radius: baseRadius * capacityMultiplier,
      height: 1 + capacityMultiplier * 0.5,
      seats: Math.min(50, Math.floor(capacity / 2000)) // Max 50 seat rings
    };
  };

  const dimensions = getStadiumDimensions(capacity);
  const tierColor = ['#6B7280', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'][Math.min(tier - 1, 4)];
  const atmosphereIntensity = atmosphere / 100;

  return (
    <group ref={meshRef}>
      {/* Stadium Base */}
      <Cylinder
        args={[dimensions.radius, dimensions.radius * 1.1, 0.2, 32]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial color={tierColor} />
      </Cylinder>

      {/* Stadium Walls */}
      <Cylinder
        args={[dimensions.radius * 0.9, dimensions.radius * 0.9, dimensions.height, 32]}
        position={[0, dimensions.height / 2, 0]}
      >
        <meshStandardMaterial color={tierColor} opacity={0.7} transparent />
      </Cylinder>

      {/* Seating Rings */}
      {Array.from({ length: dimensions.seats }, (_, i) => {
        const ringRadius = (dimensions.radius * 0.8) - (i * 0.05);
        const ringHeight = dimensions.height * 0.3 + (i * 0.02);
        const seatColor = new THREE.Color(tierColor).lerp(
          new THREE.Color('#F59E0B'), 
          atmosphereIntensity
        );
        
        return (
          <Cylinder
            key={i}
            args={[ringRadius, ringRadius, 0.1, 32]}
            position={[0, ringHeight, 0]}
          >
            <meshStandardMaterial 
              color={seatColor} 
              emissive={seatColor}
              emissiveIntensity={atmosphereIntensity * 0.2}
            />
          </Cylinder>
        );
      })}

      {/* Field */}
      <Cylinder
        args={[dimensions.radius * 0.4, dimensions.radius * 0.4, 0.05, 32]}
        position={[0, 0.1, 0]}
      >
        <meshStandardMaterial color="#10B981" />
      </Cylinder>

      {/* Field Lines */}
      <Box args={[dimensions.radius * 0.6, 0.01, 0.02]} position={[0, 0.11, 0]}>
        <meshStandardMaterial color="white" />
      </Box>
      
      <Cylinder
        args={[dimensions.radius * 0.15, dimensions.radius * 0.15, 0.01, 32]}
        position={[0, 0.11, 0]}
      >
        <meshStandardMaterial color="white" />
      </Cylinder>

      {/* Prestige Effects */}
      {prestige > 70 && (
        <Sphere args={[0.1, 16, 16]} position={[0, dimensions.height + 0.5, 0]}>
          <meshStandardMaterial 
            color="#F59E0B" 
            emissive="#F59E0B"
            emissiveIntensity={0.5}
          />
        </Sphere>
      )}
    </group>
  );
}

// Loading Component
function Stadium3DLoader() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

// Main 3D Stadium Component
const Stadium3D: React.FC<Stadium3DProps> = ({
  capacity,
  tier,
  atmosphere,
  prestige,
  homeAdvantage,
  name
}) => {
  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{name} - 3D Visning</h2>
          <p className="text-gray-600">Interaktiv 3D model af dit stadion</p>
        </div>

        {/* 3D Canvas */}
        <div className="relative h-96 bg-gradient-to-b from-blue-50 to-indigo-100 rounded-lg overflow-hidden border-2 border-gray-200">
          <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
            <Suspense fallback={null}>
              {/* Lighting */}
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <pointLight position={[-10, -10, -5]} intensity={0.5} />
              
              {/* Stadium Model */}
              <Stadium3DModel
                capacity={capacity}
                tier={tier}
                atmosphere={atmosphere}
                prestige={prestige}
              />
              
              {/* Controls */}
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={3}
                maxDistance={15}
              />
            </Suspense>
          </Canvas>
          
          {/* Loading Overlay */}
          <Suspense fallback={<Stadium3DLoader />}>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-gray-600">
                Roter med musen • Zoom med scroll • Pan med højreklik
              </div>
            </div>
          </Suspense>
        </div>

        {/* Stats Overlay */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
            <div className="text-xl font-bold text-blue-600">
              {capacity.toLocaleString('da-DK')}
            </div>
            <div className="text-sm text-gray-600">Kapacitet</div>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
            <div className="text-xl font-bold text-green-600">
              Tier {tier}
            </div>
            <div className="text-sm text-gray-600">Niveau</div>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
            <div className="text-xl font-bold text-orange-600">
              {atmosphere}%
            </div>
            <div className="text-sm text-gray-600">Atmosfære</div>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
            <div className="text-xl font-bold text-purple-600">
              {prestige}%
            </div>
            <div className="text-sm text-gray-600">Prestige</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Stadium3D;
