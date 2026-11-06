import { CheckCircle2, Lightbulb, Rocket } from 'lucide-react';

export const metadata = {
  title: 'Idea to Execution',
  description: 'Capture ideas, plan your next steps, and get work done.',
};

export default function LandingPage() {
  return (
    <main className="flex min-h-[100dvh] flex-col px-6 pb-10 pt-[calc(env(safe-area-inset-top)+48px)]">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white shadow-sm">
        <Lightbulb className="h-7 w-7" />
      </div>
      <h1 className="mt-8 text-3xl font-extrabold leading-tight tracking-tight">
        Turn your ideas into finished work.
      </h1>
      <p className="mt-3 text-base leading-relaxed text-ink-soft dark:text-neutral-400">
        Capture what matters, break it into manageable steps, and keep moving
        toward your goals.
      </p>

      <ul className="mt-8 space-y-4 text-sm font-medium text-ink-soft dark:text-neutral-300">
        <li className="flex items-center gap-3">
          <Lightbulb className="h-5 w-5 shrink-0 text-brand-600" />
          Capture and prioritize your ideas
        </li>
        <li className="flex items-center gap-3">
          <Rocket className="h-5 w-5 shrink-0 text-brand-600" />
          Turn plans into clear next steps
        </li>
        <li className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-600" />
          Track progress and build momentum
        </li>
      </ul>
    </main>
  );
}
