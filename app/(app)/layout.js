import BottomNav from '@/components/BottomNav';

export default function AppLayout({ children }) {
  return (
    <>
      <div className="pb-[calc(72px+env(safe-area-inset-bottom))]">{children}</div>
      <BottomNav />
    </>
  );
}