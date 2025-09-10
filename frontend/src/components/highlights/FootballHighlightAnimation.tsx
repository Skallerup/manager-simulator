"use client";

import React, { useEffect, useRef, useState } from 'react';

interface MatchHighlight {
  id: string;
  eventType: string;
  minute: number;
  player: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  isProOnly: boolean;
}

interface FootballHighlightAnimationProps {
  highlight: MatchHighlight;
  onEnd: () => void;
}

export function FootballHighlightAnimation({ highlight, onEnd }: FootballHighlightAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationStepRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const drawField = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      // Clear canvas
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(0, 0, width, height);
      
      // Field outline
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.strokeRect(50, 50, width - 100, height - 100);
      
      // Center line
      ctx.beginPath();
      ctx.moveTo(width / 2, 50);
      ctx.lineTo(width / 2, height - 50);
      ctx.stroke();
      
      // Center circle
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 50, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Center dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      // Goal areas
      ctx.strokeRect(50, height / 2 - 90, 100, 180);
      ctx.strokeRect(width - 150, height / 2 - 90, 100, 180);
      
      // Penalty areas
      ctx.strokeRect(50, height / 2 - 120, 150, 240);
      ctx.strokeRect(width - 200, height / 2 - 120, 150, 240);
    };

    const drawPlayers = (step: number) => {
      const width = canvas.width;
      const height = canvas.height;
      
      // Home team (left side) - with some movement
      const homePlayers = [
        { x: 150 + Math.sin(step * 0.02) * 10, y: height / 2 - 60 + Math.cos(step * 0.03) * 5 },
        { x: 200 + Math.sin(step * 0.025) * 8, y: height / 2 - 30 + Math.cos(step * 0.035) * 3 },
        { x: 200 + Math.sin(step * 0.03) * 6, y: height / 2 + 30 + Math.cos(step * 0.04) * 4 },
        { x: 150 + Math.sin(step * 0.035) * 12, y: height / 2 + 60 + Math.cos(step * 0.025) * 6 },
        { x: 250 + Math.sin(step * 0.04) * 7, y: height / 2 - 40 + Math.cos(step * 0.045) * 5 },
        { x: 250 + Math.sin(step * 0.045) * 9, y: height / 2 + 40 + Math.cos(step * 0.05) * 3 },
        { x: 300 + Math.sin(step * 0.05) * 5, y: height / 2 - 20 + Math.cos(step * 0.055) * 4 },
        { x: 300 + Math.sin(step * 0.055) * 8, y: height / 2 + 20 + Math.cos(step * 0.06) * 2 },
        { x: 350 + Math.sin(step * 0.06) * 6, y: height / 2 + Math.cos(step * 0.065) * 3 },
        { x: 400 + Math.sin(step * 0.065) * 4, y: height / 2 - 10 + Math.cos(step * 0.07) * 2 },
        { x: 400 + Math.sin(step * 0.07) * 7, y: height / 2 + 10 + Math.cos(step * 0.075) * 1 }
      ];
      
      // Away team (right side) - with some movement
      const awayPlayers = [
        { x: width - 150 + Math.sin(step * 0.08) * 10, y: height / 2 - 60 + Math.cos(step * 0.09) * 5 },
        { x: width - 200 + Math.sin(step * 0.085) * 8, y: height / 2 - 30 + Math.cos(step * 0.095) * 3 },
        { x: width - 200 + Math.sin(step * 0.09) * 6, y: height / 2 + 30 + Math.cos(step * 0.1) * 4 },
        { x: width - 150 + Math.sin(step * 0.095) * 12, y: height / 2 + 60 + Math.cos(step * 0.105) * 6 },
        { x: width - 250 + Math.sin(step * 0.1) * 7, y: height / 2 - 40 + Math.cos(step * 0.11) * 5 },
        { x: width - 250 + Math.sin(step * 0.11) * 9, y: height / 2 + 40 + Math.cos(step * 0.12) * 3 },
        { x: width - 300 + Math.sin(step * 0.12) * 5, y: height / 2 - 20 + Math.cos(step * 0.13) * 4 },
        { x: width - 300 + Math.sin(step * 0.13) * 8, y: height / 2 + 20 + Math.cos(step * 0.14) * 2 },
        { x: width - 350 + Math.sin(step * 0.14) * 6, y: height / 2 + Math.cos(step * 0.15) * 3 },
        { x: width - 400 + Math.sin(step * 0.15) * 4, y: height / 2 - 10 + Math.cos(step * 0.16) * 2 },
        { x: width - 400 + Math.sin(step * 0.16) * 7, y: height / 2 + 10 + Math.cos(step * 0.17) * 1 }
      ];
      
      // Draw home players
      ctx.fillStyle = '#0066ff';
      homePlayers.forEach(player => {
        ctx.beginPath();
        ctx.arc(player.x, player.y, 8, 0, 2 * Math.PI);
        ctx.fill();
      });
      
      // Draw away players
      ctx.fillStyle = '#ff6600';
      awayPlayers.forEach(player => {
        ctx.beginPath();
        ctx.arc(player.x, player.y, 8, 0, 2 * Math.PI);
        ctx.fill();
      });
    };

    const drawBall = (step: number) => {
      const width = canvas.width;
      const height = canvas.height;
      
      // Ball position based on animation step
      let ballX = width / 2;
      let ballY = height / 2;
      
      if (highlight.eventType === 'goal') {
        // Ball moves towards goal
        ballX = width / 2 + (step * 2);
        ballY = height / 2 + Math.sin(step * 0.1) * 20;
      } else if (highlight.eventType === 'save') {
        // Ball moves towards goal but gets saved
        ballX = width / 2 + (step * 1.5);
        ballY = height / 2 + Math.sin(step * 0.15) * 15;
      } else if (highlight.eventType === 'red_card') {
        // Ball in center, player gets card
        ballX = width / 2;
        ballY = height / 2;
      } else if (highlight.eventType === 'penalty') {
        // Ball moves from penalty spot
        ballX = width / 2 + (step * 3);
        ballY = height / 2;
      }
      
      // Draw ball
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ballX, ballY, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      // Ball shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(ballX + 2, ballY + 2, 6, 0, 2 * Math.PI);
      ctx.fill();
    };

    const drawEventText = (step: number) => {
      const width = canvas.width;
      const height = canvas.height;
      
      // Event type text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(highlight.eventType.toUpperCase(), width / 2, 80);
      
      // Player name
      ctx.font = 'bold 18px Arial';
      ctx.fillText(highlight.player, width / 2, 110);
      
      // Minute
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`${highlight.minute}'`, width / 2, height - 30);
      
      // Event-specific text
      if (highlight.eventType === 'goal') {
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 32px Arial';
        ctx.fillText('⚽ MÅL! ⚽', width / 2, height / 2 + 100);
      } else if (highlight.eventType === 'save') {
        ctx.fillStyle = '#0066ff';
        ctx.font = 'bold 28px Arial';
        ctx.fillText('🛡️ REDNING! 🛡️', width / 2, height / 2 + 100);
      } else if (highlight.eventType === 'red_card') {
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 28px Arial';
        ctx.fillText('🔴 RØDT KORT! 🔴', width / 2, height / 2 + 100);
      } else if (highlight.eventType === 'penalty') {
        ctx.fillStyle = '#ff6600';
        ctx.font = 'bold 28px Arial';
        ctx.fillText('⚽ STRAFFESPARK! ⚽', width / 2, height / 2 + 100);
      }
    };

    const animate = () => {
      if (!isPlaying) return;
      
      const step = animationStepRef.current;
      
      drawField();
      drawPlayers(step);
      drawBall(step);
      drawEventText(step);
      
      if (step >= 200) { // Animation duration
        setIsPlaying(false);
        onEnd();
        return;
      }
      
      animationStepRef.current += 1;
    };

    const interval = setInterval(animate, 50); // 20 FPS
    
    return () => clearInterval(interval);
  }, [highlight, isPlaying, onEnd]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ background: '#4ade80' }}
    />
  );
}
