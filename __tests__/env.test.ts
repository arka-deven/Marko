import { describe, it, expect } from "vitest"
import { z } from "zod"

describe("env validation schema", () => {
  it("requires NEXT_PUBLIC_SUPABASE_URL to be a URL", () => {
    const schema = z.object({
      NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    })

    expect(schema.safeParse({ NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co" }).success).toBe(true)
    expect(schema.safeParse({ NEXT_PUBLIC_SUPABASE_URL: "not-a-url" }).success).toBe(false)
    expect(schema.safeParse({}).success).toBe(false)
  })

  it("requires NEXT_PUBLIC_SUPABASE_ANON_KEY to be non-empty string", () => {
    const schema = z.object({
      NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    })

    expect(schema.safeParse({ NEXT_PUBLIC_SUPABASE_ANON_KEY: "some-key" }).success).toBe(true)
    expect(schema.safeParse({ NEXT_PUBLIC_SUPABASE_ANON_KEY: "" }).success).toBe(false)
    expect(schema.safeParse({}).success).toBe(false)
  })

  it("validates combined env schema", () => {
    const schema = z.object({
      NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    })

    const valid = {
      NEXT_PUBLIC_SUPABASE_URL: "https://proj.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
    }
    expect(schema.safeParse(valid).success).toBe(true)

    const missing = { NEXT_PUBLIC_SUPABASE_URL: "https://proj.supabase.co" }
    expect(schema.safeParse(missing).success).toBe(false)
  })
})
