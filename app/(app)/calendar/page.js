'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIdeas, useNow, useTasks } from '@/lib/client';
import { formatLong, monthLabel, ymd } from '@/lib/dates';
import { Header, ListSkeleton, cx } from '@/components/ui';

const TYPES = {
  created: { label: 'Idea created', dot: 'bg-sky-500', text: 'text-sky-700 dark:text-sky-300' },
  due: { label: 'Due', dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300' },
  overdue: { label: 'Overdue', dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
  started: { label: 'Execution started', dot: 'bg-violet-500', text: 'text-violet-700 dark:text-violet-300' },
  completed: { label: 'Completed', dot: 'bg-brand-600', text: 'text-brand-700 dark:text-brand-300' },
};
const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarPage() {
  const { ideas } = useIdeas();
  const { tasks } = useTasks();
  const { today, tz, ready } = useNow();
  const [month, setMonth] = useState(null); // 'YYYY-MM'
  const [selected, setSelected] = useState(null);
  useEffect(() => { if (ready && !month) { setMonth(today.slice(0, 7)); setSelected(today); } }, [ready, today, month]);

  const events = useMemo(() => {
    const map = {};
    const add = (date, type, title, href) => { if (!date) return; (map[date] ||= []).push({ type, title, href }); };
    (ideas || []).forEach((i) => {
      add(ymd(new Date(i.createdAt), tz), 'created', i.title, `/ideas/${i._id}`);
      if (i.status === 'new' && i.dueDate) add(i.dueDate, i.dueDate < today ? 'overdue' : 'due', i.title, `/ideas/${i._id}`);
    });
    (tasks || []).forEach((t) => {
      const href = `/execution/${t._id}`;
      if (t.startedAt) add(ymd(new Date(t.startedAt), tz), 'started', t.title, href);
      if (t.status === 'completed' && t.completedAt) add(ymd(new Date(t.completedAt), tz), 'completed', t.title, href);
      if (t.status !== 'completed' && t.dueDate) add(t.dueDate, t.status !== 'on_hold' && t.dueDate < today ? 'overdue' : 'due', t.title, href);
    });
    return map;
  }, [ideas, tasks, tz, today]);

  if (!month || !ideas || !tasks) return <><Header title="Calendar" /><ListSkeleton n={2} h="h-64" /></>;

  const [y, m] = month.split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells = [...Array(first.getUTCDay()).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`)];
  const shift = (n) => setMonth(new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 7));
  const dayEvents = events[selected] || [];

  return (
    <>
      <Header title="Calendar" right={<button className="btn-soft !min-h-[40px] !px-4 text-sm" onClick={() => { setMonth(today.slice(0, 7)); setSelected(today); }}>Today</button>} />
      <div className="space-y-4 px-4">
        <section className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <button className="icon-btn" onClick={() => shift(-1)} aria-label="Previous month"><ChevronLeft className="h-5 w-5" /></button>
            <h2 className="text-lg font-bold">{monthLabel(month)}</h2>
            <button className="icon-btn" onClick={() => shift(1)} aria-label="Next month"><ChevronRight className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-ink-mute">{DOW.map((d, i) => <span key={i} className="py-1.5">{d}</span>)}</div>
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((d, i) => {
              if (!d) return <span key={i} />;
              const types = [...new Set((events[d] || []).map((e) => e.type))];
              const isSel = d === selected, isToday = d === today;
              return (
                <button key={d} onClick={() => setSelected(d)} aria-label={formatLong(d)} aria-pressed={isSel}
                  className={cx('mx-auto flex h-12 w-11 flex-col items-center justify-center rounded-2xl text-[15px] font-semibold transition active:scale-90',
                    isSel ? 'bg-brand-600 text-white' : isToday ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300' : '')}>
                  {Number(d.slice(8))}
                  <span className="mt-0.5 flex h-1.5 gap-0.5">
                    {types.slice(0, 4).map((t) => <i key={t} className={cx('h-1.5 w-1.5 rounded-full', isSel ? 'bg-white' : TYPES[t].dot)} />)}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-neutral-100 pt-3 text-xs text-ink-soft dark:border-white/5 dark:text-neutral-400">
            {Object.values(TYPES).map((t) => <span key={t.label} className="flex items-center gap-1.5"><i className={cx('h-2 w-2 rounded-full', t.dot)} />{t.label}</span>)}
          </div>
        </section>

        <section>
          <h2 className="section-title mb-2 px-1">{formatLong(selected)}</h2>
          {dayEvents.length === 0 ? (
            <p className="card p-5 text-center text-sm text-ink-soft dark:text-neutral-400">Nothing scheduled for this day.</p>
          ) : (
            <div className="card divide-y divide-neutral-100 dark:divide-white/5">
              {dayEvents.map((e, i) => (
                <Link key={i} href={e.href} className="flex items-center gap-3 px-4 py-3.5">
                  <i className={cx('h-2.5 w-2.5 shrink-0 rounded-full', TYPES[e.type].dot)} />
                  <div className="min-w-0 flex-1"><p className="truncate font-semibold">{e.title}</p><p className={cx('text-xs font-semibold', TYPES[e.type].text)}>{TYPES[e.type].label}</p></div>
                  <ChevronRight className="h-5 w-5 text-ink-mute" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
