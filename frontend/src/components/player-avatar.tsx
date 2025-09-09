"use client";

import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';
import { useMemo } from 'react';

interface PlayerAvatarProps {
  playerName: string;
  position: string;
  size?: number;
  className?: string;
}

export function PlayerAvatar({ playerName, position, size = 64, className = "" }: PlayerAvatarProps) {
  const avatarUrl = useMemo(() => {
    // Generate consistent seed based on player name
    const seed = playerName.toLowerCase().replace(/\s+/g, '-');
    
    // Create a simple hash for consistent styling
    const hash = playerName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // Position-based styling with consistent colors based on name hash
    const getPositionStyle = (pos: string) => {
      const skinColors = ['fdbcb4', 'fd9841', '8d5524'];
      const hairColors = ['0e0e0e', '3c2f1f', '724133'];
      const facialHairs = ['none', 'beard', 'mustache'];
      const glasses = ['none', 'sunglasses', 'reading'];
      
      const skinIndex = Math.abs(hash) % skinColors.length;
      const hairIndex = Math.abs(hash >> 2) % hairColors.length;
      const facialHairIndex = Math.abs(hash >> 4) % facialHairs.length;
      const glassesIndex = Math.abs(hash >> 6) % glasses.length;
      
      return {
        skinColor: skinColors[skinIndex],
        hairColor: hairColors[hairIndex],
        facialHair: facialHairs[facialHairIndex],
        glasses: glasses[glassesIndex]
      };
    };

    const style = getPositionStyle(position);
    
    const avatar = createAvatar(avataaars, {
      seed,
      size,
      backgroundColor: 'f8fafc',
      ...style
    });

    return avatar.toDataUri();
  }, [playerName, position, size]);

  return (
    <div className={`rounded-full border-2 border-gray-200 bg-gray-50 p-1 ${className}`}>
      <img
        src={avatarUrl}
        alt={`${playerName} avatar`}
        className="rounded-full"
        width={size}
        height={size}
      />
    </div>
  );
}
