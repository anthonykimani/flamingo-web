'use client'

import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { UserIcon, TrophyIcon } from '@phosphor-icons/react'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getLeaderboard } from '@/services/quiz_service'
import { IPlayer } from '@/interfaces/IQuiz'
import NavigationBar from '../navigation/navigation-bar'

const ScoreBoardPage = () => {
  const [leaderboard, setLeaderboard] = useState<IPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!sessionId) return

      try {
        const response = await getLeaderboard(sessionId)
        setLeaderboard(response.payload)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error)
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [sessionId])

  if (loading) {
    return (
      <div className="result-background flex h-screen items-center justify-center bg-cover bg-no-repeat">
        <Card className="mx-4 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <div className="animate-pulse text-lg sm:text-2xl">Loading final scores...</div>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="result-background flex min-h-screen flex-col items-center justify-center bg-cover bg-no-repeat p-3 py-6 sm:p-4 sm:py-8">
      <div className="w-full max-w-3xl space-y-4 sm:space-y-8">
        <div className="mb-4 flex flex-row justify-between sm:items-center">
          <NavigationBar />
        </div>

        <div className="space-y-2 text-center sm:space-y-4">
          <h1 className="xs:text-4xl font-[Oi] text-3xl text-white [-webkit-text-stroke:1px_black] sm:text-5xl sm:[-webkit-text-stroke:2px_black] md:text-7xl md:[-webkit-text-stroke:3px_black]">
            Flamingo
          </h1>
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <TrophyIcon size={28} weight="fill" className="text-yellow-400 sm:hidden" />
            <TrophyIcon size={40} weight="fill" className="hidden text-yellow-400 sm:block" />
            <h2 className="xs:text-2xl text-xl font-bold text-white drop-shadow-lg sm:text-3xl md:text-4xl">
              Final Results
            </h2>
            <TrophyIcon size={28} weight="fill" className="text-yellow-400 sm:hidden" />
            <TrophyIcon size={40} weight="fill" className="hidden text-yellow-400 sm:block" />
          </div>
        </div>

        {/* Leaderboard Card */}
        <Card className="bg-white/95 shadow-2xl backdrop-blur-sm">
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-2 sm:space-y-3">
              {leaderboard.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500 sm:text-base">
                  No scores to display
                </p>
              ) : (
                leaderboard.map((player, index) => (
                  <div
                    key={player.id}
                    className={`xs:gap-3 xs:p-3 flex items-center gap-2 rounded-lg p-2 transition-all sm:gap-4 sm:p-4 ${
                      index === 0
                        ? 'border-2 border-yellow-400 bg-gradient-to-r from-yellow-100 to-yellow-50'
                        : index === 1
                          ? 'border-2 border-gray-400 bg-gradient-to-r from-gray-100 to-gray-50'
                          : index === 2
                            ? 'border-2 border-orange-400 bg-gradient-to-r from-orange-100 to-orange-50'
                            : 'bg-slate-50'
                    } `}
                  >
                    {/* Rank */}
                    <div className="xs:text-2xl xs:w-10 w-8 shrink-0 text-center text-xl font-bold sm:w-12 sm:text-3xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </div>

                    {/* Player Icon & Name */}
                    <div className="xs:gap-3 flex min-w-0 flex-1 items-center gap-2">
                      <div
                        className={`xs:p-2.5 xs:rounded-xl shrink-0 rounded-lg border-2 p-2 sm:p-3 ${
                          index === 0
                            ? 'border-yellow-400 bg-yellow-200'
                            : index === 1
                              ? 'border-gray-400 bg-gray-200'
                              : index === 2
                                ? 'border-orange-400 bg-orange-200'
                                : 'border-slate-300 bg-white'
                        } `}
                      >
                        <UserIcon size={20} weight="bold" className="xs:hidden text-slate-700" />
                        <UserIcon
                          size={24}
                          weight="bold"
                          className="xs:block hidden text-slate-700 sm:hidden"
                        />
                      </div>
                      <h3 className="xs:text-base truncate text-sm font-semibold sm:text-xl md:text-2xl">
                        {player.playerName}
                      </h3>
                    </div>

                    {/* Score */}
                    <div className="shrink-0 text-right">
                      <div className="xs:text-2xl text-xl font-bold text-slate-700 sm:text-3xl md:text-4xl">
                        {player.totalScore}
                      </div>
                      <div className="xs:text-xs text-[10px] text-slate-500">points</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ScoreBoardPage
