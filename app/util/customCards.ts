import { z } from 'zod';
import type { Color } from '@/app/types/color';

const imageURL = z
  .string()
  .trim()
  .max(256)
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password;
    } catch {
      return false;
    }
  }, 'Use an HTTP(S) image URL without credentials');

export const customCardFaceSchema = z.object({
  name: z.string().trim().min(1).max(255),
  typeline: z.string().trim().min(1).max(128),
  oracletext: z.string().max(65535),
  mv: z.number().int().min(0).max(1000),
  cost: z.string().max(64),
  power: z.string().max(8),
  toughness: z.string().max(8),
  cardimage: imageURL,
  artcrop: imageURL,
});

export const customCardSchema = z.object({
  front: customCardFaceSchema,
  back: customCardFaceSchema.nullable(),
  identityid: z.number().int().min(0).max(32),
  banned: z.boolean(),
  watchlist: z.boolean(),
});

export type CustomCardFace = z.infer<typeof customCardFaceSchema>;
export type CustomCardInput = z.infer<typeof customCardSchema>;
export type CustomCardDocument = CustomCardInput & { id: string };
export type CustomCardSummary = { id: string; name: string; transform: boolean };

export function emptyCustomFace(): CustomCardFace {
  return {
    name: '',
    typeline: '',
    oracletext: '',
    mv: 0,
    cost: '',
    power: '',
    toughness: '',
    cardimage: '',
    artcrop: '',
  };
}

export function emptyCustomCard(): CustomCardInput {
  return { front: emptyCustomFace(), back: null, identityid: 0, banned: false, watchlist: false };
}

const importedCardSchema = z.object({
  name: z.string().trim().min(1),
  colorIdentity: z.array(z.enum(['W', 'U', 'B', 'R', 'G'])).default([]),
  typeLine: z.string().trim().min(1),
  manaCost: z.string().default(''),
  manaValue: z.number().int().min(0).default(0),
  power: z.string().nullish(),
  toughness: z.string().nullish(),
  rulesText: z.string().default(''),
  cardImage: z.string().default(''),
  artCrop: z.string().default(''),
});

export const customCardImportSchema = z.array(importedCardSchema).min(1);

/** Converts an exported card list (camelCase, colorIdentity letters) into create requests. */
export function toCustomCardInputs(
  cards: z.infer<typeof customCardImportSchema>,
  colors: Color[]
): CustomCardInput[] {
  return cards.map((card) => {
    const letters = new Set(card.colorIdentity);
    const identity = colors.find(
      (color) =>
        color.white === letters.has('W') &&
        color.blue === letters.has('U') &&
        color.black === letters.has('B') &&
        color.red === letters.has('R') &&
        color.green === letters.has('G')
    );
    if (!identity) throw new Error(`No color identity matches ${card.name}`);
    return {
      front: {
        name: card.name,
        typeline: card.typeLine,
        oracletext: card.rulesText,
        mv: card.manaValue,
        cost: card.manaCost,
        power: card.power ?? '',
        toughness: card.toughness ?? '',
        cardimage: card.cardImage,
        artcrop: card.artCrop,
      },
      back: null,
      identityid: identity.id,
      banned: false,
      watchlist: false,
    };
  });
}
