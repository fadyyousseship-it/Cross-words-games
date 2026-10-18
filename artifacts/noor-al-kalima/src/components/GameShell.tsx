import { Link } from 'wouter';
import { BookOpen, ChevronLeft, Crown, LogOut } from 'lucide-react';
import { useClerk, useUser } from '@clerk/react';

export function GameShell({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  return (
    <div className="min-h-[100dvh]">
      <header className="sticky top-0 z-20 border-b border-[hsl(var(--border)/.75)] bg-[hsl(var(--background)/.92)] backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3" data-testid="link-home">
            <span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm"><BookOpen size={21}/></span>
            <span><b className="block font-serif text-[22px] leading-none">نور الكلمة</b><small className="mt-1 block text-[10px] tracking-[.14em] text-muted-foreground">رحلة في الكتاب المقدس</small></span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2" aria-label="التنقل الرئيسي">
            <Link href="/" className="rounded-full px-3 py-2 text-sm font-semibold text-foreground hover:bg-secondary" data-testid="link-dashboard">رحلتي</Link>
            <Link href="/leaderboard" className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-foreground hover:bg-secondary" data-testid="link-leaderboard"><Crown size={16}/> <span className="hidden sm:inline">لوحة المتصدرين</span><span className="sm:hidden">الترتيب</span></Link>
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden max-w-28 truncate text-sm text-muted-foreground sm:block">{user?.firstName || 'لاعب'}</span>
            <button onClick={() => signOut({ redirectUrl: import.meta.env.BASE_URL })} className="grid size-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground" aria-label="تسجيل الخروج" data-testid="button-sign-out"><LogOut size={17}/></button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-7 sm:px-8 sm:pt-10">{children}</main>
      <footer className="mx-auto flex max-w-6xl items-center justify-between border-t border-border px-4 py-7 text-xs text-muted-foreground sm:px-8">
        <span>كلمة تنير الطريق</span><span className="flex items-center gap-1">إلى لوحة الرحلة <ChevronLeft size={13}/></span>
      </footer>
    </div>
  );
}
