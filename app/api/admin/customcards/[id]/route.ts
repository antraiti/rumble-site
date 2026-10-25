import { proxyFetch } from '@/app/util/apiProxy';
import { parseBody } from '@/app/util/validate';
import { customCardSchema } from '@/app/util/customCards';

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Context) {
  const { id } = await params;
  return proxyFetch(request, `/admin/customcards/${encodeURIComponent(id)}`);
}

export async function PUT(request: Request, { params }: Context) {
  const { id } = await params;
  const parsed = await parseBody(request, customCardSchema);
  if ('error' in parsed) return parsed.error;
  return proxyFetch(request, `/admin/customcards/${encodeURIComponent(id)}`, { body: parsed.data });
}
