export interface NormalizedDeckEntry {
  deck: Record<string, any>;
  card?: Record<string, any>;
}

export function normalizeDeckEntry(entry: unknown): NormalizedDeckEntry | null {
  if (Array.isArray(entry)) {
    const deck = entry[0];
    if (!deck || typeof deck !== "object") return null;
    const card = entry[1];
    return {
      deck: deck as Record<string, any>,
      card: card && typeof card === "object" ? card as Record<string, any> : undefined,
    };
  }

  if (entry && typeof entry === "object") {
    return { deck: entry as Record<string, any> };
  }

  return null;
}
