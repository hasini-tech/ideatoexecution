export const dynamic = 'force-dynamic';
import { route, json } from '@/lib/api';
import { clearAuthCookie } from '@/lib/auth';

export const POST = route(async () => {
  clearAuthCookie();
  return json({ ok: true });
}, { auth: false });
