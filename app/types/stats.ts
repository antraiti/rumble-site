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

export interface CardLinkStat {
  cardid: string;
  name: string;
  decks: number;
  artcrop?: string;
}

export interface CardDetailStats {
  card: { id: string; name: string; typeline: string; oracletext: string; mv: number; cost: string; identityid: number; banned: boolean; watchlist: boolean; custom: boolean };
  image: string;
  artcrop: string;
  plays: number;
  wins: number;
  placed: number;
  placementtotal: number;
  firstplayed: string | null;
  lastplayed: string | null;
  baselinewinrate: number;
  decks: number;
  players: number;
  ascommander: number;
  eligibledecks: number;
  totaldecks: number;
  monthly: { month: string; plays: number; wins: number }[];
  commanders: CardLinkStat[];
  pairs: (CardLinkStat & { share: number; lift: number })[];
  mine: { plays: number; wins: number };
}

export interface PlayerCount {
  userid: number;
  username: string;
  count: number;
}

export interface SeatStat {
  seat: number;
  games: number;
  wins: number;
}

export interface PlayerMatchups {
  nemeses: PlayerCount[];
  victims: PlayerCount[];
  /** `wins` is only present on the player's own view. */
  podmates: { userid: number; username: string; games: number; wins?: number }[];
  pace: { mine: number; global: number };
  /** Own view only. */
  seats?: SeatStat[];
  /** Own view only. */
  streaks?: { longest: number; current: number; sincelastwin: number; everwon: boolean };
}

export interface IdentityPeriodStat {
  period: string;
  identityid: number;
  name: string | null;
  white: boolean;
  blue: boolean;
  black: boolean;
  red: boolean;
  green: boolean;
  plays: number;
}

export interface GlobalExtraStats {
  seats: SeatStat[];
  wincons: { id: number; name: string | null; games: number; averagepower: number }[];
  identities: IdentityPeriodStat[];
}
