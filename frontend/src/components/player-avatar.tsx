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
    
    // Position-based styling
    const getPositionStyle = (pos: string) => {
      switch (pos.toUpperCase()) {
        case 'GOALKEEPER':
          return {
            skinColor: ['fdbcb4', 'fd9841', '8d5524'][Math.floor(Math.random() * 3)],
            hairColor: ['0e0e0e', '3c2f1f', '724133'][Math.floor(Math.random() * 3)],
            facialHair: Math.random() > 0.7 ? 'beard' : 'none',
            glasses: Math.random() > 0.8 ? 'sunglasses' : 'none'
          };
        case 'DEFENDER':
          return {
            skinColor: ['fdbcb4', 'fd9841', '8d5524'][Math.floor(Math.random() * 3)],
            hairColor: ['0e0e0e', '3c2f1f', '724133'][Math.floor(Math.random() * 3)],
            facialHair: Math.random() > 0.6 ? 'beard' : 'none',
            glasses: Math.random() > 0.9 ? 'sunglasses' : 'none'
          };
        case 'MIDFIELDER':
          return {
            skinColor: ['fdbcb4', 'fd9841', '8d5524'][Math.floor(Math.random() * 3)],
            hairColor: ['0e0e0e', '3c2f1f', '724133'][Math.floor(Math.random() * 3)],
            facialHair: Math.random() > 0.8 ? 'beard' : 'none',
            glasses: Math.random() > 0.85 ? 'sunglasses' : 'none'
          };
        case 'FORWARD':
          return {
            skinColor: ['fdbcb4', 'fd9841', '8d5524'][Math.floor(Math.random() * 3)],
            hairColor: ['0e0e0e', '3c2f1f', '724133'][Math.floor(Math.random() * 3)],
            facialHair: Math.random() > 0.9 ? 'beard' : 'none',
            glasses: Math.random() > 0.9 ? 'sunglasses' : 'none'
          };
        default:
          return {
            skinColor: ['fdbcb4', 'fd9841', '8d5524'][Math.floor(Math.random() * 3)],
            hairColor: ['0e0e0e', '3c2f1f', '724133'][Math.floor(Math.random() * 3)],
            facialHair: Math.random() > 0.7 ? 'beard' : 'none',
            glasses: Math.random() > 0.8 ? 'sunglasses' : 'none'
          };
      }
    };

    const style = getPositionStyle(position);
    
    const avatar = createAvatar(avataaars, {
      seed,
      size,
      backgroundColor: 'f8fafc', // Light gray background for better contrast
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
