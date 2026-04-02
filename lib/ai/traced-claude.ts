import type { MessageParam, Message } from "@anthropic-ai/sdk/resources/messages"
import { getClaudeClient } from "@/lib/ai/claude"
import { getLangfuseClient } from "@/lib/langfuse/client"
import { getModel, getMaxTokens } from "@/lib/ai/config"
import { logger } from "@/lib/logger"

export async function tracedClaude(
  traceName: string,
  messages: MessageParam[],
  options?: {
    model?: string
    max_tokens?: number
    system?: string
    workspaceId?: string
    // Enable prompt caching on system prompt — saves ~90% on repeated input tokens
    cacheSystem?: boolean
  }
): Promise<Message> {
  const model = options?.model ?? getModel(traceName)
  const max_tokens = options?.max_tokens ?? getMaxTokens(traceName)

  const langfuse = getLangfuseClient()
  const trace = langfuse.trace({ name: traceName, metadata: { workspaceId: options?.workspaceId } })
  const generation = trace.generation({ name: traceName, model, input: messages })

  const claude = getClaudeClient()

  // Prompt caching: mark the system prompt as cacheable when the same system is
  // used repeatedly (idea generation, content generation loops).
  const systemParam: any = options?.cacheSystem && options?.system
    ? [{ type: "text", text: options.system, cache_control: { type: "ephemeral" } }]
    : options?.system

  const response = await (claude.messages.create as any)({
    model,
    max_tokens,
    ...(systemParam !== undefined ? { system: systemParam } : {}),
    messages,
    // Prompt caching is now GA — no beta flag needed. cache_control on system block is sufficient.
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
