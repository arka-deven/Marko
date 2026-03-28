import { describe, it, expect } from "vitest"
import {
  ExperimentCreateSchema,
  ExperimentPatchSchema,
  ExperimentStatusSchema,
  IdeaCreateSchema,
  IdeaPatchSchema,
  AutomationPatchSchema,
  ProfilePatchSchema,
} from "@/lib/api/validate"

// ── ExperimentCreateSchema ──────────────────────────────────────────

describe("ExperimentCreateSchema", () => {
  it("accepts valid experiment", () => {
    const result = ExperimentCreateSchema.safeParse({
      name: "Test Experiment",
      channel: "Web",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty name", () => {
    const result = ExperimentCreateSchema.safeParse({
      name: "",
      channel: "Web",
    })
    expect(result.success).toBe(false)
  })

  it("rejects missing name", () => {
    const result = ExperimentCreateSchema.safeParse({
      channel: "Web",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid channel", () => {
    const result = ExperimentCreateSchema.safeParse({
      name: "Test",
      channel: "InvalidChannel",
    })
    expect(result.success).toBe(false)
  })

  it("accepts all valid channels", () => {
    for (const ch of ["Web", "Email", "Paid", "Social", "Push"]) {
      const result = ExperimentCreateSchema.safeParse({ name: "T", channel: ch })
      expect(result.success).toBe(true)
    }
  })

  it("accepts optional description", () => {
    const result = ExperimentCreateSchema.safeParse({
      name: "Test",
      channel: "Email",
      description: "A test experiment",
    })
    expect(result.success).toBe(true)
  })

  it("rejects name exceeding 200 chars", () => {
    const result = ExperimentCreateSchema.safeParse({
      name: "x".repeat(201),
      channel: "Web",
    })
    expect(result.success).toBe(false)
  })

  it("rejects description exceeding 1000 chars", () => {
    const result = ExperimentCreateSchema.safeParse({
      name: "Test",
      channel: "Web",
      description: "x".repeat(1001),
    })
    expect(result.success).toBe(false)
  })

  it("accepts optional idea_id as valid uuid", () => {
    const result = ExperimentCreateSchema.safeParse({
      name: "Test",
      channel: "Web",
      idea_id: "550e8400-e29b-41d4-a716-446655440000",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid idea_id", () => {
    const result = ExperimentCreateSchema.safeParse({
      name: "Test",
      channel: "Web",
      idea_id: "not-a-uuid",
    })
    expect(result.success).toBe(false)
  })
})

// ── ExperimentPatchSchema ───────────────────────────────────────────

describe("ExperimentPatchSchema", () => {
  it("accepts partial update with name only", () => {
    const result = ExperimentPatchSchema.safeParse({ name: "Updated" })
    expect(result.success).toBe(true)
  })

  it("accepts partial update with status only", () => {
    const result = ExperimentPatchSchema.safeParse({ status: "running" })
    expect(result.success).toBe(true)
  })

  it("rejects empty object (refine rule)", () => {
    const result = ExperimentPatchSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("rejects invalid status", () => {
    const result = ExperimentPatchSchema.safeParse({ status: "unknown" })
    expect(result.success).toBe(false)
  })

  it("accepts confidence within 0-100", () => {
    expect(ExperimentPatchSchema.safeParse({ confidence: 0 }).success).toBe(true)
    expect(ExperimentPatchSchema.safeParse({ confidence: 100 }).success).toBe(true)
  })

  it("rejects confidence outside 0-100", () => {
    expect(ExperimentPatchSchema.safeParse({ confidence: -1 }).success).toBe(false)
    expect(ExperimentPatchSchema.safeParse({ confidence: 101 }).success).toBe(false)
  })

  it("accepts lift and revenue_attributed as numbers", () => {
    const result = ExperimentPatchSchema.safeParse({ lift: 12.5, revenue_attributed: 9999 })
    expect(result.success).toBe(true)
  })
})

// ── ExperimentStatusSchema ──────────────────────────────────────────

describe("ExperimentStatusSchema", () => {
  it("accepts valid status", () => {
    for (const s of ["draft", "running", "winner", "failed", "paused"]) {
      expect(ExperimentStatusSchema.safeParse({ status: s }).success).toBe(true)
    }
  })

  it("rejects invalid status", () => {
    expect(ExperimentStatusSchema.safeParse({ status: "stopped" }).success).toBe(false)
  })

  it("rejects missing status", () => {
    expect(ExperimentStatusSchema.safeParse({}).success).toBe(false)
  })
})

// ── IdeaCreateSchema ────────────────────────────────────────────────

describe("IdeaCreateSchema", () => {
  it("accepts valid idea", () => {
    const result = IdeaCreateSchema.safeParse({
      title: "New Idea",
      channel: "Social",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty title", () => {
    expect(IdeaCreateSchema.safeParse({ title: "", channel: "Web" }).success).toBe(false)
  })

  it("rejects title exceeding 200 chars", () => {
    expect(IdeaCreateSchema.safeParse({ title: "x".repeat(201), channel: "Web" }).success).toBe(false)
  })

  it("accepts optional effort enum", () => {
    for (const e of ["Low", "Medium", "High"]) {
      expect(IdeaCreateSchema.safeParse({ title: "T", channel: "Web", effort: e }).success).toBe(true)
    }
  })

  it("rejects invalid effort", () => {
    expect(IdeaCreateSchema.safeParse({ title: "T", channel: "Web", effort: "Extreme" }).success).toBe(false)
  })
})

// ── IdeaPatchSchema ─────────────────────────────────────────────────

describe("IdeaPatchSchema", () => {
  it("accepts status update", () => {
    expect(IdeaPatchSchema.safeParse({ status: "ready" }).success).toBe(true)
  })

  it("rejects empty object (refine rule)", () => {
    expect(IdeaPatchSchema.safeParse({}).success).toBe(false)
  })

  it("rejects invalid status", () => {
    expect(IdeaPatchSchema.safeParse({ status: "archived" }).success).toBe(false)
  })

  it("accepts all valid statuses", () => {
    for (const s of ["queued", "ready", "launched", "dismissed"]) {
      expect(IdeaPatchSchema.safeParse({ status: s }).success).toBe(true)
    }
  })
})

// ── AutomationPatchSchema ───────────────────────────────────────────

describe("AutomationPatchSchema", () => {
  it("accepts active status", () => {
    expect(AutomationPatchSchema.safeParse({ status: "active" }).success).toBe(true)
  })

  it("accepts paused status", () => {
    expect(AutomationPatchSchema.safeParse({ status: "paused" }).success).toBe(true)
  })

  it("rejects invalid status", () => {
    expect(AutomationPatchSchema.safeParse({ status: "disabled" }).success).toBe(false)
  })

  it("rejects missing status", () => {
    expect(AutomationPatchSchema.safeParse({}).success).toBe(false)
  })
})

// ── ProfilePatchSchema ──────────────────────────────────────────────

describe("ProfilePatchSchema", () => {
  it("accepts profile with full_name", () => {
    const result = ProfilePatchSchema.safeParse({
      profile: { full_name: "Alice" },
    })
    expect(result.success).toBe(true)
  })

  it("accepts workspace with name", () => {
    const result = ProfilePatchSchema.safeParse({
      workspace: { name: "Acme" },
    })
    expect(result.success).toBe(true)
  })

  it("accepts both profile and workspace", () => {
    const result = ProfilePatchSchema.safeParse({
      profile: { notification_weekly_digest: true },
      workspace: { website: "https://acme.com" },
    })
    expect(result.success).toBe(true)
  })

  it("rejects full_name exceeding 100 chars", () => {
    const result = ProfilePatchSchema.safeParse({
      profile: { full_name: "x".repeat(101) },
    })
    expect(result.success).toBe(false)
  })

  it("rejects workspace name exceeding 100 chars", () => {
    const result = ProfilePatchSchema.safeParse({
      workspace: { name: "x".repeat(101) },
    })
    expect(result.success).toBe(false)
  })
})
