import "./_group.css";
import { ArrowRight, BookOpen, Check, CircleHelp, Send } from "lucide-react";

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

export function Current() {
  return (
    <div dir="rtl" className="min-h-screen bg-background font-sans text-foreground">
      <header className="border-b border-border bg-card/90">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground"><BookOpen size={19}/></span>
            <span><b className="block font-serif text-xl leading-none">Akinetos</b><small className="mt-1 block text-[9px] text-muted-foreground">our path -choose what lasts</small></span>
          </div>
          <button className="rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold">رحلتي</button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-3 pb-10 pt-5">
        <div className="mb-4 flex items-center justify-between text-xs font-semibold text-muted-foreground"><span className="flex items-center gap-1.5"><ArrowRight size={15}/> العودة إلى الرحلة</span><span className="rounded-full border border-border bg-card px-3 py-1.5 text-primary">المحطة ١ من ١</span></div>
        <section className="overflow-hidden rounded-[1.6rem] border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-secondary/45 px-4 py-5">
            <p className="text-[11px] font-bold text-accent">موضوع المحطة · شخصيات وأحداث من الكتاب المقدس</p>
            <h1 className="mt-1 font-serif text-3xl">رحلة الكلمة</h1>
            <p className="mt-2 text-xs text-muted-foreground">أجب عن جميع الأسئلة لإتمام الرحلة.</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-background px-3 py-2 text-xs"><BookOpen size={16} className="text-primary"/> ٠ / ١٦ إجابات</div>
          </div>
          <div className="grid gap-5 p-3.5">
            <div>
              <div className="flex items-center justify-between text-xs"><b className="text-primary">شبكة الكلمات</b><span className="text-muted-foreground">١٦ × ٩</span></div>
              <div className="mt-3 overflow-x-auto rounded-2xl bg-[#264944] p-3">
                <div className="mx-auto grid w-fit gap-[3px]" style={{gridTemplateColumns:"repeat(9, 25px)"}} dir="ltr">
                  {Array.from({length:144},(_,i)=>{
                    const row=Math.floor(i/9), col=i%9, active=col<answerLengths[row];
                    return <div key={i} className={`relative h-[25px] w-[25px] rounded-[4px] ${active?"border border-[#e9dfc9] bg-[#f7f0df]":"bg-transparent"}`}>{active&&col===0&&<span className="absolute right-0.5 top-0 text-[7px] text-[#67827c]">{row+1}</span>}</div>;
                  })}
                </div>
              </div>
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-secondary/55 p-3 text-xs leading-5 text-muted-foreground"><CircleHelp size={15} className="mt-0.5 shrink-0 text-primary"/>اختر سؤالاً من القائمة. ستظهر إجابتك في الخانات المشتركة مع السؤال الآخر.</div>
            </div>
            <div>
              <b className="text-xs text-primary">أسئلة المرحلة</b>
              <div className="mt-2 space-y-2">
                {clues.slice(0,3).map((clue,i)=><article key={clue} className="rounded-2xl border border-border bg-background/65 p-3">
                  <div className="flex items-start gap-2.5"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-secondary text-[11px] font-bold text-primary">{i+1}</span><span className="text-xs font-semibold leading-5">{clue}<small className="mt-1 block text-[10px] font-normal text-muted-foreground">أفقي · إجابة كتابية</small></span></div>
                  <input className="mt-2.5 h-9 w-full rounded-xl border border-input bg-card px-3 text-xs" placeholder="اكتب إجابتك" readOnly aria-label={`إجابة السؤال ${i+1}`}/>
                </article>)}
              </div>
            </div>
            <button className="flex h-11 items-center justify-center gap-2 rounded-full bg-primary text-xs font-bold text-primary-foreground"><Send size={15}/> إرسال الإجابات</button>
          </div>
        </section>
        <footer className="mt-5 flex items-center justify-between border-t border-border pt-4 text-[10px] text-muted-foreground"><span>كلمة تنير الطريق</span><span className="flex items-center gap-1"><Check size={12}/> تقدّم محفوظ</span></footer>
      </main>
    </div>
  );
}
