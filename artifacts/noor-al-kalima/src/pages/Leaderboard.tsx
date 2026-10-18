import { Show } from '@clerk/react';
import { Link } from 'wouter';
import { Crown, Medal, RefreshCw, Sparkles, Trophy } from 'lucide-react';
import { useGetLeaderboard } from '@workspace/api-client-react';
import { GameShell } from '@/components/GameShell';
import { ErrorState, LoadingState, SignInPrompt } from '@/components/States';

function LeaderboardContent() {
  const { data: entries, isLoading, isError, refetch } = useGetLeaderboard();
  if (isLoading) return <GameShell><LoadingState label="نرتّب أصحاب الرحلة..."/></GameShell>;
  if (isError || !entries) return <GameShell><ErrorState retry={() => void refetch()}/></GameShell>;
  const sorted = [...entries].sort((a,b)=>a.rank-b.rank);
  const firstThree = sorted.slice(0,3);
  const podium = [firstThree[1], firstThree[0], firstThree[2]].filter(Boolean);
  return <GameShell><div className="page-enter">
    <section className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-8 text-primary-foreground sm:px-10 sm:py-10"><div className="absolute -left-10 -top-20 size-56 rounded-full border border-white/10"/><div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="flex items-center gap-2 text-sm text-white/70"><Sparkles size={15}/> رحلة فردية، أثر مشترك</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">أصحاب الكلمة</h1><p className="mt-3 max-w-xl text-sm leading-6 text-white/75">كل نقطة تروي خطوة في الرحلة. واصل حل المراحل لترى اسمك بين المتقدمين.</p></div><div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm"><b className="text-2xl">{sorted.length.toLocaleString('ar-EG')}</b><span className="mr-2 text-white/70">لاعباً في الترتيب</span></div></div></section>
    {sorted.length===0?<section className="mt-7 rounded-[2rem] border border-dashed border-border bg-card/70 px-6 py-16 text-center"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-secondary text-primary"><Trophy size={24}/></span><h2 className="mt-4 font-serif text-2xl">الطريق ما زال مفتوحاً</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">لم يظهر لاعب في لوحة الترتيب بعد. ابدأ رحلتك، وستكون من أوائل الأسماء هنا.</p><Link href="/" className="mt-5 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground" data-testid="link-start-from-leaderboard">ابدأ المرحلة الأولى</Link></section>:<>
      <section className="mt-8 rounded-[2rem] border border-border bg-card p-5 shadow-sm sm:p-8">
        <div className="mb-7 flex items-center justify-between"><div><p className="text-sm font-bold text-accent">المراكز الأولى</p><h2 className="mt-1 font-serif text-2xl">على درب الاكتشاف</h2></div><Crown className="text-accent"/></div>
        <div className="mx-auto flex max-w-2xl items-end justify-center gap-2 sm:gap-5" dir="rtl">
          {podium.map((player,index)=>{
            const isTop=player.rank===1;
            const height=isTop?'h-48':'h-36';
            const marker=isTop?<Crown size={21}/>:player.rank===2?<Medal size={19}/>:<span className="text-xs font-bold">{player.rank.toLocaleString('ar-EG')}</span>;
            return <div key={player.rank} className={`flex w-1/3 max-w-48 flex-col items-center ${isTop?'z-10':''}`} data-testid={`podium-player-${player.rank}`}>
              <span className={`mb-2 grid size-12 place-items-center rounded-full border-2 bg-background font-bold ${isTop?'border-[#d4a54f] text-[#a87317]':'border-border text-primary'}`}>{player.displayName.trim().slice(0,1)}</span>
              <b className="max-w-full truncate text-sm">{player.displayName}</b><small className="mt-1 text-xs text-muted-foreground">{player.score.toLocaleString('ar-EG')} نقطة</small>
              <div className={`mt-3 flex w-full flex-col items-center justify-center rounded-t-2xl ${height} ${isTop?'bg-[#e7c57e] text-[#51401e]':'bg-secondary text-primary'}`}><span className="mb-2">{marker}</span><b className="font-serif text-3xl">{player.rank.toLocaleString('ar-EG')}</b><small className="mt-1 text-[11px]">{player.completedStages.toLocaleString('ar-EG')} مراحل</small></div>
            </div>;
          })}
        </div>
      </section>
      <section className="mt-7 overflow-hidden rounded-[2rem] border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-5 sm:px-7"><div><p className="text-sm font-bold text-accent">الترتيب الكامل</p><h2 className="mt-1 font-serif text-2xl">كل اللاعبين</h2></div><span className="text-xs text-muted-foreground">{sorted.length.toLocaleString('ar-EG')} لاعب</span></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[540px] text-right"><thead><tr className="bg-secondary/45 text-xs text-muted-foreground"><th className="px-5 py-3 font-semibold sm:px-7">المركز</th><th className="px-4 py-3 font-semibold">الاسم</th><th className="px-4 py-3 font-semibold">المراحل المكتملة</th><th className="px-5 py-3 font-semibold sm:px-7">النقاط</th></tr></thead><tbody>{sorted.map(player=><tr key={player.rank} className="border-t border-border/75 transition hover:bg-secondary/25" data-testid={`row-leaderboard-${player.rank}`}><td className="px-5 py-4 sm:px-7"><span className={`grid size-9 place-items-center rounded-xl text-sm font-bold ${player.rank===1?'bg-[#e7c57e] text-[#51401e]':'bg-secondary text-primary'}`}>{player.rank.toLocaleString('ar-EG')}</span></td><td className="px-4 py-4"><span className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">{player.displayName.trim().slice(0,1)}</span><b className="text-sm">{player.displayName}</b></span></td><td className="px-4 py-4 text-sm text-muted-foreground">{player.completedStages.toLocaleString('ar-EG')} من ١٠</td><td className="px-5 py-4 text-sm font-bold text-primary sm:px-7">{player.score.toLocaleString('ar-EG')}</td></tr>)}</tbody></table></div>
      </section>
    </>}
    <div className="mt-5 flex justify-center"><button onClick={()=>void refetch()} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-muted-foreground transition hover:text-foreground" data-testid="button-refresh-leaderboard"><RefreshCw size={15}/> تحديث الترتيب</button></div>
  </div></GameShell>;
}

export default function Leaderboard() {
  return <><Show when="signed-in"><LeaderboardContent/></Show><Show when="signed-out"><GameShell><SignInPrompt/></GameShell></Show></>;
}
