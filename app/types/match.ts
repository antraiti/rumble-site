export interface MatchInfo {
  id: number;
  name: string;
  power: number;
  start?: string;
  end?: string;
}

export interface Performance {
  id: number;
  matchid: number;
  userid: number;
  username: string;
  deckid?: number;
  placement?: number;
  order?: number;
  killedby?: number;
}

export interface MatchDetails {
  match: MatchInfo;
  performances: Performance[];
}
