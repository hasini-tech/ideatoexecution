export const dynamic = 'force-dynamic';
import { route, json, bad, body } from '@/lib/api';
import { publicUser, refreshGuestCookie } from '@/lib/auth';
import { isTime } from '@/lib/dates';

export const GET = route(async (req, ctx, user) => json({ user: publicUser(user) }));

export const PATCH = route(async (req, ctx, user) => {
  const b = await body(req);
  if (b.name !== undefined) {
    const n = String(b.name).trim();
    if (!n) return bad('Name cannot be empty.');
    user.name = n.slice(0, 80);
  }
  if (b.timezone) {
    try { new Intl.DateTimeFormat('en', { timeZone: b.timezone }); user.timezone = b.timezone; } catch { return bad('Invalid timezone.'); }
  }
  const s = b.settings || {};
  if (s.remindersEnabled !== undefined) user.settings.remindersEnabled = !!s.remindersEnabled;
  if (s.remindUpcoming !== undefined) user.settings.remindUpcoming = !!s.remindUpcoming;
  if (s.reminderTime !== undefined) {
    if (!isTime(s.reminderTime)) return bad('Invalid reminder time.');
    user.settings.reminderTime = s.reminderTime;
  }
  if (s.upcomingDaysBefore !== undefined) user.settings.upcomingDaysBefore = Math.min(7, Math.max(1, parseInt(s.upcomingDaysBefore, 10) || 1));
  if (s.theme !== undefined && ['light', 'dark', 'system'].includes(s.theme)) user.settings.theme = s.theme;
  if (user.isGuest) await refreshGuestCookie(user);
  else await user.save();
  return json({ user: publicUser(user) });
});
