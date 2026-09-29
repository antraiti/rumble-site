'use client'
import UserData from "../util/UserData";
import PlayerStats from "./_components/PlayerStats";

export default function StatsHome() {
  const { userId, userName } = UserData();
  return <PlayerStats userId={userId} fallbackName={userName ?? undefined} isSelf />;
}

