"use client";

import { LeagueList } from "../../../components/leagues/LeagueList";
import { Trophy } from "lucide-react";

export default function LeaguesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Trophy className="h-8 w-8 text-yellow-500" />
        <div>
          <h1 className="text-3xl font-bold">Ligaer</h1>
          <p className="text-gray-600">Vælg en liga for at se stillings-tabel</p>
        </div>
      </div>

      {/* League List */}
      <LeagueList />
    </div>
  );
}
