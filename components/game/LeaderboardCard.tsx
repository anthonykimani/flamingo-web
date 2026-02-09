'use client'

import { Card, CardHeader } from '@/components/ui/card'
import type { IPlayer } from '@/interfaces/IQuiz'

type LeaderboardCardProps = {
  title?: string
  leaderboard: IPlayer[]
  highlightPlayerName?: string
  maxHeightClassName?: string
}

export function LeaderboardCard({
  title = 'Leaderboard',
  leaderboard,
  highlightPlayerName,
  maxHeightClassName,
}: LeaderboardCardProps) {
  return (
    <Card className="bg-white/95 backdrop-blur-sm">
      <CardHeader className="py-6">
        <h3 className="mb-6 text-center text-2xl font-bold">{title}</h3>
        <div className={['space-y-3', maxHeightClassName].filter(Boolean).join(' ')}>
          {leaderboard.length === 0 ? (
            <p className="py-8 text-center text-gray-500">Loading scores...</p>
          ) : (
            leaderboard.map((player, index) => {
              const isHighlighted = Boolean(
                highlightPlayerName && player.playerName === highlightPlayerName
              )
              return (
                <div
                  key={player.id}
                  className={
                    isHighlighted
                      ? 'flex items-center gap-4 rounded-lg border-2 border-blue-400 bg-blue-100 p-4'
                      : 'flex items-center gap-4 rounded-lg bg-slate-50 p-4'
                  }
                >
                  <div className="w-10 text-center text-2xl font-bold">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>
                  <h3 className="flex-1 truncate text-xl font-semibold">
                    {player.playerName}
                    {isHighlighted && <span className="ml-2 text-sm text-blue-600">(You)</span>}
                  </h3>
                  <div className="text-2xl font-bold text-slate-700">{player.totalScore}</div>
                </div>
              )
            })
          )}
        </div>
      </CardHeader>
    </Card>
  )
}
