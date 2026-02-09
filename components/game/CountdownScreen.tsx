'use client'

type CountdownScreenProps = {
  countdown: number
  subtitle?: string
}

export function CountdownScreen({ countdown, subtitle = 'Get Ready!' }: CountdownScreenProps) {
  return (
    <div className="game-pin-background flex h-screen items-center justify-center bg-cover bg-no-repeat">
      <div className="text-center">
        <div className="mb-4 animate-pulse text-9xl font-bold text-white">{countdown}</div>
        <p className="text-2xl text-white">{subtitle}</p>
      </div>
    </div>
  )
}
