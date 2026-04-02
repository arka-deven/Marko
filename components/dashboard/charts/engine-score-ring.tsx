"use client"

interface EngineScoreRingProps {
  score: number // 0–100
}

export function EngineScoreRing({ score }: EngineScoreRingProps) {
  const radius = 40
  const stroke = 6
  const normalizedRadius = radius - stroke / 2
  const circumference = 2 * Math.PI * normalizedRadius
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 75 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400"

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-[88px] h-[88px]">
        <svg width="88" height="88" className="-rotate-90">
          <circle
            cx="44"
            cy="44"
            r={normalizedRadius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-border"
          />
          <circle
            cx="44"
            cy="44"
            r={normalizedRadius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={color}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-black tracking-tighter ${color}`}>{score}</span>
        </div>
      </div>
    </div>
  )
}
