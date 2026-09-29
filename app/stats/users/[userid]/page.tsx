'use client'
import Link from "next/link";
import { use } from "react";
import UserData from "../../../util/UserData";
import PlayerStats from "../../_components/PlayerStats";

export default function StatsUser({ params }: { params: Promise<{ userid: string }> }) {
  const { userid } = use(params);
  const { userId } = UserData();
  return (
    <div className="space-y-4">
      <Link href="/stats/users" className="link link-hover">← All players</Link>
      <PlayerStats userId={userid} isSelf={userId != null && String(userId) === userid} />
    </div>
  );
}
