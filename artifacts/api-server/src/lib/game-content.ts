export type CrosswordEntry = {
  questionId: number;
  clue: string;
  answer: string;
  direction: "across" | "down";
  row: number;
  col: number;
  keyCellIndex: number | null;
  secretOrder: number | null;
};

export type GameStage = {
  id: number;
  title: string;
  theme: string;
  entries: CrosswordEntry[];
};

export const gameStages: GameStage[] = [
  {
    id: 1,
    title: "رحلة الكلمة",
    theme: "شخصيات وأحداث من الكتاب المقدس",
    entries: [
      {
        questionId: 1,
        clue: "المدينة التي اتخذها يسوع مقرًا لخدمته في الجليل وشهدت معجزاته",
        answer: "كفرناحوم",
        direction: "across",
        row: 0,
        col: 0,
        keyCellIndex: null,
        secretOrder: null,
      },
      {
        questionId: 2,
        clue: "الملك والنبي وصاحب سفر المزامير",
        answer: "داود",
        direction: "across",
        row: 1,
        col: 0,
        keyCellIndex: null,
        secretOrder: null,
      },
      {
        questionId: 3,
        clue: "صديق يسوع الذي أقامه من الموت بعد أربعة أيام",
        answer: "لعازر",
        direction: "across",
        row: 2,
        col: 0,
        keyCellIndex: null,
        secretOrder: null,
      },
      { questionId: 4, clue: "النبي الذي صعد إلى السماء في مركبة نارية", answer: "إيليا", direction: "across", row: 3, col: 0, keyCellIndex: null, secretOrder: null },
      { questionId: 5, clue: "الملكة التي أنقذت شعبها بالصلاة والصوم", answer: "إستير", direction: "across", row: 4, col: 0, keyCellIndex: null, secretOrder: null },
      { questionId: 6, clue: "الاسم الأول لبولس الرسول قبل إيمانه", answer: "شاول", direction: "across", row: 5, col: 0, keyCellIndex: null, secretOrder: null },
      { questionId: 7, clue: "التلميذ الذي طلب أن يرى أثر المسامير ليؤمن", answer: "توما", direction: "across", row: 6, col: 0, keyCellIndex: null, secretOrder: null },
      { questionId: 8, clue: "الطبيب الحبيب وكاتب الإنجيل الثالث وسفر أعمال الرسل", answer: "لوقا", direction: "across", row: 7, col: 0, keyCellIndex: null, secretOrder: null },
      { questionId: 9, clue: "أخو موسى وأول رئيس كهنة في العهد القديم", answer: "هارون", direction: "across", row: 8, col: 0, keyCellIndex: null, secretOrder: null },
      { questionId: 10, clue: "أبو الآباء الذي دعاه الله من أور الكلدانيين", answer: "إبراهيم", direction: "across", row: 9, col: 0, keyCellIndex: null, secretOrder: null },
      { questionId: 11, clue: "أول إنسان خلقه الله ووضعه في جنة عدن", answer: "آدم", direction: "across", row: 10, col: 0, keyCellIndex: null, secretOrder: null },
      { questionId: 12, clue: "السبط المخصص لخدمة الهيكل والكهنوت", answer: "لاوي", direction: "across", row: 11, col: 0, keyCellIndex: null, secretOrder: null },
      { questionId: 13, clue: "المواهب والإمكانيات التي يأتمننا الله عليها لنثمر", answer: "وزنات", direction: "across", row: 12, col: 0, keyCellIndex: null, secretOrder: null },
      { questionId: 14, clue: "ابن آدم البار وصاحب أول ذبيحة مقبولة", answer: "هابيل", direction: "across", row: 13, col: 0, keyCellIndex: null, secretOrder: null },
      { questionId: 15, clue: "آخر سفر في الكتاب المقدس، كتبه يوحنا في جزيرة بطمس", answer: "رؤيا", direction: "across", row: 14, col: 0, keyCellIndex: null, secretOrder: null },
      { questionId: 16, clue: "قال يسوع لتلاميذه في العشاء الأخير: اصنعوا هذا لـ...", answer: "ذكرى", direction: "across", row: 15, col: 0, keyCellIndex: null, secretOrder: null },
    ],
  },
];

export function normalizeArabicAnswer(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, "")
    .trim();
}

export function getStage(stageId: number): GameStage | undefined {
  return gameStages.find((stage) => stage.id === stageId);
}
