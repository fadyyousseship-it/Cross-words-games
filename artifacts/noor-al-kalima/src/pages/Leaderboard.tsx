import { Show } from '@clerk/react';
import { Link } from 'wouter';
import { Crown, LockKeyhole, Medal, RefreshCw, Sparkles, Trophy } from 'lucide-react';
import { getGetAdminAccessQueryKey, getGetLeaderboardQueryKey, useGetAdminAccess, useGetLeaderboard } from '@workspace/api-client-react';
import { GameShell } from '@/components/GameShell';
import { ErrorState, LoadingState, SignInPrompt } from '@/components/States';

function formatCompletionTime(value: string): string {
  return new Intl.DateTimeFormat('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(value));
}

function AdminOnlyNotice() {
  return <GameShell>
    <section className="mx-auto max-w-2xl rounded-[2rem] border border-border bg-card px-6 py-12 text-center shadow-sm">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-secondary text-primary"><LockKeyhole size={23}/></span>
      <h1 className="mt-5 font-serif text-3xl">لوحة المتصدرين للمسؤول فقط</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">لا تملك صلاحية عرض ترتيب المتسابقين.</p>
      <Link href="/" className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">العودة إلى رحلتي</Link>
    </section>
  </GameShell>;
}

function LeaderboardContent() {
  const admin = useGetAdminAccess({ query: { queryKey: getGetAdminAccessQueryKey(), retry: false } });
  const leaderboard = useGetLeaderboard({
    query: { queryKey: getGetLeaderboardQueryKey(), enabled: admin.data?.isAdmin === true, retry: false },
  });

  if (admin.isLoading) {
    return <GameShell><LoadingState label="نتحقق من صلاحية الدخول..."/></GameShell>;
  }
  if (admin.isError) {
    return <GameShell><ErrorState retry={() => void admin.refetch()}/></GameShell>;
  }
  if (!admin.data?.isAdmin) return <AdminOnlyNotice/>;
  if (leaderboard.isLoading) {
    return <GameShell><LoadingState label="نرتّب أوائل من أكملوا الرحلة..."/></GameShell>;
  }
  if (leaderboard.isError || !leaderboard.data) {
    return <GameShell><ErrorState retry={() => void leaderboard.refetch()}/></GameShell>;
  }

  const finishers = [...leaderboard.data].sort(
    (a, b) => Date.parse(a.completedAt) - Date.parse(b.completedAt) || a.rank - b.rank,
  );
  const podium = [finishers[1], finishers[0], finishers[2]].filter(Boolean);

  return <GameShell>
    <div className="page-enter">
      <section className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-8 text-primary-foreground sm:px-10 sm:py-10">
        <div className="absolute -left-10 -top-20 size-56 rounded-full border border-white/10"/>
        <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="flex items-center gap-2 text-sm text-white/70"><Sparkles size={15}/> لوحة إدارية</p>
            <h1 className="mt-2 font-serif text-4xl sm:text-5xl">أوائل من أكملوا الرحلة</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">يظهر هنا أول ثلاثة أنهوا المراحل العشر، مرتّبين حسب وقت إكمال المرحلة الأخيرة.</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm">
            <b className="text-2xl">{finishers.length.toLocaleString('ar-EG')}</b>
            <span className="mr-2 text-white/70">من أوائل ٣</span>
          </div>
        </div>
      </section>

      {finishers.length === 0
        ? <section className="mt-7 rounded-[2rem] border border-dashed border-border bg-card/70 px-6 py-16 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-secondary text-primary"><Trophy size={24}/></span>
            <h2 className="mt-4 font-serif text-2xl">لم يُكمل أحد المراحل العشر بعد</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">ستظهر هنا أسماء أول ثلاثة متسابقين بعد إتمام المرحلة الأخيرة.</p>
          </section>
        : <>
            <section className="mt-8 rounded-[2rem] border border-border bg-card p-5 shadow-sm sm:p-8">
              <div className="mb-7 flex items-center justify-between">
                <div><p className="text-sm font-bold text-accent">الترتيب حسب وقت الإكمال</p><h2 className="mt-1 font-serif text-2xl">أسرع المتسابقين</h2></div>
                <Crown className="text-accent"/>
              </div>
              <div className="mx-auto flex max-w-2xl items-end justify-center gap-2 sm:gap-5" dir="rtl">
                {podium.map((player) => {
                  const isTop = player.rank === 1;
                  const height = isTop ? 'h-48' : 'h-36';
                  const marker = isTop
                    ? <Crown size={21}/>
                    : player.rank === 2
                      ? <Medal size={19}/>
                      : <span className="text-xs font-bold">{player.rank.toLocaleString('ar-EG')}</span>;
                  return <div key={player.rank} className={`flex w-1/3 max-w-48 flex-col items-center ${isTop ? 'z-10' : ''}`} data-testid={`podium-player-${player.rank}`}>
                    <span className={`mb-2 grid size-12 place-items-center rounded-full border-2 bg-background font-bold ${isTop ? 'border-[#d4a54f] text-[#a87317]' : 'border-border text-primary'}`}>{player.displayName.trim().slice(0, 1)}</span>
                    <b className="max-w-full truncate text-sm">{player.displayName}</b>
                    <small className="mt-1 max-w-full px-1 text-center text-[10px] leading-4 text-muted-foreground">{formatCompletionTime(player.completedAt)}</small>
                    <div className={`mt-3 flex w-full flex-col items-center justify-center rounded-t-2xl ${height} ${isTop ? 'bg-[#e7c57e] text-[#51401e]' : 'bg-secondary text-primary'}`}>
                      <span className="mb-2">{marker}</span>
                      <b className="font-serif text-3xl">{player.rank.toLocaleString('ar-EG')}</b>
                      <small className="mt-1 text-[11px]">أكمل المراحل العشر</small>
                    </div>
                  </div>;
                })}
              </div>
            </section>

            <section className="mt-7 overflow-hidden rounded-[2rem] border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-5 sm:px-7">
                <div><p className="text-sm font-bold text-accent">أول ثلاثة متسابقين</p><h2 className="mt-1 font-serif text-2xl">سجل الإكمال</h2></div>
                <span className="text-xs text-muted-foreground">{finishers.length.toLocaleString('ar-EG')} من ٣</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-right">
                  <thead><tr className="bg-secondary/45 text-xs text-muted-foreground"><th className="px-5 py-3 font-semibold sm:px-7">المركز</th><th className="px-4 py-3 font-semibold">المتسابق</th><th className="px-5 py-3 font-semibold sm:px-7">وقت إكمال المراحل العشر</th></tr></thead>
                  <tbody>{finishers.map(player => <tr key={player.rank} className="border-t border-border/75 transition hover:bg-secondary/25" data-testid={`row-leaderboard-${player.rank}`}>
                    <td className="px-5 py-4 sm:px-7"><span className={`grid size-9 place-items-center rounded-xl text-sm font-bold ${player.rank === 1 ? 'bg-[#e7c57e] text-[#51401e]' : 'bg-secondary text-primary'}`}>{player.rank.toLocaleString('ar-EG')}</span></td>
                    <td className="px-4 py-4"><span className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">{player.displayName.trim().slice(0, 1)}</span><b className="text-sm">{player.displayName}</b></span></td>
                    <td className="px-5 py-4 text-sm font-semibold text-primary sm:px-7">{formatCompletionTime(player.completedAt)}</td>
                  </tr>)}</tbody>
                </table>
              </div>
            </section>
          </>}

      <div className="mt-5 flex justify-center">
        <button onClick={() => void leaderboard.refetch()} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-muted-foreground transition hover:text-foreground" data-testid="button-refresh-leaderboard"><RefreshCw size={15}/> تحديث الترتيب</button>
      </div>
    </div>
  </GameShell>;
}

export default function Leaderboard() {
  return <><Show when="signed-in"><LeaderboardContent/></Show><Show when="signed-out"><GameShell><SignInPrompt/></GameShell></Show></>;
}
