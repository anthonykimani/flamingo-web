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
        <div className='result-background flex flex-col justify-center items-center min-h-screen bg-no-repeat bg-cover p-3 sm:p-4 py-6 sm:py-8'>
            <div className='w-full max-w-3xl space-y-4 sm:space-y-8'>
                <div className='flex flex-row justify-between sm:items-center mb-4'>
                    <NavigationBar route="/" />
                </div>

                <div className='text-center space-y-2 sm:space-y-4'>
                    <h1 className="font-[Oi] text-white [-webkit-text-stroke:1px_black] sm:[-webkit-text-stroke:2px_black] md:[-webkit-text-stroke:3px_black] text-3xl xs:text-4xl sm:text-5xl md:text-7xl">
                        Flamingo
                    </h1>
                    <div className='flex items-center justify-center gap-2 sm:gap-3'>
                        <TrophyIcon size={28} weight="fill" className='text-yellow-400 sm:hidden' />
                        <TrophyIcon size={40} weight="fill" className='text-yellow-400 hidden sm:block' />
                        <h2 className='text-white text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold drop-shadow-lg'>
                            Final Results
                        </h2>
                        <TrophyIcon size={28} weight="fill" className='text-yellow-400 sm:hidden' />
                        <TrophyIcon size={40} weight="fill" className='text-yellow-400 hidden sm:block' />
                    </div>
                </div>

                {/* Leaderboard Card */}
                <Card className='bg-white/95 backdrop-blur-sm shadow-2xl'>
                    <CardContent className='p-3 sm:p-6'>
                        <div className='space-y-2 sm:space-y-3'>
                            {leaderboard.length === 0 ? (
                                <p className='text-center text-gray-500 py-8 text-sm sm:text-base'>No scores to display</p>
                            ) : (
                                leaderboard.map((player, index) => (
                                    <div
                                        key={player.id}
                                        className={`
                                            flex items-center gap-2 xs:gap-3 sm:gap-4 p-2 xs:p-3 sm:p-4 rounded-lg transition-all
                                            ${index === 0
                                                ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-2 border-yellow-400'
                                                : index === 1
                                                    ? 'bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-400'
                                                    : index === 2
                                                        ? 'bg-gradient-to-r from-orange-100 to-orange-50 border-2 border-orange-400'
                                                        : 'bg-slate-50'
                                            }
                                        `}
                                    >
                                        {/* Rank */}
                                        <div className='text-xl xs:text-2xl sm:text-3xl font-bold w-8 xs:w-10 sm:w-12 text-center shrink-0'>
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                        </div>

                                        {/* Player Icon & Name */}
                                        <div className='flex items-center gap-2 xs:gap-3 flex-1 min-w-0'>
                                            <div className={`
                                                p-2 xs:p-2.5 sm:p-3 rounded-lg xs:rounded-xl border-2 shrink-0
                                                ${index === 0
                                                    ? 'bg-yellow-200 border-yellow-400'
                                                    : index === 1
                                                        ? 'bg-gray-200 border-gray-400'
                                                        : index === 2
                                                            ? 'bg-orange-200 border-orange-400'
                                                            : 'bg-white border-slate-300'
                                                }
                                            `}>
                                                <UserIcon
                                                    size={20}
                                                    weight="bold"
                                                    className='text-slate-700 xs:hidden'
                                                />
                                                <UserIcon
                                                    size={24}
                                                    weight="bold"
                                                    className='text-slate-700 hidden xs:block sm:hidden'
                                                />
                                            </div>
                                            <h3 className='text-sm xs:text-base sm:text-xl md:text-2xl font-semibold truncate'>
                                                {player.playerName}
                                            </h3>
                                        </div>

                                        {/* Score */}
                                        <div className='text-right shrink-0'>
                                            <div className='text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-slate-700'>
                                                {player.totalScore}
                                            </div>
                                            <div className='text-[10px] xs:text-xs text-slate-500'>
                                                points
                                            </div>
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