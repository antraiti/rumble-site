import { ZodType } from 'zod';

/** Parses and validates a request body against a zod schema; returns a 400 Response on failure. */
export async function parseBody<T>(
  request: Request,
  schema: ZodType<T>
): Promise<{ data: T } | { error: Response }> {
  const json = await request.json().catch(() => null);
  const result = schema.safeParse(json);
  if (!result.success) {
    return { error: Response.json({ error: 'Invalid request body', issues: result.error.issues }, { status: 400 }) };
  }
  return { data: result.data };
}
