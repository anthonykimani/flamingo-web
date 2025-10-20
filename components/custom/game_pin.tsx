'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardHeader } from '../ui/card'
import { UserIcon } from '@phosphor-icons/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getGameSession, getLeaderboard, startGame } from '@/services/quiz_service'
import { IPlayer } from '@/interfaces/IQuiz'
import { GameState } from '@/enums/game_state'
import { IGameSession } from '@/interfaces/IGame'

const GamePin = () => {
    const [players, setPlayers] = useState<IPlayer[]>([])
    const [readyToPlay, setReadyToPlay] = useState(false)
    const [gamePin, setGamePin] = useState('')
    const [sessionId, setSessionId] = useState('')
    const [gameSession, setGameSession] = useState<IGameSession>({
        id: "",
        gamePin: "",
        quiz: {
            title: "",
            questions: []
        },
        gameTitle: "",
        entryFee: "",
        maxPlayers: 5,
        status: GameState.IN_PROGRESS,
        isActive: true,
        startedAt: "",
        endedAt: "",
        playerAnswers: [],
        createdAt: "",
        updatedAt: "",
        deleted: false,
    })

    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const pin = searchParams.get('gamePin')
        const sid = searchParams.get('sessionId')

        if (pin) setGamePin(pin)
        if (sid) setSessionId(sid)

        // Poll for players joining
        if (sid) {
            const interval = setInterval(async () => {
                try {
                    const response = await getLeaderboard(sid)
                    const gameSession = await getGameSession(sid);
                    setPlayers(response.payload)
                    setGameSession(gameSession.payload)
                    if (response.payload.length > 0) {
                        setReadyToPlay(true)
                    }
                } catch (error) {
                    console.error('Failed to fetch players:', error)
                }
            }, 2000) // Poll every 2 seconds

            return () => clearInterval(interval)
        }
    }, [searchParams])

    const handlePlay = () => {
        if (sessionId) {
            startGame(sessionId, GameState.IN_PROGRESS);
            router.push(`/game?sessionId=${sessionId}&gamePin=${gameSession.gamePin}`)

        }
    }

    const handleSpacePress = (e: KeyboardEvent) => {
        if (e.key === ' ' && readyToPlay) {
            handlePlay()
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', handleSpacePress)
        return () => window.removeEventListener('keydown', handleSpacePress)
    }, [readyToPlay, sessionId])

    return (
        <div className="flex flex-col p-2 gap-2 h-screen bg-no-repeat bg-cover justify-center items-center">
            <h1 className="font-[Oi] text-white [text-stroke:_2px_black] text-3xl sm:text-8xl">
                Flamingo
            </h1>
            <div className="flex flex-col sm:flex-row justify-center w-full">
                <Button variant={"active"} className="m-2 text-xl" size={"xl"}>
                    GAME PIN: {gamePin}
                </Button>
            </div>

            {players.length > 0 ? (
                <div className='grid grid-cols-2 sm:grid-cols-4 gap-10'>
                    {players.map((player) => (
                        <div key={player.id} className='flex flex-col'>
                            <Card className='active:border-b-6 active:border-r-6'>
                                <CardHeader className='justify-center items-center px-10'>
                                    <UserIcon size={32} />
                                </CardHeader>
                            </Card>
                            <h3 className='text-white text-xl text-center'>{player.playerName}</h3>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='text-white text-2xl'>Waiting for players to join...</div>
            )}

            {readyToPlay ? (
                <Button
                    onClick={handlePlay}
                    variant={"active"}
                    buttoncolor={"gamePin"}
                    className="m-2 text-xl"
                    size={"xl"}
                >
                    Press Space to Start
                </Button>
            ) : (
                <Button
                    variant={"active"}
                    buttoncolor={"gamePin"}
                    className="m-2 text-xl"
                    size={"xl"}
                    disabled
                >
                    Waiting for Players to Join ({players.length} joined)
                </Button>
            )}
        </div>
    )
}

export default GamePin