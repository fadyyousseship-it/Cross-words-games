import { and, asc, eq, isNotNull } from "drizzle-orm";
import { clerkClient, getAuth } from "@clerk/express";
import { Router, type IRouter, type Request, type Response } from "express";
import {
  GetGameDashboardResponse,
  GetAdminAccessResponse,
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
import {
  STAGE_CONGRATS,
  STAGE_PASSWORD,
  gameStages,
  getStage,
  normalizeArabicAnswer,
} from "../lib/game-content";

const router: IRouter = Router();

function authenticatedUserId(req: Request, res: Response): string | undefined {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Sign in to continue." });
    return undefined;
  }
  return userId;
}

async function isConfiguredAdmin(userId: string): Promise<boolean> {
  const configuredEmails = (process.env.GAME_ADMIN_EMAIL ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (configuredEmails.length === 0) return false;

  const user = await clerkClient.users.getUser(userId);
  const primaryEmail = user.primaryEmailAddress;
  return (
    primaryEmail?.verification?.status === "verified" &&
    configuredEmails.includes(primaryEmail.emailAddress.trim().toLowerCase())
  );
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
  const currentStageIds = new Set(gameStages.map((stage) => stage.id));
  const currentProgress = progress.filter((item) =>
    currentStageIds.has(item.stageId),
  );
  const progressByStage = new Map(
    currentProgress.map((item) => [item.stageId, item]),
  );
  const isStageComplete = (stage: (typeof gameStages)[number]) => {
    const stageProgress = progressByStage.get(stage.id);
    return (
      stageProgress?.completed === true &&
      stage.entries.every((entry) =>
        (stageProgress.solvedQuestionIds ?? []).includes(entry.questionId),
      )
    );
  };
  const completedCount = gameStages.filter(isStageComplete).length;
  const totalScore = currentProgress.reduce(
    (total, item) => total + item.score,
    0,
  );
  const activeStage = gameStages.find(
    (stage) => !isStageComplete(stage),
  );

  const stages = gameStages.map((stage) => {
    const stageProgress = progressByStage.get(stage.id);
    const previousComplete =
      stage.id === gameStages[0]?.id ||
      (stage.id > 1 &&
        gameStages.some(
          (previousStage) =>
            previousStage.id === stage.id - 1 && isStageComplete(previousStage),
        ));
    return {
      id: stage.id,
      title: stage.title,
      theme: stage.theme,
      state: isStageComplete(stage)
        ? "completed"
        : previousComplete
          ? "available"
          : "locked",
      points: stageProgress?.score ?? 0,
    };
  });

  const recentActivity = progress
    .filter(
      (item) =>
        item.completed &&
        item.completedAt &&
        currentStageIds.has(item.stageId) &&
        isStageComplete(gameStages.find((stage) => stage.id === item.stageId)!),
    )
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

router.get("/admin/access", async (req, res): Promise<void> => {
  const userId = authenticatedUserId(req, res);
  if (!userId) return;

  res.json(
    GetAdminAccessResponse.parse({
      isAdmin: await isConfiguredAdmin(userId),
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
    const alreadyCompleted = existing?.completed === true && allSolved;
    const phraseSubmitted = Boolean(body.data.completionPhrase?.trim());
    const phraseCorrect =
      normalizeArabicAnswer(body.data.completionPhrase ?? "") ===
      normalizeArabicAnswer(STAGE_PASSWORD);
    const requiresCompletionPhrase = stage.id === gameStages.at(-1)?.id;
    const completed =
      alreadyCompleted ||
      (allSolved && (!requiresCompletionPhrase || phraseCorrect));
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
      stageComplete: completed,
      nextStageId: completed
        ? gameStages[gameStages.findIndex((item) => item.id === stage.id) + 1]
            ?.id ?? null
        : null,
      scoreEarned,
      message: completedNow
        ? stage.id === gameStages.length
          ? "تهانينا! أتممت جميع الأسئلة."
          : "أحسنت! أُكملت المرحلة وفُتحت المرحلة التالية."
        : completed
          ? "هذه المرحلة مكتملة بالفعل."
          : allSolved && requiresCompletionPhrase
            ? phraseSubmitted
              ? "كلمة السر غير صحيحة، راجع الخانات الذهبية وحاول مرة أخرى."
              : "أحسنت! اكتملت الأسئلة. اكتب كلمة السر لإتمام الرحلة."
            : "تم فحص الإجابات. أكمل الحل وحاول مرة أخرى.",
      ...(completed ? { congratsMessage: STAGE_CONGRATS } : {}),
    };
  });

  const progress = await db
    .select({
      stageId: stageProgressTable.stageId,
      score: stageProgressTable.score,
    })
    .from(stageProgressTable)
    .where(eq(stageProgressTable.clerkUserId, userId));
  const currentStageIds = new Set(gameStages.map((stage) => stage.id));
  const totalScore = progress
    .filter((item) => currentStageIds.has(item.stageId))
    .reduce((sum, item) => sum + item.score, 0);
  res.json(
    SubmitStageAttemptResponse.parse({
      ...result,
      totalScore,
    }),
  );
});

router.get("/leaderboard", async (req, res): Promise<void> => {
  const userId = authenticatedUserId(req, res);
  if (!userId) return;
  if (!(await isConfiguredAdmin(userId))) {
    res.status(403).json({ error: "Administrator access required." });
    return;
  }

  const finalStageId = gameStages[gameStages.length - 1].id;
  const finishers = await db
    .select({
      displayName: gameProfilesTable.displayName,
      completedAt: stageProgressTable.completedAt,
      solvedQuestionIds: stageProgressTable.solvedQuestionIds,
    })
    .from(stageProgressTable)
    .innerJoin(
      gameProfilesTable,
      eq(gameProfilesTable.clerkUserId, stageProgressTable.clerkUserId),
    )
    .where(
      and(
        eq(stageProgressTable.stageId, finalStageId),
        eq(stageProgressTable.completed, true),
        isNotNull(stageProgressTable.completedAt),
      ),
    )
    .orderBy(
      asc(stageProgressTable.completedAt),
      asc(stageProgressTable.id),
    )
  const completedQuestionIds = new Set(
    gameStages[gameStages.length - 1].entries.map((entry) => entry.questionId),
  );
  const ranked = finishers
    .filter((player) =>
      [...completedQuestionIds].every((questionId) =>
        player.solvedQuestionIds.includes(questionId),
      ),
    )
    .slice(0, 3)
    .map((player, index) => ({
    rank: index + 1,
    displayName: player.displayName,
    completedAt: player.completedAt!.toISOString(),
    }));
  res.json(GetLeaderboardResponse.parse(ranked));
});

export default router;
