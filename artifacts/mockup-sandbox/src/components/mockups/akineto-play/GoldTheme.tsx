import "./_group.css";
import { ArrowRight, BookOpen, Check, CircleHelp, Send, Sparkles, Star } from "lucide-react";

const clues = [
  "المدينة التي اتخذها يسوع مقرًا لخدمته في الجليل وشهدت معجزاته",
  "الملك والنبي وصاحب سفر المزامير",
  "صديق يسوع الذي أقامه من الموت بعد أربعة أيام",
  "النبي الذي صعد إلى السماء في مركبة نارية",
  "الملكة التي أنقذت شعبها بالصلاة والصوم",
  "الاسم الأول لبولس الرسول قبل إيمانه",
  "التلميذ الذي طلب أن يرى أثر المسامير ليؤمن",
  "الطبيب الحبيب وكاتب الإنجيل الثالث وسفر أعمال الرسل",
  "أخو موسى وأول رئيس كهنة في العهد القديم",
  "أبو الآباء الذي دعاه الله من أور الكلدانيين",
  "أول إنسان خلقه الله ووضعه في جنة عدن",
  "السبط المخصص لخدمة الهيكل والكهنوت",
  "المواهب والإمكانيات التي يأتمننا الله عليها لنثمر",
  "ابن آدم البار وصاحب أول ذبيحة مقبولة",
  "آخر سفر في الكتاب المقدس، كتبه يوحنا في جزيرة بطمس",
  "قال يسوع لتلاميذه في العشاء الأخير: اصنعوا هذا لـ...",
];
const answerLengths = [9, 4, 5, 4, 5, 4, 4, 4, 5, 7, 3, 4, 5, 5, 4, 4];
const goldCells = new Map([[18, "١"], [81, "٢"], [38, "٣"], [45, "٤"], [111, "٥"], [0, "٦"], [63, "٧"], [101, "٨"]]);
const visibleLetters = new Map([[0, "ك"], [18, "ل"], [38, "ت"], [45, "ش"]]);
const answeredRows = new Set([0, 2, 4, 5]);

export function GoldTheme() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#090d18] font-sans text-[#f5f0e4]">
      <header className="border-b border-[#2d3547] bg-[#0b0f1b]/95">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-2xl border border-[#d4a94f]/40 bg-[#d4a94f]/10 text-[#f1c363]"><BookOpen size={19}/></span>
            <span><b className="block font-serif text-xl leading-none">Akinetos</b><small className="mt-1 block text-[9px] text-[#aeb4c1]">our path -choose what lasts</small></span>
          </div>
          <button className="rounded-full border border-[#30394a] bg-[#111827] px-3 py-2 text-xs font-semibold">رحلتي</button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-3 pb-10 pt-5">
        <div className="mb-4 flex items-center justify-between text-xs font-semibold text-[#aeb4c1]"><span className="flex items-center gap-1.5"><ArrowRight size={15}/> العودة إلى الرحلة</span><span className="rounded-full border border-[#d4a94f]/35 bg-[#d4a94f]/[.08] px-3 py-1.5 text-[#f1c363]">المحطة ١ · ١ من ١</span></div>
        <section className="overflow-hidden rounded-[1.6rem] border border-[#30394a] bg-[#111827] shadow-[0_25px_60px_-32px_rgba(0,0,0,.85)]">
          <div className="relative border-b border-[#30394a] bg-[linear-gradient(110deg,#1d2639,#141b2a)] px-4 py-5">
            <div className="absolute inset-y-0 right-0 w-1 bg-[#e1b253]"/>
            <p className="flex items-center gap-2 text-[11px] font-bold text-[#edc36b]"><Star size={13}/> شخصيات وأحداث من الكتاب المقدس</p>
            <h1 className="mt-1 font-serif text-3xl text-[#f5f0e4]">رحلة الكلمة</h1>
            <p className="mt-2 text-xs text-[#aeb4c1]">تمهّل في التأمل، واجمع أحرف الرسالة من الخانات المضيئة.</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#30394a] bg-[#0d1420]/70 px-3 py-2 text-xs"><BookOpen size={16} className="text-[#edc36b]"/> ٤ / ١٦ إجابات <span className="text-[#828a99]">· تقدمك محفوظ</span></div>
          </div>
          <div className="grid gap-5 p-3.5">
            <div>
              <div className="flex items-center justify-between text-xs"><b className="text-[#edc36b]">شبكة الكلمات</b><span className="text-[#9ca5b5]">١٦ × ٩</span></div>
              <div className="mt-3 overflow-x-auto rounded-2xl border border-[#30394a] bg-[#0d1420] p-3">
                <div className="mx-auto grid w-fit gap-[3px]" style={{gridTemplateColumns:"repeat(9, 25px)"}} dir="ltr">
                  {Array.from({length:144},(_,i)=>{
                    const row=Math.floor(i/9), col=i%9, active=col<answerLengths[row], order=goldCells.get(i), letter=visibleLetters.get(i);
                    return <div key={i} className={`relative grid h-[25px] w-[25px] place-items-center rounded-[4px] border text-[12px] font-bold ${order?"border-[#bd9250] bg-[#d1a956] text-[#29231a]":active?"border-[#3b4659] bg-[#202b3c] text-[#f5f0e4]":"bg-transparent"} ${letter&&answeredRows.has(row)?"":"text-transparent"}`}>{order&&<span className="absolute left-0.5 top-0 text-[7px] text-[#594426]">{order}</span>}{letter&&answeredRows.has(row)?letter:""}</div>;
                  })}
                </div>
              </div>
              <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-[#30394a] bg-[#1a2232] p-3 text-xs leading-5 text-[#bdc2cc]"><CircleHelp size={15} className="mt-0.5 shrink-0 text-[#edc36b]"/>الخانات الذهبية تحمل أحرفاً تُقرأ بحسب ترتيب أرقامها. حلّ الأسئلة ثم اكتب العبارة التي كوّنتها.</div>
            </div>
            <div>
              <div className="flex items-center justify-between"><b className="text-xs text-[#edc36b]">أسئلة المرحلة</b><span className="text-[10px] text-[#9ca5b5]">١٦ إشارة كتابية</span></div>
              <div className="mt-2 space-y-2">
                {clues.slice(0,3).map((clue,i)=><article key={clue} className={`rounded-2xl border p-3 ${answeredRows.has(i)?"border-[#d4a94f]/35 bg-[#d4a94f]/[.055]":"border-[#30394a] bg-[#0e1422]"}`}>
                  <div className="flex items-start gap-2.5"><span className={`grid size-7 shrink-0 place-items-center rounded-lg text-[11px] font-bold ${answeredRows.has(i)?"bg-[#d4a94f] text-[#29231a]":"bg-[#202b3c] text-[#edc36b]"}`}>{answeredRows.has(i)?<Check size={14}/>:i+1}</span><span className="text-xs font-semibold leading-5">{clue}<small className="mt-1 block text-[10px] font-normal text-[#9ca5b5]">أفقي · إجابة كتابية</small></span></div>
                  <input className="mt-2.5 h-9 w-full rounded-xl border border-[#364154] bg-[#121a29] px-3 text-xs text-[#f5f0e4] placeholder:text-[#758095]" placeholder={answeredRows.has(i)?(i===0?"كفرناحوم":i===2?"لعازر":i===4?"إستير":"شاول"):"اكتب إجابتك"} readOnly aria-label={`إجابة السؤال ${i+1}`}/>
                </article>)}
              </div>
            </div>
            <div className="rounded-2xl border border-[#d4a94f]/30 bg-[#d4a94f]/[.06] p-3.5 text-center">
              <p className="text-xs font-bold text-[#edc36b]">بعد حلّ جميع الكلمات، اكتب العبارة التي جمعتها</p>
              <input className="mt-2.5 h-10 w-full rounded-xl border border-[#5a4b31] bg-[#101625] px-3 text-center text-sm text-[#f5f0e4] placeholder:text-[#8991a0]" placeholder="اكتب العبارة هنا" readOnly aria-label="عبارة الإكمال"/>
            </div>
            <button className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#e6a913] text-xs font-bold text-[#241b0b] shadow-sm"><Send size={15}/> تحقق من الإجابات</button>
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#d4a94f]/25 bg-[#171d2a] p-3 text-center text-[11px] leading-5 text-[#d9c99f]"><Sparkles size={14} className="shrink-0 text-[#edc36b]"/>تظهر التهنئة بعد إتمام الأسئلة وإدخال العبارة الصحيحة.</div>
          </div>
        </section>
        <footer className="mt-5 flex items-center justify-between border-t border-[#30394a] pt-4 text-[10px] text-[#9ca5b5]"><span>كلمة تنير الطريق</span><span className="flex items-center gap-1 text-[#edc36b]"><Check size={12}/> تقدّم محفوظ</span></footer>
      </main>
    </div>
  );
}
