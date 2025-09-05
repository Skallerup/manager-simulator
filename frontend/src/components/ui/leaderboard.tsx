import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Trophy, Crown, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  position: number;
  name: string;
  points: number;
  wins: number;
  losses: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
  showLosses?: boolean;
}

export function Leaderboard({
  entries,
  title = "Leaderboard",
  showLosses = true,
}: LeaderboardProps) {
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Award className="h-4 w-4 text-amber-600" />;
      default:
        return (
          <span className="text-sm font-bold text-muted-foreground">
            #{position}
          </span>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.position}
              className="flex items-center justify-between text-sm py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                {getPositionIcon(entry.position)}
                <span className="font-medium truncate max-w-[120px]">
                  {entry.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{entry.points}P</span>
                <span className="text-green-600">{entry.wins}W</span>
                {showLosses && (
                  <span className="text-red-500">{entry.losses}L</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
