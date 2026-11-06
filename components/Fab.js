'use client';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function Fab() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-md justify-end px-5">
      <Link href="/ideas/new" aria-label="Add idea" className="pointer-events-auto grid h-14 w-14 place-items-center rounded-[20px] bg-brand-600 text-white shadow-fab transition active:scale-90 hover:bg-brand-700">
        <Plus className="h-7 w-7" strokeWidth={2.6} />
      </Link>
    </div>
  );
}
