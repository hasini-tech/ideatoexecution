'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Bell, Check, ChevronRight, Flame, Plus, Quote, Rocket, Zap } from 'lucide-react';
import { api, refreshAll, useIdeas, useNotifications, useNow, useStats, useTasks, useUser } from '@/lib/client';
import { useActions } from '@/lib/actions';
import { useUI } from '@/components/Providers';
import { QUOTES } from '@/lib/constants';
import { dayOfYear, formatDate, formatLong, greetingFor, relativeDue, ymd } from '@/lib/dates';
import GoalsCard from '@/components/GoalsCard';
import { PriorityBadge, Skeleton, StatusBadge, toneClass, cx } from '@/components/ui';

function Ring({ percent }) {
  const r = 38, c = 2 * Math.PI * r;
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="9" className="text-white/25" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" className="text-white transition-all duration-700"
          strokeDasharray={c} strokeDashoffset={c - (c * percent) / 100} />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-2xl font-extrabold">{percent}%</span>
    </div>
  );
}

const STATS = (c) => [
  { l: 'Total ideas', v: c.totalIdeas, href: '/ideas' },
  { l: 'Pending', v: c.pending, href: '/execution?tab=pending' },
  { l: 'In progress', v: c.inProgress, href: '/execution?tab=in_progress' },
  { l: 'Due today', v: c.dueToday, href: '/calendar', tone: c.dueToday ? 'warn' : '' },
  { l: 'Overdue', v: c.overdue, href: '/calendar', tone: c.overdue ? 'bad' : '' },
  { l: 'Completed', v: c.completed, href: '/execution?tab=completed' },
];

export default function DashboardPage() {
  const { user } = useUser();
  const { stats } = useStats();
  const { ideas } = useIdeas();
  const { tasks } = useTasks();
  const { unread } = useNotifications();
  const { today, hour, tz, ready } = useNow();
  const actions = useActions();
  const { toast } = useUI();
  const [quick, setQuick] = useState('');

  if (!ready) return <div className="space-y-3 p-4"><Skeleton className="h-16" /><Skeleton className="h-40" /></div>;

  const quote = QUOTES[dayOfYear(today) % QUOTES.length];
  const activeTasks = (tasks || []).filter((t) => t.status === 'pending' || t.status === 'in_progress');
  const todayTasks = activeTasks.filter((t) => (t.dueDate && t.dueDate <= today) || t.status === 'in_progress').sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
  const todayIdeas = (ideas || []).filter((i) => i.status === 'new' && i.dueDate && i.dueDate <= today);
  const doneToday = (tasks || []).filter((t) => t.status === 'completed' && t.completedAt && ymd(new Date(t.completedAt), tz) === today);
  const upcoming = [
    ...activeTasks.filter((t) => t.dueDate > today).map((t) => ({ kind: 'task', id: t._id, title: t.title, due: t.dueDate, priority: t.priority })),
    ...(ideas || []).filter((i) => i.status === 'new' && i.dueDate > today).map((i) => ({ kind: 'idea', id: i._id, title: i.title, due: i.dueDate, priority: i.priority })),
  ].sort((a, b) => a.due.localeCompare(b.due)).slice(0, 4);
  const recent = (ideas || []).filter((i) => i.status !== 'archived').slice(0, 3);

  async function quickAdd(e) {
    e.preventDefault();
    if (!quick.trim()) return;
    try {
      await api('/api/ideas', { method: 'POST', body: { title: quick.trim() } });
      setQuick(''); await refreshAll();
      toast('Idea captured 💡', { href: '/ideas', label: 'View' });
    } catch (err) { toast(err.message, { type: 'error' }); }
  }

  const percent = stats?.todayPercent ?? 0;
  const empty = todayTasks.length === 0 && todayIdeas.length === 0 && doneToday.length === 0;

  return (
    <>
      <header className="flex items-start justify-between px-5 pb-4 pt-[calc(env(safe-area-inset-top)+20px)]">
        <div>
          <p className="text-sm font-medium text-ink-soft dark:text-neutral-400">{formatLong(today)}</p>
          <h1 className="mt-0.5 text-[28px] font-extrabold leading-tight tracking-tight">{greetingFor(hour)},<br />{user?.name?.split(' ')[0]}</h1>
        </div>
        <Link href="/notifications" className="icon-btn relative border border-neutral-200 dark:border-white/10" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
          <Bell className="h-5 w-5" />
          {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>}
        </Link>
      </header>

      <div className="space-y-4 px-4">
        {/* today's progress */}
        <section className="rounded-[28px] bg-gradient-to-br from-brand-500 to-brand-800 p-5 text-white shadow-fab">
          <div className="flex items-center gap-5">
            <Ring percent={percent} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white/80">Today’s completion</p>
              <p className="mt-0.5 text-xl font-extrabold leading-snug">{stats ? `${stats.completedToday} done, ${todayTasks.length + todayIdeas.length} to go` : '…'}</p>
              {stats?.streak > 0 && <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold"><Flame className="h-4 w-4" />{stats.streak}-day streak</p>}
            </div>
          </div>
          <div className="mt-5 flex gap-2.5 rounded-2xl bg-black/15 p-3.5 text-sm leading-snug">
            <Quote className="mt-0.5 h-4 w-4 shrink-0 text-white/70" />
            <p><span className="font-medium">{quote.q}</span> <span className="text-white/70">— {quote.a}</span></p>
          </div>
        </section>

        {/* quick capture */}
        <form onSubmit={quickAdd} className="flex gap-2">
          <input className="input" placeholder="Capture an idea…" value={quick} onChange={(e) => setQuick(e.target.value)} maxLength={200} />
          <button className="btn-primary !px-4" aria-label="Save idea" disabled={!quick.trim()}><Plus className="h-5 w-5" /></button>
        </form>
        <Link href="/ideas/new" className="btn-soft w-full !min-h-[48px]"><Plus className="h-5 w-5" />Add idea with details</Link>

        {/* stats */}
        <section className="grid grid-cols-3 gap-2.5">
          {stats ? STATS(stats.counts).map((s) => (
            <Link key={s.l} href={s.href} className="card px-3 py-3.5 text-center transition active:scale-95">
              <p className={cx('text-2xl font-extrabold', s.tone === 'bad' ? 'text-red-600 dark:text-red-400' : s.tone === 'warn' ? 'text-amber-600 dark:text-amber-400' : '')}>{s.v}</p>
              <p className="mt-0.5 text-xs font-medium text-ink-soft dark:text-neutral-400">{s.l}</p>
            </Link>
          )) : Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-[78px]" />)}
        </section>

        {/* today's execution list */}
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="section-title">Today’s execution</h2>
            <Link href="/execution" className="text-sm font-semibold text-brand-700 dark:text-brand-300">See all</Link>
          </div>
          <div className="card divide-y divide-neutral-100 dark:divide-white/5">
            {empty && (
              <div className="p-6 text-center"><Zap className="mx-auto h-7 w-7 text-brand-500" /><p className="mt-2 font-semibold">Nothing due today</p><p className="text-sm text-ink-soft dark:text-neutral-400">Pick an idea and move it to Execution.</p></div>
            )}
            {todayTasks.map((t) => {
              const d = relativeDue(t.dueDate, today);
              return (
                <div key={t._id} className="flex items-center gap-3 px-4 py-3">
                  <button onClick={() => actions.completeTask(t)} className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-neutral-300 text-transparent transition hover:border-brand-500 hover:text-brand-500 active:scale-90 dark:border-white/20" aria-label={`Mark ${t.title} as completed`}><Check className="h-4 w-4" strokeWidth={3} /></button>
                  <Link href={`/execution/${t._id}`} className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{t.title}</p>
                    <p className={`text-xs font-medium ${toneClass(d.tone)}`}>{t.status === 'in_progress' && !(t.dueDate && t.dueDate <= today) ? `In progress · ${t.progress}%` : d.text}</p>
                  </Link>
                  <PriorityBadge priority={t.priority} />
                </div>
              );
            })}
            {todayIdeas.map((i) => (
              <div key={i._id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1"><p className="truncate font-semibold">{i.title}</p><p className={`text-xs font-medium ${toneClass(relativeDue(i.dueDate, today).tone)}`}>{relativeDue(i.dueDate, today).text} · not started</p></div>
                <button className="btn-soft !min-h-[36px] !px-3 text-sm" onClick={() => actions.executeIdea(i)}><Rocket className="h-4 w-4" />Execute</button>
              </div>
            ))}
            {doneToday.map((t) => (
              <div key={t._id} className="flex items-center gap-3 px-4 py-3 opacity-60">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-600 text-white"><Check className="h-4 w-4" strokeWidth={3} /></span>
                <p className="min-w-0 flex-1 truncate font-semibold line-through">{t.title}</p>
              </div>
            ))}
          </div>
        </section>

        <GoalsCard date={today} />

        {/* upcoming deadlines */}
        {upcoming.length > 0 && (
          <section>
            <h2 className="section-title mb-2 px-1">Upcoming deadlines</h2>
            <div className="card divide-y divide-neutral-100 dark:divide-white/5">
              {upcoming.map((u) => (
                <Link key={u.kind + u.id} href={u.kind === 'task' ? `/execution/${u.id}` : `/ideas/${u.id}`} className="flex items-center gap-3 px-4 py-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                    <span className="text-center text-[11px] font-bold leading-tight">{formatDate(u.due).split(' ')[1]}<br /><span className="text-base">{formatDate(u.due).split(' ')[0]}</span></span>
                  </div>
                  <div className="min-w-0 flex-1"><p className="truncate font-semibold">{u.title}</p><p className="text-xs text-ink-soft dark:text-neutral-400">{relativeDue(u.due, today).text}</p></div>
                  <ChevronRight className="h-5 w-5 text-ink-mute" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* recent ideas */}
        {recent.length > 0 && (
          <section>
            <div className="mb-2 flex items-center justify-between px-1"><h2 className="section-title">Recently added</h2><Link href="/ideas" className="text-sm font-semibold text-brand-700 dark:text-brand-300">All ideas</Link></div>
            <div className="space-y-2.5">
              {recent.map((i) => (
                <Link key={i._id} href={`/ideas/${i._id}`} className="card flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1"><p className="truncate font-bold">{i.title}</p><p className="mt-0.5 text-xs text-ink-soft dark:text-neutral-400">Added {formatDate(ymd(new Date(i.createdAt), tz))}</p></div>
                  <StatusBadge status={i.status} />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
