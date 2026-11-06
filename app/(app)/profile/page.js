'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import { BarChart3, Bell, ChevronRight, Download, Flame, LogOut, Pencil, Smartphone, Trophy } from 'lucide-react';
import { api, useNotifications, useStats, useUser } from '@/lib/client';
import { useTheme, useUI } from '@/components/Providers';
import PushSettings from '@/components/PushSettings';
import { Header, Segmented, Sheet, Toggle } from '@/components/ui';

export default function ProfilePage() {
  const router = useRouter();
  const { user, mutate: mutateUser } = useUser();
  const { stats } = useStats();
  const { unread } = useNotifications();
  const { theme, setTheme } = useTheme();
  const { toast, confirm } = useUI();
  const [nameSheet, setNameSheet] = useState(false);
  const [name, setName] = useState('');
  const [installEvt, setInstallEvt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setInstalled(window.matchMedia('(display-mode: standalone)').matches);
    const on = (e) => { e.preventDefault(); setInstallEvt(e); };
    window.addEventListener('beforeinstallprompt', on);
    window.addEventListener('appinstalled', () => { setInstalled(true); setInstallEvt(null); });
    return () => window.removeEventListener('beforeinstallprompt', on);
  }, []);
  if (!user) return null;
  const s = user.settings;

  async function saveSettings(patch) {
    try {
      const res = await api('/api/auth/me', { method: 'PATCH', body: { settings: patch } });
      mutateUser(res, false);
    } catch (e) { toast(e.message, { type: 'error' }); }
  }
  async function saveName(e) {
    e.preventDefault();
    try { const res = await api('/api/auth/me', { method: 'PATCH', body: { name } }); mutateUser(res, false); setNameSheet(false); toast('Name updated'); }
    catch (err) { toast(err.message, { type: 'error' }); }
  }
  async function install() {
    if (!installEvt) return;
    installEvt.prompt();
    await installEvt.userChoice;
    setInstallEvt(null);
  }
  async function logout() {
    if (!(await confirm({ title: 'Sign out?', message: 'You’ll need to sign in again on this device.', confirmText: 'Sign out' }))) return;
    await api('/api/auth/logout', { method: 'POST' });
    await mutate(() => true, undefined, { revalidate: false });
    router.replace('/');
    router.refresh();
  }

  return (
    <>
      <Header title="Profile" />
      <div className="space-y-4 px-4">
        {user.isGuest && (
          <section className="card p-4 text-sm text-ink-soft dark:text-neutral-300">
            You’re using a guest session. Your data is saved separately in this browser.
          </section>
        )}
        <section className="card flex items-center gap-4 p-5">
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-brand-400 to-brand-700 text-2xl font-extrabold text-white">{user.name[0]?.toUpperCase()}</div>
          <div className="min-w-0 flex-1"><p className="truncate text-lg font-extrabold">{user.name}</p><p className="truncate text-sm text-ink-soft dark:text-neutral-400">{user.email}</p></div>
          <button className="icon-btn border border-neutral-200 dark:border-white/10" onClick={() => { setName(user.name); setNameSheet(true); }} aria-label="Edit name"><Pencil className="h-4 w-4" /></button>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4"><Flame className="h-5 w-5 text-brand-600" /><p className="mt-2 text-2xl font-extrabold">{stats?.streak ?? 0}</p><p className="text-xs text-ink-soft dark:text-neutral-400">Day streak</p></div>
          <div className="card p-4"><Trophy className="h-5 w-5 text-brand-600" /><p className="mt-2 text-2xl font-extrabold">{stats?.counts.completed ?? 0}</p><p className="text-xs text-ink-soft dark:text-neutral-400">Ideas executed</p></div>
        </div>

        <section className="card divide-y divide-neutral-100 dark:divide-white/5">
          <Link href="/insights" className="flex items-center gap-3 p-4"><BarChart3 className="h-5 w-5 text-brand-600" /><span className="flex-1 font-semibold">Weekly & monthly insights</span><ChevronRight className="h-5 w-5 text-ink-mute" /></Link>
          <Link href="/notifications" className="flex items-center gap-3 p-4"><Bell className="h-5 w-5 text-brand-600" /><span className="flex-1 font-semibold">Notification history</span>{unread > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">{unread}</span>}<ChevronRight className="h-5 w-5 text-ink-mute" /></Link>
          <Link href="/ideas?status=archived" className="flex items-center gap-3 p-4"><Trophy className="h-5 w-5 text-brand-600" /><span className="flex-1 font-semibold">Archived ideas</span><ChevronRight className="h-5 w-5 text-ink-mute" /></Link>
        </section>

        <section className="card space-y-4 p-5">
          <h2 className="section-title">Reminders</h2>
          <Toggle checked={s.remindersEnabled} onChange={(v) => saveSettings({ remindersEnabled: v })} label="Enable reminders" hint="Due today and overdue alerts" />
          {s.remindersEnabled && (
            <>
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="rt" className="text-[15px] font-semibold">Default reminder time</label>
                <input id="rt" type="time" className="input !w-auto !py-2" value={s.reminderTime} onChange={(e) => e.target.value && saveSettings({ reminderTime: e.target.value })} />
              </div>
              <Toggle checked={s.remindUpcoming} onChange={(v) => saveSettings({ remindUpcoming: v })} label="Upcoming reminders" hint="A heads-up before the due date" />
              {s.remindUpcoming && (
                <div><span className="label">Heads-up</span>
                  <Segmented value={String(s.upcomingDaysBefore)} onChange={(v) => saveSettings({ upcomingDaysBefore: +v })} options={[{ value: '1', label: '1 day' }, { value: '2', label: '2 days' }, { value: '3', label: '3 days' }]} /></div>
              )}
              <div className="border-t border-neutral-100 pt-4 dark:border-white/5"><PushSettings /></div>
            </>
          )}
        </section>

        <section className="card space-y-3 p-5">
          <h2 className="section-title">Appearance</h2>
          <Segmented value={theme} onChange={(t) => { setTheme(t); saveSettings({ theme: t }); }} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'system', label: 'System' }]} />
        </section>

        <section className="card p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15"><Smartphone className="h-5 w-5" /></span>
            <div className="flex-1">
              <p className="font-semibold">{installed ? 'App installed' : 'Install the app'}</p>
              <p className="text-sm text-ink-soft dark:text-neutral-400">{installed ? 'You’re using Idea to Execution as an installed app.' : installEvt ? 'Add it to your home screen for a full-screen, app-like experience.' : 'In Chrome, open the ⋮ menu and choose “Install app” or “Add to Home screen”.'}</p>
            </div>
          </div>
          {installEvt && <button className="btn-primary mt-3 w-full" onClick={install}><Download className="h-4 w-4" />Install app</button>}
        </section>

        {!user.isGuest && <button className="btn-danger w-full" onClick={logout}><LogOut className="h-4 w-4" />Sign out</button>}
      </div>

      <Sheet open={nameSheet} onClose={() => setNameSheet(false)} title="Edit name">
        <form onSubmit={saveName} className="space-y-4"><input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoFocus /><button className="btn-primary w-full" disabled={!name.trim()}>Save</button></form>
      </Sheet>
    </>
  );
}
