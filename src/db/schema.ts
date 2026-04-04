import { pgTable, text, timestamp, boolean, integer, uuid } from 'drizzle-orm/pg-core';

// ── POLLS ──────────────────────────────────────────────────────────────────
export const polls = pgTable('polls', {
  id: uuid('id').defaultRandom().primaryKey(),
  shortId: text('short_id').notNull().unique(),
  question: text('question').notNull(),
  type: text('type', { enum: ['single', 'multiple'] }).notNull().default('single'),
  anonymous: boolean('anonymous').notNull().default(true),
  deadline: timestamp('deadline', { withTimezone: true }),
  creatorToken: text('creator_token').notNull(),
  closed: boolean('closed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── OPTIONS ────────────────────────────────────────────────────────────────
export const options = pgTable('options', {
  id: uuid('id').defaultRandom().primaryKey(),
  pollId: uuid('poll_id')
    .notNull()
    .references(() => polls.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  position: integer('position').notNull().default(0),
});

// ── VOTES ──────────────────────────────────────────────────────────────────
export const votes = pgTable('votes', {
  id: uuid('id').defaultRandom().primaryKey(),
  pollId: uuid('poll_id')
    .notNull()
    .references(() => polls.id, { onDelete: 'cascade' }),
  optionId: uuid('option_id')
    .notNull()
    .references(() => options.id, { onDelete: 'cascade' }),
  voterName: text('voter_name'),
  fingerprint: text('fingerprint').notNull(),
  ipHash: text('ip_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── TYPES ──────────────────────────────────────────────────────────────────
export type Poll = typeof polls.$inferSelect;
export type NewPoll = typeof polls.$inferInsert;
export type Option = typeof options.$inferSelect;
export type NewOption = typeof options.$inferInsert;
export type Vote = typeof votes.$inferSelect;
export type NewVote = typeof votes.$inferInsert;
