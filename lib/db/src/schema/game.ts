import { createInsertSchema } from "drizzle-zod";
import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const gameProfilesTable = pgTable(
  "game_profiles",
  {
    id: serial("id").primaryKey(),
    clerkUserId: text("clerk_user_id").notNull().unique(),
    displayName: text("display_name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("game_profiles_clerk_user_id_idx").on(table.clerkUserId)],
);

export const stageProgressTable = pgTable(
  "stage_progress",
  {
    id: serial("id").primaryKey(),
    clerkUserId: text("clerk_user_id").notNull(),
    stageId: integer("stage_id").notNull(),
    solvedQuestionIds: integer("solved_question_ids")
      .array()
      .notNull()
      .default([]),
    completed: boolean("completed").notNull().default(false),
    score: integer("score").notNull().default(0),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("stage_progress_user_stage_idx").on(
      table.clerkUserId,
      table.stageId,
    ),
    index("stage_progress_user_idx").on(table.clerkUserId),
  ],
);

export const gameAttemptsTable = pgTable(
  "game_attempts",
  {
    id: serial("id").primaryKey(),
    clerkUserId: text("clerk_user_id").notNull(),
    stageId: integer("stage_id").notNull(),
    correctCount: integer("correct_count").notNull().default(0),
    incorrectCount: integer("incorrect_count").notNull().default(0),
    scoreEarned: integer("score_earned").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("game_attempts_user_created_idx").on(table.clerkUserId, table.createdAt)],
);

export const insertGameProfileSchema = createInsertSchema(gameProfilesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertStageProgressSchema = createInsertSchema(stageProgressTable).omit({
  id: true,
  updatedAt: true,
});
export const insertGameAttemptSchema = createInsertSchema(gameAttemptsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertGameProfile = z.infer<typeof insertGameProfileSchema>;
export type GameProfile = typeof gameProfilesTable.$inferSelect;
export type InsertStageProgress = z.infer<typeof insertStageProgressSchema>;
export type StageProgress = typeof stageProgressTable.$inferSelect;
export type InsertGameAttempt = z.infer<typeof insertGameAttemptSchema>;
export type GameAttempt = typeof gameAttemptsTable.$inferSelect;
