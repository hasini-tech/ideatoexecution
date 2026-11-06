'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarPlus, Rocket } from 'lucide-react';
import { api, refreshAll, useNow, useUser } from '@/lib/client';
import { CATEGORIES } from '@/lib/constants';
import { addDays, formatDate } from '@/lib/dates';
import { useUI } from './Providers';
import { Header, Segmented, Toggle, cx } from './ui';

export default function IdeaForm({ initial, id }) {
  const router = useRouter();
  const { toast } = useUI();
  const { today, ready } = useNow();
  const { user } = useUser();
  const editing = !!id;
  const [f, setF] = useState({
    title: initial?.title || '', description: initial?.description || '', dueDate: initial?.dueDate || '',
    priority: initial?.priority || 'medium', category: initial?.category || 'General',
    reminder: initial?.reminder ?? true, reminderTime: initial?.reminderTime || '',
  });
  const [custom, setCustom] = useState(initial?.category && !CATEGORIES.includes(initial.category) ? initial.category : '');
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  async function save(thenExecute = false) {
    if (!f.title.trim()) return toast('Please enter a title for your idea.', { type: 'error' });
    setBusy(true);
    try {
      const body = { ...f, category: custom.trim() || f.category };
      const { idea } = await api(editing ? `/api/ideas/${id}` : '/api/ideas', { method: editing ? 'PATCH' : 'POST', body });
      if (thenExecute) await api(`/api/ideas/${idea._id}/execute`, { method: 'POST' });
      await refreshAll();
      toast(editing ? 'Changes saved' : thenExecute ? 'Idea saved and moved to Execution 🚀' : 'Idea saved 💡');
      router.replace(thenExecute ? '/execution' : editing ? `/ideas/${id}` : '/ideas');
    } catch (e) {
      toast(e.message, { type: 'error' });
      setBusy(false);
    }
  }

  const quick = ready ? [['Today', today], ['Tomorrow', addDays(today, 1)], ['Next week', addDays(today, 7)]] : [];

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Header title={editing ? 'Edit idea' : 'New idea'} back />
      <div className="flex-1 space-y-5 px-4 pb-8 pt-2">
        <div>
          <label className="label" htmlFor="title">Idea title</label>
          <input id="title" className="input !text-lg !font-semibold" autoFocus={!editing} maxLength={200} placeholder="What’s the idea?" value={f.title} onChange={(e) => set('title', e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="desc">Description</label>
          <textarea id="desc" className="input min-h-[110px] resize-none" maxLength={3000} placeholder="Add details, links, or the first step…" value={f.description} onChange={(e) => set('description', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="label">Created</span>
            <div className="flex min-h-[48px] items-center gap-2 rounded-2xl bg-neutral-50 px-4 text-[15px] font-medium text-ink-soft dark:bg-white/5 dark:text-neutral-300">
              <CalendarPlus className="h-4 w-4" />{editing ? 'Saved' : ready ? formatDate(today) : '…'}
            </div>
          </div>
          <div>
            <label className="label" htmlFor="due">Due date</label>
            <input id="due" type="date" className="input !py-2.5" min={editing ? undefined : today || undefined} value={f.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
          </div>
        </div>
        <div className="-mt-2 flex gap-2 overflow-x-auto no-scrollbar">
          {quick.map(([label, d]) => <button key={label} type="button" onClick={() => set('dueDate', d)} className={cx('chip', f.dueDate === d && 'chip-on')}>{label}</button>)}
          {f.dueDate && <button type="button" onClick={() => set('dueDate', '')} className="chip">Clear</button>}
        </div>

        <div>
          <span className="label">Priority</span>
          <Segmented value={f.priority} onChange={(v) => set('priority', v)} options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }]} />
        </div>

        <div>
          <span className="label">Category</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => <button key={c} type="button" onClick={() => { set('category', c); setCustom(''); }} className={cx('chip', !custom && f.category === c && 'chip-on')}>{c}</button>)}
          </div>
          <input className="input mt-3" placeholder="Or type your own category" maxLength={40} value={custom} onChange={(e) => setCustom(e.target.value)} />
        </div>

        <div className="card space-y-3 p-4">
          <Toggle checked={f.reminder} onChange={(v) => set('reminder', v)} label="Remind me" hint="Get notified when it’s due or overdue" />
          {f.reminder && (
            <div className="flex items-center justify-between gap-4 border-t border-neutral-100 pt-3 dark:border-white/5">
              <label htmlFor="rt" className="text-sm font-semibold text-ink-soft dark:text-neutral-300">Reminder time</label>
              <input id="rt" type="time" className="input !w-auto !py-2" value={f.reminderTime || user?.settings?.reminderTime || '09:00'} onChange={(e) => set('reminderTime', e.target.value)} />
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 space-y-2 border-t border-neutral-100 bg-white/90 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 backdrop-blur-xl dark:border-white/5 dark:bg-[#0b1410]/90">
        <button className="btn-primary w-full !min-h-[52px] text-base" disabled={busy} onClick={() => save(false)}>{editing ? 'Save changes' : 'Save idea'}</button>
        {!editing && <button className="btn-soft w-full" disabled={busy} onClick={() => save(true)}><Rocket className="h-4 w-4" />Save and move to Execution</button>}
      </div>
    </div>
  );
}
