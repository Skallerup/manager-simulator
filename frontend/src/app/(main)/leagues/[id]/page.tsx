"use client";

import { useParams, useRouter } from "next/navigation";
import { LeagueDetails } from "@/components/leagues/LeagueDetails";

export default function LeagueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;

  const handleBack = () => {
    router.push("/leagues");
  };

  return <LeagueDetails leagueId={leagueId} onBack={handleBack} />;
}
