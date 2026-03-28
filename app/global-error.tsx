"use client"

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", background: "#0a0a0a", color: "#fff" }}>
          <div style={{ textAlign: "center", maxWidth: 400 }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Something went wrong</h1>
            <p style={{ color: "#888", marginBottom: 24 }}>A critical error occurred. Please try again.</p>
            <button
              onClick={reset}
              style={{ padding: "10px 24px", background: "#a3e635", color: "#000", borderRadius: 6, border: "none", fontWeight: 600, cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
