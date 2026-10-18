import { useState } from 'react';
import { Link } from 'wouter';
import { Show, useClerk } from '@clerk/react';
import { ArrowLeft, ArrowUpLeft, BookOpen, Check, Compass, LockKeyhole, Sparkles } from 'lucide-react';
import { useGetGameDashboard, getGetGameDashboardQueryKey, useSavePlayerProfile } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { GameShell } from '@/components/GameShell';
import { ErrorState, LoadingState } from '@/components/States';

function PublicLanding() {
  const { openSignIn, openSignUp } = useClerk();
  return <div className="grain min-h-[100dvh] overflow-hidden">
    <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
      <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground"><BookOpen size={20}/></span><span className="font-serif text-2xl">نور الكلمة</span></div>
      <div className="flex items-center gap-2"><button onClick={() => openSignIn()} className="rounded-full px-4 py-2.5 text-sm font-semibold hover:bg-secondary" data-testid="button-open-sign-in">دخول</button><button onClick={() => openSignUp()} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5" data-testid="button-open-sign-up">ابدأ اللعب</button></div>
    </header>
    <main>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-8 sm:px-8 md:grid-cols-[1fr_.92fr] md:pb-24 md:pt-16">
        <div className="page-enter">
          <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary)/.18)] bg-card/80 px-4 py-2 text-sm font-semibold text-primary"><Sparkles size={15}/> لعبة كلمات من الكتاب المقدس</span>
          <h1 className="mt-6 max-w-[600px] font-serif text-[3.25rem] leading-[1.18] tracking-tight sm:text-6xl md:text-[4.5rem]">اكتشف الكلمة،<br/><span className="text-primary">واقترب من الحكاية.</span></h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">عشر مراحل قصيرة تأخذك في جولة بين شخصيات الكتاب ومعانيه. حلّ الألغاز، واجمع الحروف، واكشف كلمة السر.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3"><button onClick={() => openSignUp()} className="inline-flex items-center gap-3 rounded-full bg-primary px-7 py-4 font-bold text-primary-foreground shadow-md transition hover:-translate-y-1" data-testid="button-start-journey">ابدأ رحلتك <ArrowLeft size={18}/></button><span className="text-sm text-muted-foreground">مجانية، ومرحلة واحدة في كل مرة.</span></div>
          <div className="mt-10 flex items-center gap-5 border-t border-border pt-5 text-sm text-muted-foreground"><span className="flex items-center gap-2"><Check size={16} className="text-primary"/> ألغاز عربية</span><span className="flex items-center gap-2"><Check size={16} className="text-primary"/> تقدّم محفوظ</span><span className="hidden items-center gap-2 sm:flex"><Check size={16} className="text-primary"/> تحدٍ بين الأصدقاء</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-[480px] page-enter">
          <div className="absolute -left-3 top-8 size-24 rounded-full border border-accent/30 sm:-left-8 sm:size-32"/>
          <div className="relative rounded-[2.6rem] border border-white/70 bg-card p-5 shadow-xl sm:p-7">
            <div className="flex items-center justify-between"><div><span className="text-xs font-semibold text-accent">المرحلة الأولى</span><h2 className="mt-1 font-serif text-2xl">بداية النور</h2></div><span className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary"><Compass size={23}/></span></div>
            <div className="mt-6 grid aspect-square grid-cols-6 grid-rows-6 gap-1.5 rounded-2xl bg-[hsl(195_31%_18%)] p-3 sm:gap-2 sm:p-4" dir="ltr" aria-label="نموذج كلمات متقاطعة">
              {Array.from({length:36},(_,i)=>{const active=[2,3,4,8,10,14,15,16,20,22,26,27,28,32,33].includes(i);return <div key={i} className={`relative grid place-items-center rounded-md ${active?'bg-[#f7f0df]':'bg-transparent'}`}>{active&&[2,3,4,10,16,22,28,33].includes(i)&&<span className="text-[11px] font-bold text-primary">{['ن','و','ر','ك','ل','م','ة',''][[2,3,4,10,16,22,28,33].indexOf(i)]}</span>}</div>})}
            </div>
            <div className="mt-5 flex items-center justify-between rounded-2xl bg-secondary/70 px-4 py-3"><span className="text-sm text-muted-foreground">كلمة السر تنتظرك</span><div className="flex gap-1.5" dir="ltr">{[0,1,2,3].map(n=><span key={n} className="grid size-8 place-items-center rounded-lg border border-border bg-card text-sm text-primary">{n===0?'ن':''}</span>)}</div></div>
          </div>
          <div className="absolute -bottom-6 -right-5 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg sm:-right-8"><span className="grid size-10 place-items-center rounded-xl bg-accent/15 text-accent"><BookOpen size={19}/></span><span><b className="block text-sm">آية، سؤال، واكتشاف</b><small className="text-muted-foreground">خطوة صغيرة كل يوم</small></span></div>
        </div>
      </section>
      <section className="border-y border-border bg-[hsl(var(--card)/.55)]">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 md:grid-cols-[.65fr_1fr] md:py-20">
          <div><p className="text-sm font-bold text-accent">كيف تسير الرحلة؟</p><h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">ثلاث خطوات،<br/>وكل خطوة تفتح باباً.</h2></div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[['١','اقرأ الدليل','تلميح مستمد من قصة أو آية.'],['٢','املأ الشبكة','رتّب إجاباتك في الكلمات المتقاطعة.'],['٣','اكشف السر','اجمع الحروف وأرسل كلمة المرحلة.']].map(([n,t,d])=><article key={n} className="rounded-2xl border border-border bg-background/75 p-5"><span className="font-serif text-3xl text-accent">{n}</span><h3 className="mt-3 font-bold">{t}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{d}</p></article>)}
          </div>
        </div>
      </section>
      <section className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-7 px-5 py-14 sm:px-8 md:flex-row md:items-center md:py-20">
        <div className="max-w-xl"><p className="text-sm font-bold text-primary">رحلة من عشر محطات</p><h2 className="mt-3 font-serif text-3xl sm:text-4xl">من حكايات البداية إلى كلمات الرجاء.</h2><p className="mt-4 leading-7 text-muted-foreground">كل مرحلة عالم صغير بموضوعه وأسئلته. تقدّم على مهل، وعد في أي وقت لتكمل من حيث توقفت.</p></div>
        <div className="flex items-center gap-3 rounded-[1.5rem] border border-border bg-card px-6 py-5"><LockKeyhole size={20} className="text-accent"/><span className="text-sm leading-6">تفتح المراحل التالية<br/><b>كلما أكملت السابقة</b></span><ArrowUpLeft className="text-primary"/></div>
      </section>
      <footer className="border-t border-border px-5 py-6 text-center text-xs text-muted-foreground">نور الكلمة — لنجعل التعلّم رحلة مشتركة.</footer>
    </main>
  </div>;
}

function ProfileSetup({ onSaved }: { onSaved: () => void }) {
  const [name, setName] = useState('');
  const queryClient = useQueryClient();
  const saveProfile = useSavePlayerProfile();
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) return;
    saveProfile.mutate({ data: { displayName: name.trim() } }, { onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: getGetGameDashboardQueryKey() }); onSaved(); } });
  };
  return <div className="mx-auto max-w-lg rounded-[2rem] border border-border bg-card p-7 shadow-sm sm:p-10">
    <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-secondary text-primary"><BookOpen size={24}/></div>
    <p className="mt-5 text-center text-sm font-bold text-accent">قبل أن نبدأ</p><h1 className="mt-2 text-center font-serif text-3xl">كيف نناديك؟</h1><p className="mt-3 text-center leading-7 text-muted-foreground">سيظهر اسمك في لوحة المتصدرين، ويمكنك تغييره لاحقاً.</p>
    <form onSubmit={submit} className="mt-7 space-y-4"><label htmlFor="displayName" className="block text-sm font-semibold">الاسم الذي سيظهر للاعبين</label><input id="displayName" value={name} onChange={e=>setName(e.target.value)} minLength={2} maxLength={24} autoComplete="nickname" required className="h-12 w-full rounded-xl border border-input bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="اكتب اسماً من ٢ إلى ٢٤ حرفاً" data-testid="input-display-name"/>{saveProfile.isError&&<p className="text-sm text-destructive">لم نتمكن من حفظ الاسم. حاول مرة أخرى.</p>}<button disabled={saveProfile.isPending} className="w-full rounded-full bg-primary px-5 py-3.5 font-bold text-primary-foreground disabled:opacity-60" data-testid="button-save-profile">{saveProfile.isPending?'جارٍ الحفظ...':'حفظ ومتابعة الرحلة'}</button></form>
  </div>;
}

function Dashboard() {
  const { data: dashboard, isLoading, isError, refetch } = useGetGameDashboard();
  if (isLoading) return <GameShell><LoadingState/></GameShell>;
  if (isError || !dashboard) return <GameShell><ErrorState retry={() => void refetch()}/></GameShell>;
  if (!dashboard.profile) return <GameShell><ProfileSetup onSaved={() => void refetch()}/></GameShell>;
  const active = dashboard.stages.find(stage => stage.id === dashboard.activeStageId) || dashboard.stages.find(stage => stage.state === 'available');
  return <GameShell><div className="page-enter">
    <section className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-8 text-primary-foreground shadow-md sm:px-10 sm:py-10">
      <div className="absolute -left-8 -top-16 size-56 rounded-full border border-white/10"/><div className="absolute -left-1 top-2 size-32 rounded-full border border-white/10"/>
      <div className="relative flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
        <div><p className="text-sm text-white/70">أهلاً بعودتك</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">{dashboard.profile.displayName}</h1><p className="mt-3 max-w-lg text-sm leading-6 text-white/75">{active?`رحلتك تنتظر عند «${active.title}». هل نكمل معاً؟`:'أحسنت، أتممت كل محطات هذه الرحلة.'}</p></div>
        <div className="flex gap-3"><div className="min-w-28 rounded-2xl border border-white/15 bg-white/10 px-4 py-3"><small className="text-white/70">رصيدك</small><b className="mt-1 block text-2xl">{dashboard.score.toLocaleString('ar-EG')} <span className="text-sm font-medium">نقطة</span></b></div><div className="min-w-28 rounded-2xl border border-white/15 bg-white/10 px-4 py-3"><small className="text-white/70">المحطات</small><b className="mt-1 block text-2xl">{dashboard.completedStages.toLocaleString('ar-EG')}<span className="text-sm font-medium"> / ١٠</span></b></div></div>
      </div>
      {active&&<Link href={`/play/${active.id}`} className="relative mt-7 inline-flex items-center gap-3 rounded-full bg-[#f3d39d] px-6 py-3.5 font-bold text-foreground transition hover:-translate-y-0.5" data-testid="link-resume-stage">تابع المرحلة {active.id.toLocaleString('ar-EG')} <ArrowLeft size={18}/></Link>}
    </section>
    <section className="mt-10"><div className="mb-5 flex items-end justify-between"><div><p className="text-sm font-bold text-accent">خارطة الرحلة</p><h2 className="mt-1 font-serif text-3xl">محطات الكلمة</h2></div><span className="text-sm text-muted-foreground">{dashboard.completedStages.toLocaleString('ar-EG')} من ١٠ مكتملة</span></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{dashboard.stages.map((stage,index)=><article key={stage.id} className={`relative min-h-[160px] rounded-[1.4rem] border p-4 transition ${stage.state==='available'?'border-primary/35 bg-card shadow-md ring-1 ring-primary/10':'border-border bg-card/70'} ${stage.state==='locked'?'opacity-65':''}`} data-testid={`card-stage-${stage.id}`}>
        <div className="flex items-start justify-between"><span className={`grid size-9 place-items-center rounded-xl text-sm font-bold ${stage.state==='completed'?'bg-primary text-primary-foreground':stage.state==='available'?'bg-accent/15 text-accent':'bg-secondary text-muted-foreground'}`}>{stage.state==='completed'?<Check size={17}/>:stage.id.toLocaleString('ar-EG')}</span><span className="text-xs text-muted-foreground">{stage.points.toLocaleString('ar-EG')} نقطة</span></div>
        <h3 className="mt-4 font-bold">{stage.title}</h3><p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{stage.theme}</p>
        {stage.state==='available'&&<Link href={`/play/${stage.id}`} className="absolute inset-0 rounded-[1.4rem] focus:outline-none focus:ring-2 focus:ring-primary" aria-label={`ابدأ ${stage.title}`} data-testid={`link-stage-${stage.id}`}/>}
        {stage.state==='locked'&&<span className="absolute bottom-4 left-4 text-muted-foreground"><LockKeyhole size={15}/></span>}
      </article>)}</div>
    </section>
    <section className="mt-10 grid gap-6 md:grid-cols-[1fr_310px]">
      <div className="rounded-[1.7rem] border border-border bg-card p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-bold text-accent">أثر خطواتك</p><h2 className="mt-1 font-serif text-2xl">آخر المحطات</h2></div><BookOpen className="text-primary"/></div>
        {dashboard.recentActivity.length? <div className="mt-5 divide-y divide-border">{dashboard.recentActivity.slice(0,4).map(item=><div key={item.id} className="flex items-center justify-between gap-3 py-3" data-testid={`activity-${item.id}`}><div><b className="text-sm">{item.title}</b><small className="mt-1 block text-xs text-muted-foreground">{new Date(item.completedAt).toLocaleDateString('ar-EG')}</small></div><span className="text-sm font-bold text-primary">+{item.points.toLocaleString('ar-EG')}</span></div>)}</div>:<div className="mt-5 rounded-2xl bg-secondary/60 px-5 py-6 text-center"><p className="font-semibold">هنا ستظهر محطاتك المكتملة</p><p className="mt-1 text-sm text-muted-foreground">ابدأ أول مرحلة لتسجل أول إنجاز.</p></div>}
      </div>
      <aside className="flex flex-col justify-between rounded-[1.7rem] border border-accent/20 bg-[hsl(var(--accent)/.09)] p-6"><div><span className="grid size-10 place-items-center rounded-xl bg-card text-accent"><Sparkles size={19}/></span><h3 className="mt-4 font-serif text-2xl">كل إجابة تقرّبك</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">أكمل الكلمات المتقاطعة ثم أرسل كلمة السر لتضيء المحطة التالية.</p></div><p className="mt-6 text-sm font-semibold text-primary">عشر محطات، خطوة بخطوة</p></aside>
    </section>
  </div></GameShell>;
}

export default function Home() {
  return <><Show when="signed-out"><PublicLanding/></Show><Show when="signed-in"><Dashboard/></Show></>;
}
