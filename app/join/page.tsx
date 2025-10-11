'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { JoinGameStep } from '@/enums/join_game_step'
import { LegoIcon, SparkleIcon, UserIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { addPlayer, joinGame, getGameSession } from '@/services/quiz_service'
import { GameState } from '@/enums/game_state'

const JoinGame = () => {
    const [stepper, setStepper] = useState<JoinGameStep>(JoinGameStep.CHOOSEGAMEMODE)
    const [gamePin, setGamePin] = useState('')
    const [nickname, setNickname] = useState('')
    const [gameSession, setGameSession] = useState<any>(null)
    const [error, setError] = useState('')
    const router = useRouter()

    // Poll for game start in lobby room
    useEffect(() => {
        if (stepper !== JoinGameStep.LOBBYROOM || !gameSession?.id) return

        const pollInterval = setInterval(async () => {
            try {
                const response = await getGameSession(gameSession.id)
                const session = response.payload
                
                // Check if game has started (you might need to add a 'hasStarted' field)
                // For now, we'll check if startedAt is set
                if (session.status === GameState.IN_PROGRESS ) {
                    clearInterval(pollInterval)
                    // Navigate to play page
                    router.push(`/play?sessionId=${session.id}&playerName=${nickname}&quizId=${session.quiz.id}`)
                }
            } catch (error) {
                console.error('Failed to check game status:', error)
            }
        }, 2000) // Poll every 2 seconds

        return () => clearInterval(pollInterval)
    }, [stepper, gameSession, nickname, router])

    const handleNextStep = async () => {
        switch (stepper) {
            case JoinGameStep.CHOOSEGAMEMODE:
                setStepper(JoinGameStep.ENTERGAMEPIN)
                break
            case JoinGameStep.ENTERGAMEPIN:
                if (!gamePin.trim()) {
                    setError('Please enter a game PIN')
                    return
                }
                try {
                    setError('')
                    const response = await joinGame(gamePin)
                    console.log('Game session:', response.payload)
                    setGameSession(response.payload)
                    setStepper(JoinGameStep.ENTERNICKNAME)
                } catch (err) {
                    console.error('Join game error:', err)
                    setError('Invalid game PIN or game not found')
                }
                break
            case JoinGameStep.ENTERNICKNAME:
                if (!nickname.trim()) {
                    setError('Please enter a nickname')
                    return
                }
                try {
                    setError('')
                    // Add player to game session
                    await addPlayer({
                        playerName: nickname,
                        gameSessionId: gameSession.id
                    })
                    setStepper(JoinGameStep.LOBBYROOM)
                } catch (err) {
                    console.error('Add player error:', err)
                    setError('Failed to join game. This nickname might already be taken.')
                }
                break
        }
    }

    const renderStep = () => {
        switch (stepper) {
            case JoinGameStep.CHOOSEGAMEMODE:
                return (
                    <div className='flex flex-col start-screen-background h-screen w-screen bg-no-repeat bg-cover md:flex justify-center md:items-center p-1 sm:p-3'>
                        <h1 className="font-[Oi] text-white [text-stroke:_2px_black] text-4xl sm:text-6xl text-center">
                            Flamingo
                        </h1>
                        <div className='flex flex-col justify-end mt-4 gap-2'>
                            <Button
                                leftIcon={<LegoIcon size={24} weight="duotone" />}
                                variant="active"
                                size="xl"
                                onClick={() => handleNextStep()}
                            >
                                Enter Game Pin
                            </Button>
                            <Button
                                leftIcon={<SparkleIcon size={28} color='black' />}
                                variant="active"
                                size="xl"
                                onClick={() => router.push("/create")}
                            >
                                Create New Game
                            </Button>
                        </div>
                    </div>
                )
            case JoinGameStep.ENTERGAMEPIN:
                return (
                    <div className='flex flex-col game-pin-background h-screen w-screen bg-no-repeat bg-cover md:flex justify-center md:items-center p-1 sm:p-3'>
                        <h1 className="font-[Oi] text-white [text-stroke:_2px_black] text-4xl sm:text-6xl text-center">
                            Flamingo
                        </h1>
                        <div className='flex flex-col justify-end mt-4 gap-2'>
                            <Input
                                name='gamepin'
                                variant="default"
                                placeholder='Enter Game Pin'
                                value={gamePin}
                                onChange={(e) => setGamePin(e.target.value)}
                            />
                            {error && <p className='text-red-500 text-center'>{error}</p>}
                            <Button
                                variant="active"
                                size="xl"
                                buttoncolor={"darkened"}
                                onClick={() => handleNextStep()}
                            >
                                Join Game
                            </Button>
                        </div>
                    </div>
                )
            case JoinGameStep.ENTERNICKNAME:
                return (
                    <div className='flex flex-col start-screen-background h-screen w-screen bg-no-repeat bg-cover md:flex justify-center md:items-center p-1 sm:p-3'>
                        <h1 className="font-[Oi] text-white [text-stroke:_2px_black] text-4xl sm:text-6xl text-center">
                            Flamingo
                        </h1>
                        <div className='flex flex-col justify-end mt-4 gap-2'>
                            <Input
                                name='nickname'
                                variant="default"
                                placeholder='Choose Nickname'
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                            />
                            {error && <p className='text-red-500 text-center'>{error}</p>}
                            <Button
                                leftIcon={<SparkleIcon size={28} color='black' />}
                                variant="active"
                                size="xl"
                                onClick={() => handleNextStep()}
                            >
                                Ok, LFG!
                            </Button>
                        </div>
                    </div>
                )
            case JoinGameStep.LOBBYROOM:
                return (
                    <div className="flex flex-col p-2 gap-2 game-type-background h-screen bg-no-repeat bg-cover justify-center items-center">
                        <div className='flex flex-col'>
                            <Card className='active:border-b-6 active:border-r-6'>
                                <CardHeader className='justify-center items-center px-10'>
                                    <UserIcon size={32} />
                                </CardHeader>
                            </Card>
                            <h3 className='text-white text-xl text-center'>{nickname}</h3>
                        </div>
                        <Card className='active:border-b-6 active:border-r-6 w-1/5'>
                            <CardHeader className='justify-center items-center'>
                                You're in! See your nickname on Screen?
                            </CardHeader>
                        </Card>
                        <p className='text-white text-lg'>Waiting for game to start...</p>
                        <div className='animate-pulse text-white text-sm'>
                            Checking for game start...
                        </div>
                    </div>
                )
        }
    }

    return renderStep()
}

export default JoinGame