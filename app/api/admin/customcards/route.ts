import { proxyFetch } from '@/app/util/apiProxy';
import { parseBody } from '@/app/util/validate';
import { customCardSchema } from '@/app/util/customCards';

export async function GET(request: Request) {
  return proxyFetch(request, '/admin/customcards');
}

export async function POST(request: Request) {
  const parsed = await parseBody(request, customCardSchema);
  if ('error' in parsed) return parsed.error;
  return proxyFetch(request, '/admin/customcards', { body: parsed.data });
}
