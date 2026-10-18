import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { Show } from '@clerk/react';
import { ArrowRight, BookOpen, Check, ChevronDown, CircleHelp, KeyRound, LoaderCircle, Send, Sparkles } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetGameDashboardQueryKey, getGetLeaderboardQueryKey, getGetStagePuzzleQueryKey, useGetStagePuzzle, useSubmitStageAttempt } from '@workspace/api-client-react';
import type { PuzzleEntry, StageAttemptResult } from '@workspace/api-client-react';
import { GameShell } from '@/components/GameShell';
import { ErrorState, LoadingState, SignInPrompt } from '@/components/States';

type CrosswordCell = { number?: number; questionIds: number[]; letters: string[]; isKeyCell: boolean; secretOrder?: number };

function normalizeAnswerForGrid(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, '')
    .trim();
}

function PlayGame() {
  const params = useParams<{ stageId: string }>();
  const [, setLocation] = useLocation();
  const stageId = Number(params.stageId);
  const validStageId = Number.isInteger(stageId) && stageId > 0;
  const { data: puzzle, isLoading, isError, refetch } = useGetStagePuzzle(validStageId ? stageId : 0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<StageAttemptResult | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const attempt = useSubmitStageAttempt();
  useEffect(() => {
    if (!puzzle?.solvedAnswers.length) return;
    setAnswers(current => {
      const next = { ...current };
      let changed = false;
      for (const saved of puzzle.solvedAnswers) {
        if (next[saved.questionId] !== saved.answer) {
          next[saved.questionId] = saved.answer;
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [puzzle?.stageId, puzzle?.solvedAnswers]);
  const cellMap = useMemo(() => {
    const map = new Map<string, CrosswordCell>();
    if (!puzzle) return map;
    puzzle.entries.forEach((entry: PuzzleEntry) => {
      for (let offset = 0; offset < entry.length; offset += 1) {
        const row = entry.row + (entry.direction === 'down' ? offset : 0);
        const col = entry.col + (entry.direction === 'across' ? offset : 0);
        const key = `${row}:${col}`;
        const cell = map.get(key) || { questionIds: [], letters: [], isKeyCell: false };
        if (offset === 0) cell.number = entry.number;
        if (!cell.questionIds.includes(entry.questionId)) cell.questionIds.push(entry.questionId);
        const letter = [...normalizeAnswerForGrid(answers[entry.questionId] || '')][offset] || '';
        if (letter) cell.letters.push(letter);
        if (entry.keyCellIndex === offset) {
          cell.isKeyCell = true;
          cell.secretOrder = entry.secretOrder ?? undefined;
        }
        map.set(key, cell);
      }
    });
    return map;
  }, [puzzle, answers]);
  const activeEntry = puzzle?.entries.find(entry => entry.questionId === selectedId) || puzzle?.entries[0];
  const solvedSet = new Set(puzzle?.solvedQuestionIds || []);
  const secretLetters = puzzle?.stageId === 10 ? [] : [...(puzzle?.entries || [])]
    .filter(entry => entry.keyCellIndex !== null && entry.secretOrder !== null)
    .sort((a, b) => (a.secretOrder ?? 0) - (b.secretOrder ?? 0))
    .map(entry => [...normalizeAnswerForGrid(answers[entry.questionId] || '')][entry.keyCellIndex ?? 0] || '');
  const completedCount = puzzle?.entries.filter(entry => solvedSet.has(entry.questionId) || result?.results.some(row => row.questionId === entry.questionId && row.correct)).length || 0;

  if (!validStageId) return <GameShell><ErrorState retry={() => setLocation('/')}/></GameShell>;
  if (isLoading) return <GameShell><LoadingState label="نفتح صفحات هذه المرحلة..."/></GameShell>;
  if (isError || !puzzle) return <GameShell><ErrorState retry={() => void refetch()}/></GameShell>;

  const submitAttempt = (event: React.FormEvent) => {
    event.preventDefault();
    setResult(null);
    attempt.mutate({ stageId, data: { answers: puzzle.entries.filter(entry => (answers[entry.questionId] || '').trim()).map(entry => ({ questionId: entry.questionId, answer: answers[entry.questionId].trim() })), password: password.trim() } }, {
      onSuccess: async response => {
        setResult(response);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getGetStagePuzzleQueryKey(stageId) }),
          queryClient.invalidateQueries({ queryKey: getGetGameDashboardQueryKey() }),
          queryClient.invalidateQueries({ queryKey: getGetLeaderboardQueryKey() }),
        ]);
      },
    });
  };
  const answerCorrect = (questionId: number) => result?.results.some(row => row.questionId === questionId && row.correct);

  return <GameShell><div className="page-enter">
    <div className="mb-6 flex items-center justify-between gap-3">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground" data-testid="link-back-dashboard"><ArrowRight size={17}/> العودة إلى الرحلة</Link>
      <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-primary">المحطة {stageId.toLocaleString('ar-EG')} من ١٠</span>
    </div>
    <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
      <div className="flex flex-col justify-between gap-4 border-b border-border bg-secondary/45 px-5 py-5 sm:flex-row sm:items-center sm:px-8">
        <div><p className="text-xs font-bold text-accent">موضوع المحطة · {puzzle.theme}</p><h1 className="mt-1 font-serif text-3xl sm:text-4xl">{puzzle.title}</h1><p className="mt-2 text-sm text-muted-foreground">أجب عن الأسئلة، ثم اكتب كلمة السر التي تجمعها من الشبكة.</p></div>
        <div className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3"><span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary"><BookOpen size={18}/></span><span className="text-sm"><b>{completedCount.toLocaleString('ar-EG')}</b><span className="text-muted-foreground"> / {puzzle.entries.length.toLocaleString('ar-EG')} إجابات</span></span></div>
      </div>
      <form onSubmit={submitAttempt} className="grid gap-6 p-4 sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.78fr)] lg:gap-8">
        <div className="min-w-0">
          <div className="flex items-center justify-between"><div><p className="text-xs font-bold text-primary">شبكة الكلمات</p><p className="mt-1 text-xs text-muted-foreground">اختر سؤالاً لتمييز مساره</p></div><span className="text-xs text-muted-foreground">{puzzle.rows} × {puzzle.columns}</span></div>
          <div className="mt-4 overflow-x-auto rounded-[1.5rem] bg-[#264944] p-3 sm:p-5">
            <div className="mx-auto grid w-fit gap-[3px] sm:gap-1" style={{ gridTemplateColumns: `repeat(${puzzle.columns}, minmax(0, 1fr))` }} dir="ltr" data-testid="grid-crossword">
              {Array.from({ length: puzzle.rows * puzzle.columns }, (_, index) => {
                const row = Math.floor(index / puzzle.columns), col = index % puzzle.columns;
                const cell = cellMap.get(`${row}:${col}`);
                if (!cell) return <div key={index} className="aspect-square w-[min(8.6vw,43px)] min-w-[26px]"/>;
                const selected = activeEntry && cell.questionIds.includes(activeEntry.questionId);
                const letter = cell.letters[0] || '';
                return <button key={index} type="button" onClick={() => cell.questionIds[0] && setSelectedId(cell.questionIds[0])} className={`relative aspect-square w-[min(8.6vw,43px)] min-w-[26px] rounded-[5px] border text-base font-bold transition sm:rounded-lg sm:text-lg ${selected?'border-[#f2c989] bg-[#fae7c4] text-primary':'border-[#e9dfc9] bg-[#f7f0df] text-foreground'} ${cell.isKeyCell?'ring-2 ring-inset ring-[#c18a3b]':''} ${letter?'':'text-transparent'}`} aria-label={`خلية الصف ${row+1} العمود ${col+1}${cell.isKeyCell?'، من حروف كلمة السر':''}`} data-testid={`cell-${row}-${col}`}>
                  {cell.number!==undefined&&<span className="absolute right-0.5 top-0 text-[8px] leading-none text-[#67827c] sm:right-1 sm:top-0.5 sm:text-[9px]">{cell.number.toLocaleString('ar-EG')}</span>}
                  <span>{letter}</span>
                </button>;
              })}
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-2xl bg-secondary/55 p-4 text-sm leading-6 text-muted-foreground"><CircleHelp size={18} className="mt-0.5 shrink-0 text-primary"/><p>اختر سؤالاً من القائمة. ستظهر إجابتك في الخانات المشتركة مع السؤال الآخر.</p></div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center justify-between"><div><p className="text-xs font-bold text-primary">أسئلة المرحلة</p><p className="mt-1 text-xs text-muted-foreground">استعن بالإشارة الكتابية إن وُجدت</p></div><ChevronDown size={17} className="text-muted-foreground"/></div>
          <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto pl-1">
            {puzzle.entries.map(entry => {
              const correct = answerCorrect(entry.questionId);
              const isSolved = solvedSet.has(entry.questionId) || correct;
              const isSelected = (activeEntry?.questionId === entry.questionId);
              return <article key={entry.questionId} className={`rounded-2xl border p-3.5 transition ${isSelected?'border-primary/45 bg-primary/[.045]':'border-border bg-background/65'} ${correct?'border-primary/40':''}`} data-testid={`clue-${entry.questionId}`}>
                <button type="button" onClick={() => setSelectedId(entry.questionId)} className="flex w-full items-start gap-3 text-right" data-testid={`button-select-clue-${entry.questionId}`}>
                  <span className={`grid size-8 shrink-0 place-items-center rounded-lg text-xs font-bold ${isSolved?'bg-primary text-primary-foreground':'bg-secondary text-primary'}`}>{isSolved?<Check size={15}/>:entry.number.toLocaleString('ar-EG')}</span>
                  <span className="flex-1"><span className="block text-sm font-semibold leading-6">{entry.clue}</span><span className="mt-1 block text-[11px] text-muted-foreground">{entry.direction==='across'?'أفقي':'عمودي'} · {entry.length.toLocaleString('ar-EG')} أحرف{entry.scriptureReference?` · ${entry.scriptureReference}`:''}</span></span>
                  {correct&&<Check size={16} className="mt-1 text-primary"/>}
                </button>
                <input value={answers[entry.questionId] || ''} onChange={event=>{setAnswers(current=>({...current,[entry.questionId]:event.target.value}));setResult(null);}} onFocus={()=>setSelectedId(entry.questionId)} dir="rtl" maxLength={entry.length} placeholder="اكتب إجابتك" aria-label={`إجابة السؤال ${entry.number}`} className={`mt-3 h-10 w-full rounded-xl border bg-card px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 ${correct?'border-primary text-primary':'border-input'}`} data-testid={`input-answer-${entry.questionId}`}/>
              </article>;
            })}
          </div>
          <div className="mt-4 rounded-2xl border border-accent/25 bg-[hsl(var(--accent)/.07)] p-4">
            <label htmlFor="secretWord" className="flex items-center gap-2 text-sm font-bold"><KeyRound size={17} className="text-accent"/> كلمة السر</label>
             <p className="mt-1 text-xs leading-5 text-muted-foreground">{puzzle?.stageId === 10 ? 'أدخل كلمة السر الختامية لإتمام الرحلة.' : 'اجمع الحروف داخل الخانات ذات الإطار الذهبي بالترتيب.'}</p>
             {puzzle?.stageId !== 10&&<div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground"><span>الحروف الظاهرة</span><div className="flex gap-1.5" dir="rtl">{secretLetters.map((letter, index) => <span key={index} className="grid size-7 place-items-center rounded-lg border border-accent/30 bg-card font-bold text-primary" data-testid={`secret-fragment-${index}`}>{letter || '·'}</span>)}</div></div>}
             <input id="secretWord" value={password} onChange={event=>{setPassword(event.target.value);setResult(null);}} className="mt-3 h-11 w-full rounded-xl border border-input bg-card px-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/15" placeholder={puzzle?.stageId === 10 ? 'اكتب كلمة السر الختامية' : 'الكلمة التي تجمع الحروف'} data-testid="input-secret-password"/>
          </div>
          {result&&<div role="status" className={`mt-4 rounded-2xl border p-4 ${result.stageComplete?'border-primary/25 bg-primary/5':'border-accent/30 bg-accent/5'}`} data-testid="status-attempt-result">
            {result.stageComplete&&!result.nextStageId
              ? <div className="rounded-xl border border-accent/25 bg-card px-4 py-4 text-center"><Sparkles className="mx-auto text-accent" size={22}/><p className="mt-2 font-bold text-primary">{result.message}</p><p className="mt-2 text-sm text-muted-foreground">كلمة السر الختامية</p><p className="mt-1 font-serif text-2xl font-bold text-foreground" dir="rtl">لا تشاكلو</p></div>
              : <p className="font-bold">{result.message}</p>}
            <p className="mt-2 text-sm text-muted-foreground">{result.passwordCorrect?'كلمة السر صحيحة':'تحقق من كلمة السر'} · {result.scoreEarned>0?`أضفت ${result.scoreEarned.toLocaleString('ar-EG')} نقطة`:'حاول مرة أخرى'}</p>
            {result.stageComplete&&result.nextStageId&&<Link href={`/play/${result.nextStageId}`} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-primary" data-testid="link-next-stage">إلى المحطة التالية <ArrowRight size={16}/></Link>}
            {result.stageComplete&&!result.nextStageId&&<Link href="/" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-primary">العودة إلى الرحلة <ArrowRight size={16}/></Link>}
          </div>}
          {attempt.isError&&<p role="alert" className="mt-3 text-sm text-destructive">لم نتمكن من إرسال إجاباتك. تحقق من اتصالك وأعد المحاولة.</p>}
          <button type="submit" disabled={attempt.isPending} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60" data-testid="button-submit-attempt">{attempt.isPending?<><LoaderCircle size={17} className="animate-spin"/> جارٍ التحقق...</>:<><Send size={16}/> إرسال الإجابات</>}</button>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><Sparkles size={14}/> يمكنك المحاولة أكثر من مرة.</div>
        </div>
      </form>
    </section>
  </div></GameShell>;
}

export default function Play() {
  return <><Show when="signed-in"><PlayGame/></Show><Show when="signed-out"><GameShell><SignInPrompt/></GameShell></Show></>;
}
