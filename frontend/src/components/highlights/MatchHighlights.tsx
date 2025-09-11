"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Clock, 
  Trophy, 
  Shield,
  Lock,
  Star
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import { apiFetch } from '@/lib/api';
import { FootballHighlightAnimation } from './FootballHighlightAnimation';

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

interface MatchHighlightsProps {
  matchId: string;
  isProUser?: boolean;
  highlights?: MatchHighlight[];
}

export function MatchHighlights({ matchId, isProUser = false, highlights: propHighlights }: MatchHighlightsProps) {
  const { t } = useTranslation('match');
  const [highlights, setHighlights] = useState<MatchHighlight[]>(propHighlights || []);
  const [loading, setLoading] = useState(!propHighlights);
  const [error, setError] = useState<string | null>(null);
  const [selectedHighlight, setSelectedHighlight] = useState<MatchHighlight | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    if (propHighlights) {
      setHighlights(propHighlights);
      setLoading(false);
    } else {
      fetchHighlights();
    }
  }, [matchId, propHighlights]);

  const fetchHighlights = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/api/matches/bot/${matchId}/highlights`);
      setHighlights(response.highlights || []);
    } catch (err: any) {
      if (err.message?.includes('PRO feature')) {
        setError('PRO_FEATURE');
      } else {
        setError('Failed to load highlights');
      }
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'goal':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'save':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'red_card':
        return <Badge className="h-4 w-4 text-red-500" />;
      case 'penalty':
        return <Star className="h-4 w-4 text-purple-500" />;
      default:
        return <Play className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'goal':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'save':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'red_card':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'penalty':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayHighlight = (highlight: MatchHighlight) => {
    setSelectedHighlight(highlight);
    setIsPlaying(true);
    setVideoError(null);
  };

  const handleCloseVideo = () => {
    setSelectedHighlight(null);
    setIsPlaying(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            {t('highlights')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error === 'PRO_FEATURE') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            {t('highlights')}
            <Badge variant="secondary" className="ml-2">
              <Lock className="h-3 w-3 mr-1" />
              PRO
            </Badge>
          </CardTitle>
          <CardDescription>
            {t('highlightsProDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('proFeatureRequired')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('highlightsProMessage')}
            </p>
            <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
              <Star className="h-4 w-4 mr-2" />
              {t('upgradeToPro')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            {t('highlights')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <Button onClick={fetchHighlights} className="mt-4">
              {t('retry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (highlights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            {t('highlights')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('noHighlights')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            {t('highlights')}
            <Badge variant="secondary" className="ml-2">
              {highlights.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            {t('highlightsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {highlights.map((highlight) => (
              <div
                key={highlight.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={highlight.thumbnailUrl}
                      alt={highlight.description}
                      className="w-16 h-12 object-cover rounded"
                      onError={(e) => {
                        // Fallback to a placeholder if image fails to load
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA2NCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAxNkg0MFYzMkgyNFYxNloiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI4IDIwSDM2VjI4SDI4VjIwWiIgZmlsbD0iI0U1RTdFQiIvPgo8L3N2Zz4K';
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
                      <Play className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getEventIcon(highlight.eventType)}
                      <Badge className={getEventColor(highlight.eventType)}>
                        {highlight.eventType.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-mono text-muted-foreground">
                        {highlight.minute}'
                      </span>
                    </div>
                    <p className="font-medium text-sm">{highlight.player}</p>
                    <p className="text-xs text-muted-foreground">{highlight.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDuration(highlight.duration)}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handlePlayHighlight(highlight)}
                    className="ml-2"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    {t('play')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Video Modal */}
      {selectedHighlight && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-semibold">{selectedHighlight.player}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedHighlight.minute}' - {selectedHighlight.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  <Maximize className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleCloseVideo}>
                  ×
                </Button>
              </div>
            </div>
            <div className="relative">
              {videoError ? (
                <div className="w-full h-[60vh] bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">{videoError}</p>
                    <Button onClick={() => setVideoError(null)}>
                      {t('retry')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-[60vh] bg-green-600 relative overflow-hidden">
                  <FootballHighlightAnimation 
                    highlight={selectedHighlight}
                    onEnd={() => setIsPlaying(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
