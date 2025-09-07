"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import type { Team } from "../../lib/types";
import { useAuth } from "../../hooks/useAuth";

interface TeamCardProps {
  team: Team;
  onEdit?: (teamId: string) => void;
  onDelete?: (teamId: string) => void;
}

export function TeamCard({ team, onEdit, onDelete }: TeamCardProps) {
  const { user } = useAuth();
  const isOwner = team.ownerId === user?.id;
  const playerCount = team._count?.players || 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{team.name}</CardTitle>
            <CardDescription>
              Owned by {team.owner?.name || team.owner?.email || 'Unknown'}
            </CardDescription>
          </div>
          {isOwner && <Badge variant="outline">Your Team</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Players:</span> {playerCount}/16
            </div>
            <div>
              <span className="font-medium">Draft Position:</span>{" "}
              {team.draftPosition ? `#${team.draftPosition}` : "TBD"}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {isOwner && onEdit && (
              <button
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => onEdit(team.id)}
              >
                Edit
              </button>
            )}
            {isOwner && onDelete && (
              <button
                className="text-sm text-red-600 hover:text-red-800"
                onClick={() => onDelete(team.id)}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
