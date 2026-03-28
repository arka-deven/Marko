import { describe, it, expect } from "vitest"
import { apiError, handleApiError } from "@/lib/api/errors"

describe("apiError", () => {
  it("returns response with correct status", () => {
    const res = apiError("Not found", 404)
    expect(res.status).toBe(404)
  })

  it("returns JSON body with error field", async () => {
    const res = apiError("Unauthorized", 401)
    const body = await res.json()
    expect(body.error).toBe("Unauthorized")
  })

  it("returns 400 for bad request", async () => {
    const res = apiError("Bad request", 400)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe("Bad request")
  })
})

describe("handleApiError", () => {
  it("returns 500 status", () => {
    const res = handleApiError(new Error("db crash"))
    expect(res.status).toBe(500)
  })

  it("returns generic message without leaking internals", async () => {
    const res = handleApiError(new Error("db crash"))
    const body = await res.json()
    expect(body.error).toBe("Internal server error")
    expect(body.error).not.toContain("db crash")
  })

  it("handles non-Error objects", () => {
    const res = handleApiError("string error")
    expect(res.status).toBe(500)
  })

  it("handles null/undefined", async () => {
    const res = handleApiError(null)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe("Internal server error")
  })
})
