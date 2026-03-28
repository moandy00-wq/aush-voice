import { z } from 'zod/v4'

export const transcriptEntrySchema = z.object({
  role: z.enum(['agent', 'user']),
  message: z.string().nullable().optional(),
}).passthrough()

export const webhookPayloadSchema = z.object({
  type: z.string(),
  data: z.object({
    conversation_id: z.string(),
    status: z.string().optional(),
    transcript: z.array(transcriptEntrySchema).optional(),
    analysis: z.object({
      call_successful: z.string().optional(),
      data_collection_results: z.record(
        z.string(),
        z.object({
          value: z.any(),
        }).passthrough()
      ).optional(),
    }).passthrough().optional(),
  }).passthrough(),
}).passthrough()

export type WebhookPayload = z.infer<typeof webhookPayloadSchema>
