export interface ColorPlayCounts {
  w: number;
  u: number;
  r: number;
  g: number;
  b: number;
  c: number;
}

export interface ColorWinRates {
  w: number;
  u: number;
  r: number;
  g: number;
  b: number;
  c: number;
}

export interface UserStats {
  matchesplayed: number;
  matcheswon: number;
  averageplacement: number;
  colorplaycount: ColorPlayCounts;
  colorwinrates: ColorWinRates;
}

export interface GlobalStats {
  matchesplayed: number;
  averagematchtime: number;
  averagematchsize: number;
  colorplaycount: ColorPlayCounts;
  colorwinrates: ColorWinRates;
}

export interface WatchlistStat {
  id: string;
  name: string;
  cost: string;
  playcount: number;
  wincount: number;
  average: number;
  artcrop?: string;
}

export interface PlayerSummary {
  gamesPlayed: number;
  kills: number;
  username: string;
}

/** [userId, summary] tuple returned by /api/stats/users. */
export type PlayerSummaryEntry = [number, PlayerSummary];

export interface CommanderStat {
  cardid: string;
  name: string;
  games: number;
  /** Only present on the signed-in player's own stats. */
  wins?: number;
  lastplayed: string | null;
  artcrop?: string;
}

export interface PlayerCommanderStats {
  user: { id: number; username: string };
  commanders: CommanderStat[];
}
