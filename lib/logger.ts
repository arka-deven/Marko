import pino from "pino"

const targets: pino.TransportTargetOptions[] = [
  // Always log to stdout (picked up by Vercel / local terminal)
  {
    target: "pino/file",
    options: { destination: 1 }, // stdout
    level: process.env.LOG_LEVEL || "info",
  },
]

// In production, also ship logs to Axiom
if (process.env.AXIOM_TOKEN && process.env.AXIOM_DATASET) {
  targets.push({
    target: "@axiomhq/pino",
    options: {
      dataset: process.env.AXIOM_DATASET,
      token: process.env.AXIOM_TOKEN,
    },
    level: process.env.LOG_LEVEL || "info",
  })
}

const useTransport = targets.length > 1

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  // formatters are not allowed when using transport.targets
  ...(!useTransport && {
    formatters: {
      level: (label) => ({ level: label }),
    },
  }),
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(useTransport ? { transport: { targets } } : {}),
})
