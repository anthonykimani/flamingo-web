'use client'

import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserIcon, TrophyIcon, GameControllerIcon, CheckCircle, XCircle } from '@phosphor-icons/react'
import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getLeaderboard } from '@/services/quiz_service'
import { IPlayer } from '@/interfaces/IQuiz'
import NavigationBar from '../navigation/navigation-bar'

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉']

const PodiumHeight = (index: number): string => {
  if (index === 0) return 'h-24'
  if (index === 1) return 'h-20'
  if (index === 2) return 'h-16'
  return 'h-0'
}

const RowBg = (index: number): string => {
  if (index === 0) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400'
  if (index === 1) return 'bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-gray-400'
  if (index === 2) return 'bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-400'
  return index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
}

const ScoreBoardPage = () => {
    const [leaderboard, setLeaderboard] = useState<IPlayer[]>([])
    const [loading, setLoading] = useState(true)
    const [visibleRows, setVisibleRows] = useState(0)
    const searchParams = useSearchParams()
    const router = useRouter()
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

    useEffect(() => {
        if (loading || leaderboard.length === 0) return

        const timer = setInterval(() => {
            setVisibleRows(prev => {
                if (prev >= leaderboard.length) {
                    clearInterval(timer)
                    return prev
                }
                return prev + 1
            })
        }, 150)

        return () => clearInterval(timer)
    }, [loading, leaderboard.length])

    const topScore = leaderboard[0]?.totalScore || 1

    if (loading) {
        return (
            <div className='result-background flex justify-center items-center h-screen bg-no-repeat bg-cover'>
                <Card className='bg-white/95 backdrop-blur-sm mx-4'>
                    <CardHeader>
                        <div className='animate-pulse text-lg sm:text-2xl'>Loading final scores...</div>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className='result-background flex flex-col items-center min-h-screen bg-no-repeat bg-cover p-3 sm:p-4 py-6 sm:py-8'>
            <div className='w-full max-w-3xl space-y-4 sm:space-y-6'>
                <div className='flex flex-row justify-between items-center mb-2'>
                    <NavigationBar route="/" />
                </div>

                <div className='text-center space-y-2'>
                    <h1 className="font-[Oi] text-white [-webkit-text-stroke:1px_black] sm:[-webkit-text-stroke:2px_black] text-4xl sm:text-6xl">
                        Flamingo
                    </h1>
                    <div className='flex items-center justify-center gap-2'>
                        <TrophyIcon size={28} weight="fill" className='text-yellow-400' />
                        <h2 className='text-white text-2xl sm:text-3xl font-bold drop-shadow-lg'>
                            Final Results
                        </h2>
                        <TrophyIcon size={28} weight="fill" className='text-yellow-400' />
                    </div>
                </div>

                {/* Podium for top 3 */}
                {leaderboard.length >= 3 && (
                    <div className='flex items-end justify-center gap-3 sm:gap-6 px-4 h-32 sm:h-36'>
                        {[1, 0, 2].map((pos) => {
                            const player = leaderboard[pos]
                            if (!player) return null
                            return (
                                <div
                                    key={player.id}
                                    className={`flex flex-col items-center gap-1 transition-all duration-500 ease-out`}
                                    style={{
                                        opacity: visibleRows > pos ? 1 : 0,
                                        transform: visibleRows > pos ? 'translateY(0)' : 'translateY(20px)',
                                    }}
                                >
                                    <span className='text-2xl sm:text-3xl'>{MEDAL_EMOJIS[pos]}</span>
                                    <div className={`${PodiumHeight(pos)} w-16 sm:w-24 ${pos === 0 ? 'bg-yellow-400/80' : pos === 1 ? 'bg-gray-400/80' : 'bg-orange-400/80'} rounded-t-lg flex items-start justify-center pt-2 shadow-lg`}>
                                        <span className='text-white text-2xl sm:text-3xl font-bold'>{player.totalScore}</span>
                                    </div>
                                    <span className='text-white text-xs sm:text-sm font-oldschool text-center truncate max-w-20 sm:max-w-28 drop-shadow-lg'>
                                        {player.playerName}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Full Leaderboard Card */}
                <Card className='bg-white/95 backdrop-blur-sm shadow-xl overflow-hidden'>
                    <CardContent className='p-0'>
                        {leaderboard.length === 0 ? (
                            <p className='text-center text-gray-500 py-8'>No scores to display</p>
                        ) : (
                            <div className='divide-y divide-gray-100'>
                                {leaderboard.map((player, index) => (
                                    <div
                                        key={player.id}
                                        className={`flex items-center gap-3 p-3 sm:p-4 transition-all duration-500 ${RowBg(index)}`}
                                        style={{
                                            opacity: visibleRows > index ? 1 : 0,
                                            transform: visibleRows > index ? 'translateX(0)' : 'translateX(-20px)',
                                        }}
                                    >
                                        {/* Rank */}
                                        <div className='text-lg sm:text-2xl font-bold w-8 sm:w-10 text-center shrink-0 text-gray-400'>
                                            {index < 3 ? MEDAL_EMOJIS[index] : `#${index + 1}`}
                                        </div>

                                        {/* Player Avatar & Name */}
                                        <div className='flex items-center gap-2 sm:gap-3 flex-1 min-w-0'>
                                            <div className='p-2 rounded-lg bg-white border border-gray-200 shrink-0 shadow-sm'>
                                                <UserIcon size={18} weight="bold" className='text-gray-600' />
                                            </div>
                                            <div className='min-w-0'>
                                                <h3 className='text-sm sm:text-lg font-oldschool truncate text-gray-800'>
                                                    {player.playerName}
                                                </h3>
                                                <div className='flex items-center gap-2 text-xs text-gray-400 mt-0.5'>
                                                    <span className='flex items-center gap-0.5'>
                                                        <CheckCircle size={12} weight="fill" className='text-green-500' />
                                                        {player.correctAnswers}
                                                    </span>
                                                    <span className='flex items-center gap-0.5'>
                                                        <XCircle size={12} weight="fill" className='text-red-400' />
                                                        {player.wrongAnswers}
                                                    </span>
                                                    {player.bestStreak > 1 && (
                                                        <span>🔥 {player.bestStreak}x</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Score */}
                                        <div className='text-right shrink-0'>
                                            <div className='text-lg sm:text-2xl font-bold text-gray-800'>
                                                {player.totalScore}
                                            </div>
                                            <div className='text-[10px] sm:text-xs text-gray-400'>
                                                pts
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Score bar visualization */}
                {leaderboard.length > 0 && (
                    <div className='bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg'>
                        <h3 className='text-sm font-oldschool text-gray-500 mb-3 uppercase tracking-wider'>Score Distribution</h3>
                        <div className='space-y-2'>
                            {leaderboard.slice(0, 5).map((player, index) => {
                                const pct = Math.max(5, (player.totalScore / topScore) * 100)
                                const barColor = index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-blue-400'
                                const delay = 300 + index * 100
                                return (
                                    <div key={player.id} className='flex items-center gap-2'>
                                        <span className='text-xs font-medium text-gray-600 w-16 sm:w-20 truncate'>{player.playerName}</span>
                                        <div className='flex-1 h-5 bg-gray-100 rounded-full overflow-hidden'>
                                            <div
                                                className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-out`}
                                                style={{
                                                    width: visibleRows > index ? `${pct}%` : '0%',
                                                    transitionDelay: `${delay}ms`,
                                                }}
                                            />
                                        </div>
                                        <span className='text-xs font-oldschool text-gray-600 w-12 text-right'>{player.totalScore}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className='flex flex-col sm:flex-row justify-center gap-3 pb-6'>
                    <Button
                        variant="active"
                        size="xl"
                        onClick={() => router.push('/')}
                    >
                        <GameControllerIcon size={24} />
                        Play Again
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ScoreBoardPage
