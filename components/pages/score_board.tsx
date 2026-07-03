'use client'

import { Button } from '@/components/ui/button'
import { GameControllerIcon, CheckCircle, XCircle, FireIcon } from '@phosphor-icons/react'
import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getLeaderboard } from '@/services/quiz_service'
import { IPlayer } from '@/interfaces/IQuiz'
import NavigationBar from '../navigation/navigation-bar'
import { PLAYER_COLORS } from '@/lib/constant'

const RANK_LABELS = ['1st', '2nd', '3rd']

const RankAccent = (index: number): string => {
  if (index === 0) return 'border-l-yellow-400 bg-yellow-50/50'
  if (index === 1) return 'border-l-slate-400 bg-slate-50/50'
  if (index === 2) return 'border-l-orange-400 bg-orange-50/50'
  return 'border-l-transparent bg-white'
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
                <div className='bg-white/95 rounded-xl border-2 border-slate-800 border-b-[6px] border-r-[6px] mx-4 px-8 py-6'>
                    <div className='animate-fadeIn text-lg sm:text-2xl font-oldschool text-slate-600'>Loading final scores...</div>
                </div>
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
                    <h2 className='text-white text-2xl sm:text-3xl font-bold drop-shadow-lg'>
                        Final Results
                    </h2>
                </div>

                <div className='bg-white/95 rounded-xl border-2 border-slate-800 border-b-[6px] border-r-[6px] overflow-hidden'>
                    {leaderboard.length === 0 ? (
                        <p className='text-center text-slate-500 py-8'>No scores to display</p>
                    ) : (
                        <div>
                            {leaderboard.map((player, index) => {
                                const pct = Math.max(5, (player.totalScore / topScore) * 100)
                                return (
                                    <div
                                        key={player.id}
                                        className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-l-4 transition-all duration-500 ${RankAccent(index)}`}
                                        style={{
                                            opacity: visibleRows > index ? 1 : 0,
                                            transform: visibleRows > index ? 'translateX(0)' : 'translateX(-20px)',
                                        }}
                                    >
                                        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${PLAYER_COLORS[index % PLAYER_COLORS.length]} flex items-center justify-center shrink-0 border-2 border-slate-800 border-b-[3px] border-r-[3px] text-white text-xs font-bold`}>
                                            {index + 1}
                                        </div>

                                        <span className='text-sm sm:text-base font-oldschool truncate text-slate-800 min-w-0 flex-1'>
                                            {player.playerName}
                                        </span>

                                        <div className='flex items-center gap-2 text-xs text-slate-400 shrink-0'>
                                            <span className='flex items-center gap-0.5'>
                                                <CheckCircle size={11} weight="fill" className='text-green-500' />
                                                {player.correctAnswers}
                                            </span>
                                            <span className='flex items-center gap-0.5'>
                                                <XCircle size={11} weight="fill" className='text-red-400' />
                                                {player.wrongAnswers}
                                            </span>
                                            {player.bestStreak > 1 && (
                                                <span className='flex items-center gap-0.5'>
                                                    <FireIcon size={11} weight="fill" className='text-orange-500' />
                                                    {player.bestStreak}x
                                                </span>
                                            )}
                                        </div>

                                        <div className='text-right shrink-0 min-w-[48px]'>
                                            <div className='text-sm sm:text-lg font-bold text-slate-800'>
                                                {player.totalScore}
                                            </div>
                                        </div>

                                        <div className='hidden sm:block w-16 lg:w-24 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0'>
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ease-out ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-orange-400' : 'bg-blue-400'}`}
                                                style={{
                                                    width: visibleRows > index ? `${pct}%` : '0%',
                                                    transitionDelay: `${300 + index * 100}ms`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    <div className='flex justify-center p-4 border-t border-slate-200'>
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
        </div>
    )
}

export default ScoreBoardPage
