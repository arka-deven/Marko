import type { MessageParam, Message } from "@anthropic-ai/sdk/resources/messages"
import { getClaudeClient } from "@/lib/ai/claude"
import { getLangfuseClient } from "@/lib/langfuse/client"
import { logger } from "@/lib/logger"

const AI_MODEL = "claude-sonnet-4-20250514"
const AI_MAX_TOKENS = 2048

export async function tracedClaude(
  traceName: string,
  messages: MessageParam[],
  options?: {
    model?: string
    max_tokens?: number
    system?: string
    workspaceId?: string
  }
): Promise<Message> {
  const model = options?.model ?? AI_MODEL
  const max_tokens = options?.max_tokens ?? AI_MAX_TOKENS

  const langfuse = getLangfuseClient()
  const trace = langfuse.trace({ name: traceName, metadata: { workspaceId: options?.workspaceId } })
  const generation = trace.generation({ name: traceName, model, input: messages })

  const claude = getClaudeClient()
  const response = await claude.messages.create({
    model,
    max_tokens,
    system: options?.system,
    messages,
  })

  generation.end({
    output: response.content,
    usage: {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
    },
  })

  try {
    await Promise.race([
      langfuse.flushAsync(),
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ])
  } catch (err) {
    logger.warn({ err, trace: traceName }, "Langfuse flush failed")
  }

  return response
}
