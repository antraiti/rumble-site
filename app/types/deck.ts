export interface DeckInfo {
  id: number;
  name: string;
  userid: number;
  identityid: number;
  islegal: boolean;
  image?: string;
  lastupdated?: string | null;
}

export interface DeckCommander {
  id: string;
  name: string;
  image?: string;
}

/** [deckInfo, commander, partner, companion] tuple returned by /api/decks. */
export type DeckWithCards = [DeckInfo, DeckCommander?, DeckCommander?, DeckCommander?];
