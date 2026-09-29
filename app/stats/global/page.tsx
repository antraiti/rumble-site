'use client'
import UserData from "../../util/UserData";
import type { GlobalStats } from "../../types";
import { useStatsOptions } from "../_components/StatsShell";
import { useStatsFetch } from "../_components/useStatsFetch";
import { ColorTable, ErrorState, LoadingState, StatTiles, formatDuration } from "../_components/StatsUi";

export default function StatsGlobal() {
  const { userToken } = UserData();
  const { includeThemed } = useStatsOptions();
  const { data, error, loading } = useStatsFetch<GlobalStats>(`stats/global?themed=${includeThemed}`, userToken);

  if (error) return <ErrorState />;
  if (loading || !data) return <LoadingState />;

  return (
    <div className="space-y-6">
      <StatTiles items={[
        { label: "Matches played", value: data.matchesplayed },
        { label: "Avg. match length", value: formatDuration(data.averagematchtime) },
        { label: "Avg. players per match", value: data.averagematchsize.toFixed(2) },
      ]} />
      <ColorTable plays={data.colorplaycount} winrates={data.colorwinrates} />
    </div>
  );
}

