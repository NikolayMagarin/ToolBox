import { z } from 'zod';

const messageSchema = z
  .object({
    role: z.literal('system'),
    content: z.string().nonempty(),
  })
  .or(
    z.object({
      role: z.literal('user'),
      content: z
        .string()
        .nonempty()
        .or(
          z.array(
            z
              .object({
                type: z.literal('text'),
                text: z.string().nonempty(),
              })
              .or(
                z.object({
                  type: z.literal('image_url'),
                  image_url: z.object({
                    url: z.string().nonempty(),
                    detail: z.enum(['auto', 'low', 'high']),
                  }),
                })
              )
          )
        ),
    })
  )
  .or(
    z.object({
      role: z.literal('assistant'),
      content: z.string().or(z.null()).optional(),
      reasoning: z.string().optional(),
      tool_calls: z
        .array(
          z.object({
            id: z.string(),
            function: z.object({ arguments: z.string(), name: z.string() }),
            type: z.literal('function'),
          })
        )
        .optional(),
    })
  )
  .or(
    z.object({
      role: z.literal('tool'),
      content: z.string(),
      tool_call_id: z.string(),
    })
  );

export const chatCompletionSchema = z.object({
  model: z.string().default('llama-3.1-8b-instant'),
  messages: z.array(messageSchema).min(1),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  n: z.literal(1).optional(),
  stream: z.boolean().default(false),
  reasoning_format: z.enum(['hidden', 'raw', 'parsed']).optional(),
  stop: z.union([z.string(), z.array(z.string())]).optional(),
  max_tokens: z.number().int().positive().optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  functions: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        parameters: z.object({}).passthrough().optional(),
      })
    )
    .optional(),
  function_call: z
    .union([
      z.literal('none'),
      z.literal('auto'),
      z.object({
        name: z.string(),
      }),
    ])
    .optional(),
});
