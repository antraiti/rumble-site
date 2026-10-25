import { z } from 'zod';

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
  identityid: z.number().int().min(0).max(31),
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
