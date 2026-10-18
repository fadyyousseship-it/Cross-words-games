export type CrosswordEntry = {
  questionId: number;
  clue: string;
  answer: string;
  direction: "across" | "down";
  row: number;
  col: number;
  keyCellIndex: number;
  secretOrder: number;
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
    title: "البداية",
    theme: "شخصيات وأحداث كتابية أساسية",
    entries: [
      {
        questionId: 1,
        clue: "المدينة التي اتخذها يسوع مقرًا لخدمته في الجليل وشهدت معجزاته",
        answer: "كفرناحوم",
        direction: "across",
        row: 4,
        col: 0,
        keyCellIndex: 3,
        secretOrder: 1,
      },
      {
        questionId: 2,
        clue: "الملك والنبي وصاحب سفر المزامير",
        answer: "داود",
        direction: "down",
        row: 3,
        col: 4,
        keyCellIndex: 2,
        secretOrder: 2,
      },
      {
        questionId: 3,
        clue: "صديق يسوع الذي أقامه من الموت بعد أربعة أيام",
        answer: "لعازر",
        direction: "down",
        row: 0,
        col: 2,
        keyCellIndex: 4,
        secretOrder: 3,
      },
    ],
  },
  {
    id: 2,
    title: "أبطال الإيمان",
    theme: "أنبياء وملكات",
    entries: [
      { questionId: 4, clue: "النبي الذي صعد إلى السماء في مركبة نارية", answer: "إيليا", direction: "across", row: 0, col: 0, keyCellIndex: 1, secretOrder: 1 },
      { questionId: 5, clue: "الملكة التي أنقذت شعبها بالصلاة والصوم", answer: "إستير", direction: "down", row: 0, col: 0, keyCellIndex: 1, secretOrder: 2 },
    ],
  },
  {
    id: 3,
    title: "رحلة التحوّل",
    theme: "تلاميذ ورسل",
    entries: [
      { questionId: 6, clue: "الاسم الأول لبولس الرسول قبل إيمانه", answer: "شاول", direction: "across", row: 1, col: 0, keyCellIndex: 2, secretOrder: 1 },
      { questionId: 7, clue: "التلميذ الذي طلب أن يرى أثر المسامير ليؤمن", answer: "توما", direction: "down", row: 0, col: 2, keyCellIndex: 1, secretOrder: 2 },
    ],
  },
  {
    id: 4,
    title: "خدمة وأمانة",
    theme: "شخصيات من العهدين",
    entries: [
      { questionId: 8, clue: "الطبيب الحبيب وكاتب الإنجيل الثالث وسفر أعمال الرسل", answer: "لوقا", direction: "across", row: 3, col: 0, keyCellIndex: 2, secretOrder: 1 },
      { questionId: 9, clue: "أخو موسى وأول رئيس كهنة في العهد القديم", answer: "هارون", direction: "down", row: 0, col: 1, keyCellIndex: 2, secretOrder: 2 },
    ],
  },
  {
    id: 5,
    title: "جذور الحكاية",
    theme: "بدايات العهد القديم",
    entries: [
      { questionId: 10, clue: "أبو الآباء الذي دعاه الله من أور الكلدانيين", answer: "إبراهيم", direction: "across", row: 0, col: 0, keyCellIndex: 3, secretOrder: 1 },
      { questionId: 11, clue: "أول إنسان خلقه الله ووضعه في جنة عدن", answer: "آدم", direction: "down", row: 0, col: 6, keyCellIndex: 1, secretOrder: 2 },
    ],
  },
  {
    id: 6,
    title: "خدمة الهيكل",
    theme: "أسباط وأمانة",
    entries: [
      { questionId: 12, clue: "السبط المخصص لخدمة الهيكل والكهنوت", answer: "لاوي", direction: "across", row: 0, col: 0, keyCellIndex: 1, secretOrder: 1 },
    ],
  },
  {
    id: 7,
    title: "مواهب وعطاء",
    theme: "مثل الوزنات",
    entries: [
      { questionId: 13, clue: "المواهب والإمكانيات التي يأتمننا الله عليها لنثمر", answer: "وزنات", direction: "across", row: 0, col: 0, keyCellIndex: 2, secretOrder: 1 },
    ],
  },
  {
    id: 8,
    title: "الاختيار الصالح",
    theme: "أبناء آدم",
    entries: [
      { questionId: 14, clue: "ابن آدم البار وصاحب أول ذبيحة مقبولة", answer: "هابيل", direction: "across", row: 0, col: 0, keyCellIndex: 2, secretOrder: 1 },
    ],
  },
  {
    id: 9,
    title: "رؤيا الرجاء",
    theme: "السفر الختامي",
    entries: [
      { questionId: 15, clue: "آخر سفر في الكتاب المقدس، كتبه يوحنا في جزيرة بطمس", answer: "رؤيا", direction: "across", row: 0, col: 0, keyCellIndex: 2, secretOrder: 1 },
    ],
  },
  {
    id: 10,
    title: "ذكرى باقية",
    theme: "العشاء الأخير",
    entries: [
      { questionId: 16, clue: "قال يسوع لتلاميذه في العشاء الأخير: اصنعوا هذا لـ...", answer: "ذكرى", direction: "across", row: 0, col: 0, keyCellIndex: 3, secretOrder: 1 },
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

export function stageSecret(stage: GameStage): string {
  return [...stage.entries]
    .sort((a, b) => a.secretOrder - b.secretOrder)
    .map((entry) => [...normalizeArabicAnswer(entry.answer)][entry.keyCellIndex] ?? "")
    .join("");
}

export function getStage(stageId: number): GameStage | undefined {
  return gameStages.find((stage) => stage.id === stageId);
}
