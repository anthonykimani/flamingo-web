'use client'

import { Card, CardHeader } from '@/components/ui/card'
import { UserIcon } from '@phosphor-icons/react'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getLeaderboard } from '@/services/quiz_service'
import { IPlayer } from '@/interfaces/IQuiz'

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
            <div className='result-background flex justify-center items-center h-screen'>
                <p className='text-white text-2xl'>Loading...</p>
            </div>
        )
    }

    return (
        <div className='result-background flex flex-col justify-around h-screen bg-no-repeat bg-cover p-8'>
            <h1 className="font-[Oi] text-white [text-stroke:_2px_black] text-4xl sm:text-6xl text-center">
                Flamingo
            </h1>
            <Card>
                <CardHeader className='text-3xl text-center'>
                    Final Scoreboard
                </CardHeader>
            </Card>
            <div className='flex flex-col items-center gap-3'>
                {leaderboard.map((player, index) => (
                    <div key={player.id} className='flex items-center justify-center gap-5 w-full'>
                        <div className='text-white text-2xl font-bold w-8'>{index + 1}</div>
                        <Card className='active:border-b-6 active:border-r-6'>
                            <CardHeader className='justify-center items-center px-10'>
                                <UserIcon size={32} />
                            </CardHeader>
                        </Card>
                        <h3 className='text-white text-xl text-center flex-1'>{player.playerName}</h3>
                        <h3 className='font-[Oi] text-white [text-stroke:_2px_black] text-3xl'>{player.totalScore}</h3>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ScoreBoardPage