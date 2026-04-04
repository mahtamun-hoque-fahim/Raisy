import { z } from 'zod';

export const CreatePollSchema = z.object({
  question: z.string().min(3, 'Question must be at least 3 characters').max(280, 'Question too long'),
  options: z
    .array(z.string().min(1, 'Option cannot be empty').max(120, 'Option too long'))
    .min(2, 'Need at least 2 options')
    .max(10, 'Maximum 10 options'),
  type: z.enum(['single', 'multiple']).default('single'),
  anonymous: z.boolean().default(true),
  deadlineHours: z.number().min(0).max(720).optional().nullable(),
});

export const CastVoteSchema = z.object({
  pollId: z.string().uuid(),
  optionIds: z.array(z.string().uuid()).min(1, 'Select at least one option'),
  voterName: z.string().max(60).optional().nullable(),
  fingerprint: z.string().min(1),
});

export type CreatePollInput = z.infer<typeof CreatePollSchema>;
export type CastVoteInput = z.infer<typeof CastVoteSchema>;
