import { NextResponse } from 'next/server';
import { runReminders } from '@/lib/reminders';

export const dynamic = 'force-dynamic';

// Scheduled job endpoint. Call it every 5–15 minutes with:  Authorization: Bearer <CRON_SECRET>
// (GitHub Actions, cron-job.org, Vercel Cron, a server crontab, ...)
export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization');
  if (!secret || auth !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, ...(await runReminders()) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
