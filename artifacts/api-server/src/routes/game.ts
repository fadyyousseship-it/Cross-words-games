import { and, desc, eq } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { Router, type IRouter, type Request, type Response } from "express";
import {
  GetGameDashboardResponse,
  GetLeaderboardResponse,
  GetStagePuzzleParams,
  GetStagePuzzleResponse,
  SavePlayerProfileBody,
  SavePlayerProfileResponse,
  SubmitStageAttemptBody,
  SubmitStageAttemptParams,
  SubmitStageAttemptResponse,
} from "@workspace/api-zod";
import {
  db,
  gameAttemptsTable,
  gameProfilesTable,
  stageProgressTable,
} from "@workspace/db";
import { gameStages, getStage, normalizeArabicAnswer, stageSecret } from "../lib/game-content";

const router: IRouter = Router();

function authenticatedUserId(req: Request, res: Response): string | undefined {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Sign in to continue." });
    return undefined;
  }
  return userId;
}

async function canAccessStage(userId: string, stageId: number): Promise<boolean> {
  if (stageId === 1) return true;
  const [previous] = await db
    .select({ completed: stageProgressTable.completed })
    .from(stageProgressTable)
    .where(
      and(
        eq(stageProgressTable.clerkUserId, userId),
        eq(stageProgressTable.stageId, stageId - 1),
      ),
    )
    .limit(1);
  return previous?.completed === true;
}

router.put("/player/profile", async (req, res): Promise<void> => {
  const userId = authenticatedUserId(req, res);
  if (!userId) return;

  const parsed = SavePlayerProfileBody.safeParse(req.body);
  const displayName = parsed.success ? parsed.data.displayName.trim() : "";
  if (!parsed.success || displayName.length < 2 || displayName.length > 24) {
    res.status(400).json({ error: "Display name must be 2–24 characters." });
    return;
  }

  const [profile] = await db
    .insert(gameProfilesTable)
    .values({ clerkUserId: userId, displayName })
    .onConflictDoUpdate({
      target: gameProfilesTable.clerkUserId,
      set: { displayName, updatedAt: new Date() },
    })
    .returning();

  res.json(SavePlayerProfileResponse.parse({ displayName: profile.displayName }));
});

router.get("/game/dashboard", async (req, res): Promise<void> => {
  const userId = authenticatedUserId(req, res);
  if (!userId) return;

  const [profile] = await db
    .select({ displayName: gameProfilesTable.displayName })
    .from(gameProfilesTable)
    .where(eq(gameProfilesTable.clerkUserId, userId))
    .limit(1);
  const progress = await db
    .select()
    .from(stageProgressTable)
    .where(eq(stageProgressTable.clerkUserId, userId));
  const progressByStage = new Map(progress.map((item) => [item.stageId, item]));
  const completedCount = progress.filter((item) => item.completed).length;
  const totalScore = progress.reduce((total, item) => total + item.score, 0);
  const activeStage = gameStages.find(
    (stage) => !progressByStage.get(stage.id)?.completed,
  );

  const stages = gameStages.map((stage) => {
    const stageProgress = progressByStage.get(stage.id);
    const previousComplete =
      stage.id === 1 || progressByStage.get(stage.id - 1)?.completed === true;
    return {
      id: stage.id,
      title: stage.title,
      theme: stage.theme,
      state: stageProgress?.completed
        ? "completed"
        : previousComplete
          ? "available"
          : "locked",
      points: stageProgress?.score ?? 0,
    };
  });

  const recentActivity = progress
    .filter((item) => item.completed && item.completedAt)
    .sort(
      (a, b) =>
        (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0),
    )
    .slice(0, 6)
    .map((item) => ({
      id: item.id,
      stageId: item.stageId,
      title: gameStages.find((stage) => stage.id === item.stageId)?.title ?? "",
      points: item.score,
      completedAt: item.completedAt!.toISOString(),
    }));

  res.json(
    GetGameDashboardResponse.parse({
      profile: profile ?? null,
      score: totalScore,
      completedStages: completedCount,
      activeStageId: activeStage?.id ?? null,
      stages,
      recentActivity,
    }),
  );
});

router.get("/stages/:stageId/puzzle", async (req, res): Promise<void> => {
  const userId = authenticatedUserId(req, res);
  if (!userId) return;
  const params = GetStagePuzzleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid stage." });
    return;
  }

  const stage = getStage(params.data.stageId);
  if (!stage) {
    res.status(404).json({ error: "Stage not found." });
    return;
  }
  if (!(await canAccessStage(userId, stage.id))) {
    res.status(403).json({ error: "Complete the previous stage first." });
    return;
  }

  const [progress] = await db
    .select({ solvedQuestionIds: stageProgressTable.solvedQuestionIds })
    .from(stageProgressTable)
    .where(
      and(
        eq(stageProgressTable.clerkUserId, userId),
        eq(stageProgressTable.stageId, stage.id),
      ),
    )
    .limit(1);

  const entries = stage.entries.map((entry, index) => ({
    questionId: entry.questionId,
    number: index + 1,
    clue: entry.clue,
    direction: entry.direction,
    row: entry.row,
    col: entry.col,
    length: [...normalizeArabicAnswer(entry.answer)].length,
    scriptureReference: null,
    keyCellIndex: entry.keyCellIndex,
    secretOrder: entry.secretOrder,
  }));
  const rows = Math.max(
    ...stage.entries.map(
      (entry) =>
        entry.row +
        (entry.direction === "down"
          ? [...normalizeArabicAnswer(entry.answer)].length
          : 1),
    ),
  );
  const columns = Math.max(
    ...stage.entries.map(
      (entry) =>
        entry.col +
        (entry.direction === "across"
          ? [...normalizeArabicAnswer(entry.answer)].length
          : 1),
    ),
  );

  res.json(
    GetStagePuzzleResponse.parse({
      stageId: stage.id,
      title: stage.title,
      theme: stage.theme,
      rows,
      columns,
      entries,
      solvedQuestionIds: progress?.solvedQuestionIds ?? [],
      solvedAnswers: stage.entries
        .filter((entry) =>
          (progress?.solvedQuestionIds ?? []).includes(entry.questionId),
        )
        .map((entry) => ({
          questionId: entry.questionId,
          answer: entry.answer,
        })),
    }),
  );
});

router.post("/stages/:stageId/attempt", async (req, res): Promise<void> => {
  const userId = authenticatedUserId(req, res);
  if (!userId) return;
  const params = SubmitStageAttemptParams.safeParse(req.params);
  const body = SubmitStageAttemptBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid answers." });
    return;
  }

  const stage = getStage(params.data.stageId);
  if (!stage) {
    res.status(404).json({ error: "Stage not found." });
    return;
  }
  if (!(await canAccessStage(userId, stage.id))) {
    res.status(403).json({ error: "Complete the previous stage first." });
    return;
  }

  const submitted = new Map<number, string>();
  for (const item of body.data.answers) {
    if (
      !stage.entries.some((entry) => entry.questionId === item.questionId) ||
      submitted.has(item.questionId)
    ) {
      res.status(400).json({ error: "An answer does not belong to this puzzle." });
      return;
    }
    submitted.set(item.questionId, item.answer.slice(0, 80));
  }

  const result = await db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(stageProgressTable)
      .where(
        and(
          eq(stageProgressTable.clerkUserId, userId),
          eq(stageProgressTable.stageId, stage.id),
        ),
      )
      .limit(1);

    const previousSolved = new Set(existing?.solvedQuestionIds ?? []);
    const correctById = new Map<number, boolean>();
    for (const entry of stage.entries) {
      const rawAnswer = submitted.get(entry.questionId);
      const correct =
        previousSolved.has(entry.questionId) ||
        (rawAnswer !== undefined &&
          normalizeArabicAnswer(rawAnswer) ===
            normalizeArabicAnswer(entry.answer));
      correctById.set(entry.questionId, correct);
    }

    const solvedIds = new Set(previousSolved);
    for (const [questionId, correct] of correctById) {
      if (correct) solvedIds.add(questionId);
    }
    const newlySolved = [...solvedIds].filter((id) => !previousSolved.has(id));
    const allSolved = stage.entries.every((entry) =>
      solvedIds.has(entry.questionId),
    );
    const alreadyCompleted = existing?.completed === true;
    const passwordCorrect =
      alreadyCompleted ||
      (allSolved &&
        normalizeArabicAnswer(body.data.password) ===
          normalizeArabicAnswer(stageSecret(stage)));
    const completed = alreadyCompleted || (allSolved && passwordCorrect);
    const completedNow = completed && !alreadyCompleted;
    const scoreEarned =
      newlySolved.length * 10 + (completedNow ? 50 + 20 : 0);
    const nextScore = (existing?.score ?? 0) + scoreEarned;
    const completedAt = alreadyCompleted
      ? existing?.completedAt ?? null
      : completedNow
        ? new Date()
        : null;

    await tx
      .insert(stageProgressTable)
      .values({
        clerkUserId: userId,
        stageId: stage.id,
        solvedQuestionIds: [...solvedIds],
        completed,
        score: nextScore,
        completedAt,
      })
      .onConflictDoUpdate({
        target: [stageProgressTable.clerkUserId, stageProgressTable.stageId],
        set: {
          solvedQuestionIds: [...solvedIds],
          completed,
          score: nextScore,
          completedAt,
          updatedAt: new Date(),
        },
      });

    const results = stage.entries.map((entry) => ({
      questionId: entry.questionId,
      correct: correctById.get(entry.questionId) ?? false,
    }));
    await tx.insert(gameAttemptsTable).values({
      clerkUserId: userId,
      stageId: stage.id,
      correctCount: results.filter((item) => item.correct).length,
      incorrectCount: results.filter((item) => !item.correct).length,
      scoreEarned,
    });

    return {
      results,
      passwordCorrect,
      stageComplete: completed,
      nextStageId: completed && stage.id < gameStages.length ? stage.id + 1 : null,
      scoreEarned,
      message: completedNow
        ? "أحسنت! أُكملت المرحلة وفُتحت المرحلة التالية."
        : completed
          ? "هذه المرحلة مكتملة بالفعل."
          : allSolved
            ? "الإجابات صحيحة؛ راجع حروف كلمة السر."
            : "تم فحص الإجابات. أكمل الحل وحاول مرة أخرى.",
    };
  });

  const progress = await db
    .select({ score: stageProgressTable.score })
    .from(stageProgressTable)
    .where(eq(stageProgressTable.clerkUserId, userId));
  const totalScore = progress.reduce((sum, item) => sum + item.score, 0);
  res.json(
    SubmitStageAttemptResponse.parse({
      ...result,
      totalScore,
    }),
  );
});

router.get("/leaderboard", async (_req, res): Promise<void> => {
  const profiles = await db
    .select({
      clerkUserId: gameProfilesTable.clerkUserId,
      displayName: gameProfilesTable.displayName,
    })
    .from(gameProfilesTable);
  const progress = await db.select().from(stageProgressTable);
  const totals = new Map<string, { score: number; completedStages: number }>();
  for (const profile of profiles) {
    totals.set(profile.clerkUserId, { score: 0, completedStages: 0 });
  }
  for (const item of progress) {
    const total = totals.get(item.clerkUserId);
    if (!total) continue;
    total.score += item.score;
    if (item.completed) total.completedStages += 1;
  }

  const ranked = profiles
    .map((profile) => ({
      displayName: profile.displayName,
      score: totals.get(profile.clerkUserId)?.score ?? 0,
      completedStages:
        totals.get(profile.clerkUserId)?.completedStages ?? 0,
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.completedStages - a.completedStages ||
        a.displayName.localeCompare(b.displayName, "ar"),
    )
    .slice(0, 50)
    .map((player, index) => ({ rank: index + 1, ...player }));

  res.json(GetLeaderboardResponse.parse(ranked));
});

export default router;
