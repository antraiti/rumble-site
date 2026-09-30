export interface Card {
  id: string;
  name: string;
  cost: string;
  mv: number;
  typeline: string;
}

/** One row from /api/stats/cards: [cardId, cardStat] */
export type CardStatEntry = [string, CardStat];

export interface CardStat {
  card: Card;
  count: number;
  wins: number;
  placementtotal: number;
  artcrop: string;
}

export interface BulkProcessReport {
  dry_run: boolean;
  database_writes: boolean;
  source: string;
  report_file?: string;
  cards_scanned: number;
  english_cards: number;
  skipped_non_english: number;
  skipped_alchemy: number;
  skipped_invalid: number;
  textless_cards: number;
  new_cards: number;
  updated_cards: number;
  new_card_backs: number;
  new_printings: number;
  new_card_tokens: number;
  ban_group_updates?: number;
  power_updates?: number;
  unresolved_token_cards: number;
  unresolved_token_details: { card_oracle_id: string; missing_token_ids: string[] }[];
  added_card_ids: string[];
  updated_card_ids: string[];
  added_card_back_ids: string[];
  added_printing_ids: string[];
  added_card_token_links: { card_id: string; token_id: string }[];
  warnings: string[];
  warnings_truncated: boolean;
  sample_limit: number;
}
