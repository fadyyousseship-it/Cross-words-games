import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { Show } from '@clerk/react';
import { ArrowRight, BookOpen, Check, ChevronDown, CircleHelp, LoaderCircle, Send, Sparkles, Star } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetGameDashboardQueryKey, getGetLeaderboardQueryKey, getGetStagePuzzleQueryKey, useGetStagePuzzle, useSubmitStageAttempt } from '@workspace/api-client-react';
import type { PuzzleEntry, StageAttemptResult } from '@workspace/api-client-react';
import { GameShell } from '@/components/GameShell';
import { ErrorState, LoadingState, SignInPrompt } from '@/components/States';

type CrosswordCell = { number?: number; questionIds: number[]; letters: string[]; secretOrder?: number };

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
  const { data: puzzle, isLoading, isError, refetch } = useGetStagePuzzle(validStageId ? stageId : 0, {
    query: { enabled: validStageId, queryKey: getGetStagePuzzleQueryKey(validStageId ? stageId : 0) },
  });
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [completionPhrase, setCompletionPhrase] = useState('');
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
        const cell = map.get(key) || { questionIds: [], letters: [] };
        if (offset === 0) cell.number = entry.number;
        if (!cell.questionIds.includes(entry.questionId)) cell.questionIds.push(entry.questionId);
        if (entry.keyCellIndex === offset && entry.secretOrder !== null && entry.secretOrder !== undefined) {
          cell.secretOrder = entry.secretOrder;
        }
        const letter = [...normalizeAnswerForGrid(answers[entry.questionId] || '')][offset] || '';
        if (letter) cell.letters.push(letter);
        map.set(key, cell);
      }
    });
    return map;
  }, [puzzle, answers]);
  const activeEntry = puzzle?.entries.find(entry => entry.questionId === selectedId) || puzzle?.entries[0];
  const solvedSet = new Set(puzzle?.solvedQuestionIds || []);
  const savedAnswers = new Map((puzzle?.solvedAnswers || []).map(saved => [saved.questionId, saved.answer]));
  const isEntryCorrect = (questionId: number) => {
    const saved = savedAnswers.get(questionId);
    if (saved !== undefined && normalizeAnswerForGrid(answers[questionId] || '') === normalizeAnswerForGrid(saved)) return true;
    return result?.results.some(row => row.questionId === questionId && row.correct) || false;
  };
  const completedCount = puzzle?.entries.filter(entry => isEntryCorrect(entry.questionId)).length || 0;
  const allAnswersCorrect = !!puzzle && puzzle.entries.length > 0 && completedCount === puzzle.entries.length;

  if (!validStageId) return <GameShell><ErrorState retry={() => setLocation('/')}/></GameShell>;
  if (isLoading) return <GameShell><LoadingState label="نفتح صفحات هذه المرحلة..."/></GameShell>;
  if (isError || !puzzle) return <GameShell><ErrorState retry={() => void refetch()}/></GameShell>;

  const submitAttempt = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      answers: puzzle.entries
        .filter(entry => (answers[entry.questionId] || '').trim())
        .map(entry => ({ questionId: entry.questionId, answer: answers[entry.questionId].trim() })),
      ...(allAnswersCorrect && completionPhrase.trim() ? { completionPhrase: completionPhrase.trim() } : {}),
    };
    attempt.mutate({ stageId, data: payload }, {
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

  return <GameShell><div className="page-enter">
    <div className="mb-5 flex items-center justify-between gap-3">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary" data-testid="link-back-dashboard"><ArrowRight size={17}/> العودة إلى الرحلة</Link>
      <span className="rounded-full border border-primary/25 bg-primary/[.07] px-3.5 py-1.5 text-xs font-semibold text-primary">المحطة {stageId.toLocaleString('ar-EG')} · ١ من ١</span>
    </div>
    <section className="panel-inset overflow-hidden rounded-[1.8rem] border border-border bg-card">
      <div className="relative flex flex-col justify-between gap-5 border-b border-border bg-[linear-gradient(110deg,hsl(220_27%_16%),hsl(221_27%_13%))] px-5 py-6 sm:flex-row sm:items-center sm:px-8 sm:py-7">
        <div className="absolute inset-y-0 right-0 w-1 bg-primary"/>
        <div className="pr-2"><p className="flex items-center gap-2 text-xs font-bold text-primary"><Star size={13}/> {puzzle.theme}</p><h1 className="mt-2 font-serif text-3xl sm:text-4xl">{puzzle.title}</h1><p className="mt-2 text-sm text-muted-foreground">تمهّل في التأمل، واجمع أحرف الرسالة من الخانات المضيئة.</p></div>
        <div className="flex min-w-[190px] items-center gap-3 rounded-2xl border border-border/80 bg-background/55 px-4 py-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><BookOpen size={18}/></span>
          <span className="text-sm"><b className="text-foreground">{completedCount.toLocaleString('ar-EG')}</b><span className="text-muted-foreground"> / {puzzle.entries.length.toLocaleString('ar-EG')} إجابات</span><span className="mt-1 block text-[10px] text-muted-foreground">تقدّمك محفوظ تلقائياً</span></span>
        </div>
      </div>
      <form onSubmit={submitAttempt} className="grid gap-6 p-4 sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(310px,.78fr)] lg:gap-8">
        <div className="min-w-0">
          <div className="flex items-end justify-between"><div><p className="text-xs font-bold tracking-wide text-primary">شبكة الكلمات</p><p className="mt-1 text-xs text-muted-foreground">اختر سؤالاً لتتبّع مساره داخل الشبكة</p></div><span className="font-mono text-[11px] text-muted-foreground">{puzzle.rows} × {puzzle.columns}</span></div>
          <div className="mt-4 overflow-x-auto rounded-[1.4rem] border border-border/80 bg-[#0d1420] p-3 sm:p-5">
            <div className="mx-auto grid w-fit gap-[3px] sm:gap-1" style={{ gridTemplateColumns: `repeat(${puzzle.columns}, minmax(0, 1fr))` }} dir="ltr" data-testid="grid-crossword">
              {Array.from({ length: puzzle.rows * puzzle.columns }, (_, index) => {
                const row = Math.floor(index / puzzle.columns), col = index % puzzle.columns;
                const cell = cellMap.get(`${row}:${col}`);
                if (!cell) return <div key={index} className="aspect-square w-[min(8.6vw,43px)] min-w-[26px]"/>;
                const selected = activeEntry && cell.questionIds.includes(activeEntry.questionId);
                const letter = cell.letters[0] || '';
                const isKeyCell = cell.secretOrder !== undefined;
                return <button key={index} type="button" onClick={() => cell.questionIds[0] && setSelectedId(cell.questionIds[0])} className={`relative aspect-square w-[min(8.6vw,43px)] min-w-[26px] rounded-[5px] border font-bold transition-colors sm:rounded-lg sm:text-lg ${isKeyCell ? (selected ? 'border-[#f4d18d] bg-[#d9ad63] text-[#25201a]' : 'border-[#bd9250] bg-[#c49a58] text-[#29231a]') : selected ? 'border-primary/80 bg-[#e2c88f] text-[#28251f]' : 'border-[#3a4552] bg-[#222c38] text-foreground'} ${letter ? '' : 'text-transparent'}`} aria-label={isKeyCell ? 'خلية الرسالة' : `خلية الصف ${row + 1} العمود ${col + 1}`} data-testid={`cell-${row}-${col}`}>
                  {cell.number!==undefined&&<span className={`absolute right-0.5 top-0 text-[8px] leading-none sm:right-1 sm:top-0.5 sm:text-[9px] ${isKeyCell?'text-[#4a3922]':'text-[#98a3ae]'}`}>{cell.number.toLocaleString('ar-EG')}</span>}
                  <span>{letter}</span>
                </button>;
              })}
            </div>
          </div>
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-secondary/50 p-4 text-sm leading-6 text-muted-foreground"><CircleHelp size={18} className="mt-0.5 shrink-0 text-primary"/><p>الخانات الذهبية تحمل أحرفاً تُقرأ بحسب ترتيب أرقامها. اختر سؤالاً لعرض إجابته في الخانات المشتركة.</p></div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center justify-between"><div><p className="text-xs font-bold tracking-wide text-primary">أسئلة المرحلة</p><p className="mt-1 text-xs text-muted-foreground">١٦ إشارة من الكتاب المقدس</p></div><ChevronDown size={17} className="text-muted-foreground"/></div>
          <div className="mt-3 max-h-[520px] space-y-2 overflow-y-auto pl-1">
            {puzzle.entries.map(entry => {
              const correct = isEntryCorrect(entry.questionId);
              const isSelected = activeEntry?.questionId === entry.questionId;
              return <article key={entry.questionId} className={`rounded-2xl border p-3.5 transition-colors ${isSelected?'border-primary/40 bg-primary/[.055]':'border-border bg-background/55'} ${correct?'border-primary/30':''}`} data-testid={`clue-${entry.questionId}`}>
                <button type="button" onClick={() => setSelectedId(entry.questionId)} className="flex w-full items-start gap-3 text-right" data-testid={`button-select-clue-${entry.questionId}`}>
                  <span className={`grid size-8 shrink-0 place-items-center rounded-lg text-xs font-bold ${correct?'bg-primary text-primary-foreground':'bg-secondary text-primary'}`}>{correct?<Check size={15}/>:entry.number.toLocaleString('ar-EG')}</span>
                  <span className="flex-1"><span className="block text-sm font-semibold leading-6">{entry.clue}</span><span className="mt-1 block text-[11px] text-muted-foreground">{entry.direction==='across'?'أفقي':'عمودي'} · {entry.length.toLocaleString('ar-EG')} أحرف{entry.scriptureReference?` · ${entry.scriptureReference}`:''}</span></span>
                  {correct&&<Check size={16} className="mt-1 text-primary"/>}
                </button>
                <input value={answers[entry.questionId] || ''} onChange={event=>{setAnswers(current=>({...current,[entry.questionId]:event.target.value}));setResult(null);}} onFocus={()=>setSelectedId(entry.questionId)} dir="rtl" maxLength={entry.length} placeholder="اكتب إجابتك" aria-label={`إجابة السؤال ${entry.number}`} className={`mt-3 h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 ${correct?'border-primary/45 text-primary':'border-input'}`} data-testid={`input-answer-${entry.questionId}`}/>
              </article>;
            })}
          </div>
          {allAnswersCorrect&&!result?.stageComplete&&<div className="mt-4 rounded-2xl border border-primary/35 bg-primary/[.06] p-4" data-testid="completion-phrase-panel">
            <label htmlFor="completion-phrase" className="block text-sm font-bold text-primary">كلمة السر</label>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">الخانات الذهبية، من الأعلى إلى الأسفل، تكوّن كلمة السر. اكتبها لإتمام الرحلة.</p>
            <input id="completion-phrase" value={completionPhrase} onChange={event=>setCompletionPhrase(event.target.value)} dir="rtl" maxLength={80} placeholder="اكتب كلمة السر" className="mt-3 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" data-testid="input-completion-phrase"/>
          </div>}
          {result&&<div role="status" className={`mt-4 rounded-2xl border p-4 ${result.stageComplete?'border-primary/35 bg-primary/[.07]':'border-border bg-secondary/40'}`} data-testid="status-attempt-result">
            {result.stageComplete
              ? <div className="rounded-xl border border-primary/25 bg-background/55 px-4 py-5 text-center"><Sparkles className="mx-auto text-primary" size={23}/><p className="mt-2 font-bold text-primary">تهانينا، أتممت هذه المرحلة.</p><p className="mt-3 font-serif text-lg leading-9 text-foreground sm:text-xl" dir="rtl">{result.congratsMessage ?? ''}</p></div>
              : <p className="font-semibold leading-6">{result.message}</p>}
            <p className="mt-3 text-sm text-muted-foreground">{result.scoreEarned>0?`أضفت ${result.scoreEarned.toLocaleString('ar-EG')} نقطة`:'راجع الإجابات ثم حاول مرة أخرى'}</p>
            {result.stageComplete&&result.nextStageId&&<Link href={`/play/${result.nextStageId}`} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-primary" data-testid="link-next-stage">إلى المحطة التالية <ArrowRight size={16}/></Link>}
            {result.stageComplete&&!result.nextStageId&&<Link href="/" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-primary" data-testid="link-finish-journey">العودة إلى الرحلة <ArrowRight size={16}/></Link>}
          </div>}
          {attempt.isError&&<p role="alert" className="mt-3 rounded-xl border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">تعذّر إرسال الإجابات. تحقق من اتصالك ثم أعد المحاولة.</p>}
          <button type="submit" disabled={attempt.isPending||result?.stageComplete===true||(allAnswersCorrect&&!completionPhrase.trim())} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-bold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-45" data-testid="button-submit-attempt">{attempt.isPending?<><LoaderCircle size={17} className="animate-spin"/> جارٍ التحقق...</>:<><Send size={16}/> {allAnswersCorrect?'تحقق من كلمة السر':'تحقق من الإجابات'}</>}</button>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><Sparkles size={14} className="text-primary"/> يمكنك العودة إلى الأسئلة ومراجعتها في أي وقت.</div>
        </div>
      </form>
    </section>
  </div></GameShell>;
}

export default function Play() {
  return <><Show when="signed-in"><PlayGame/></Show><Show when="signed-out"><GameShell><SignInPrompt/></GameShell></Show></>;
}
