'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { JoinGameStep } from '@/enums/join_game_step'
import { LegoIcon, SparkleIcon, UserIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { getGameSessionByGamePin } from '@/services/quiz_service'
import { GameState } from '@/enums/game_state'
import socketClient from '@/utils/socket.client'
import { SocketEvents } from '@/enums/socket-events'

const JoinGame = () => {
    const [stepper, setStepper] = useState<JoinGameStep>(JoinGameStep.CHOOSEGAMEMODE)
    const [gamePin, setGamePin] = useState('')
    const [nickname, setNickname] = useState('')
    const [gameSession, setGameSession] = useState<any>(null)
    const [error, setError] = useState('')
    const [isConnected, setIsConnected] = useState(false)
    const router = useRouter()

    // Connect to WebSocket when component mounts
    useEffect(() => {
        const socket = socketClient.connect()

        socket.on('connect', () => {
            console.log('🦦 Player WebSocket connected')
            setIsConnected(true)
        })

        socket.on('disconnect', () => {
            console.log('🦦 Player WebSocket disconnected')
            setIsConnected(false)
        })

        // Cleanup
        return () => {
            // Don't disconnect - other pages need the connection
        }
    }, [])

    // Listen for game start in lobby room
    useEffect(() => {
        if (stepper !== JoinGameStep.LOBBYROOM || !gameSession?.id) return

        // Listen for game started event via WebSocket
        socketClient.onGameStarted((data) => {
            console.log('🚀 Game started via WebSocket:', data)
            // Navigate to play page with playerName
            router.push(`/play?sessionId=${gameSession.id}&playerName=${nickname}&gamePin=${gameSession.gamePin}`)
        })

        return () => {
            socketClient.off(SocketEvents.GAME_STARTED)
        }
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
                    const response = await getGameSessionByGamePin(gamePin)
                    console.log('Game session:', response.payload)

                    // Check if game is in correct state
                    if (response.payload.status !== GameState.WAITING && response.payload.status !== GameState.CREATED) {
                        setError('Game has already started or ended')
                        return
                    }

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

                // Validate nickname
                if (nickname.length < 2) {
                    setError('Nickname must be at least 2 characters')
                    return
                }

                if (nickname.length > 20) {
                    setError('Nickname must be 20 characters or less')
                    return
                }

                try {
                    setError('')

                    // Join game via WebSocket
                    socketClient.joinGame(gameSession.id, nickname)

                    // Listen for confirmation
                    socketClient.onJoinedGame((data) => {
                        console.log('✅ Joined game via WebSocket:', data)

                        if (data.success) {
                            setStepper(JoinGameStep.LOBBYROOM)
                        } else {
                            setError('Failed to join game')
                        }
                    })

                    // Listen for errors
                    socketClient.onError((data) => {
                        console.error('❌ Join error:', data.message)
                        setError(data.message)
                    })

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
                        <h1 className="font-[Oi] text-white [-webkit-text-stroke:2px_black] sm:[-webkit-text-stroke:3px_black] text-4xl xsm:text-6xl sm:text-8xl">
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
                        {/* Connection Status */}
                        <p className='text-white text-sm mt-4'>
                            {isConnected ? '🟢 Connected' : '🔴 Connecting...'}
                        </p>
                    </div>
                )
            case JoinGameStep.ENTERGAMEPIN:
                return (
                    <div className='flex flex-col game-pin-background h-screen w-screen bg-no-repeat bg-cover md:flex justify-center md:items-center p-1 sm:p-3'>
                        <h1 className="font-[Oi] text-white [-webkit-text-stroke:2px_black] sm:[-webkit-text-stroke:3px_black] text-4xl xsm:text-6xl sm:text-8xl">
                            Flamingo
                        </h1>
                        <div className='flex flex-col justify-end mt-4 gap-2'>
                            <Input
                                name='gamepin'
                                variant="default"
                                placeholder='Enter Game Pin'
                                value={gamePin}
                                onChange={(e) => setGamePin(e.target.value)}
                                maxLength={6}
                                autoFocus
                            />
                            {error && <p className='text-red-500 text-center font-semibold bg-white/90 p-2 rounded'>{error}</p>}
                            <Button
                                variant="active"
                                size="xl"
                                buttoncolor={"darkened"}
                                onClick={() => handleNextStep()}
                                disabled={!gamePin.trim()}
                            >
                                Join Game
                            </Button>
                            <Button
                                variant="active"
                                size="xl"
                                buttoncolor={"darkened"}
                                onClick={() => setStepper(JoinGameStep.CHOOSEGAMEMODE)}
                            >
                                Back
                            </Button>
                        </div>
                    </div>
                )
            case JoinGameStep.ENTERNICKNAME:
                return (
                    <div className='flex flex-col start-screen-background h-screen w-screen bg-no-repeat bg-cover md:flex justify-center md:items-center p-1 sm:p-3'>
                        <h1 className="font-[Oi] text-white [-webkit-text-stroke:2px_black] sm:[-webkit-text-stroke:3px_black] text-4xl xsm:text-6xl sm:text-8xl">
                            Flamingo
                        </h1>
                        <div className='flex flex-col justify-end mt-4 gap-2'>
                            <Input
                                name='nickname'
                                variant="default"
                                placeholder='Choose Nickname'
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                maxLength={20}
                                autoFocus
                            />
                            {error && <p className='text-red-500 text-center font-semibold bg-white/90 p-2 rounded'>{error}</p>}
                            <Button
                                leftIcon={<SparkleIcon size={28} color='black' />}
                                variant="active"
                                size="xl"
                                onClick={() => handleNextStep()}
                                disabled={!nickname.trim()}
                            >
                                Ok, LFG!
                            </Button>
                            <Button
                                variant="active"
                                size="xl"
                                buttoncolor={"darkened"}
                                onClick={() => setStepper(JoinGameStep.ENTERGAMEPIN)}
                            >
                                Back
                            </Button>
                        </div>
                    </div>
                )
            case JoinGameStep.LOBBYROOM:
                return (
                    <div className="flex flex-col p-2 gap-2 game-type-background h-screen bg-no-repeat bg-cover justify-center items-center">
                        <div className='flex flex-col items-center gap-3'>
                            <Card className='active:border-b-6 active:border-r-6'>
                                <CardHeader className='justify-center items-center px-10'>
                                    <UserIcon size={48} />
                                </CardHeader>
                            </Card>
                            <h3 className='text-white text-2xl font-bold text-center'>{nickname}</h3>
                        </div>

                        <Card className='w-auto max-w-md mx-4'>
                            <CardHeader className='text-center px-8'>
                                <p className='text-lg font-semibold mb-2'>You're in! 🎉</p>
                                <p className='text-sm text-gray-600'>
                                    Game PIN: <strong>{gameSession?.gamePin}</strong>
                                </p>
                                <p className='text-xs text-gray-500 mt-2'>
                                    See your nickname on the host's screen?
                                </p>
                            </CardHeader>
                        </Card>

                        <div className='text-center'>
                            <p className='text-white text-xl font-semibold mb-2'>
                                Waiting for game to start...
                            </p>
                            <div className='animate-pulse text-white/80 text-sm flex items-center justify-center gap-2'>
                                <span>⏳</span>
                                <span>Get ready!</span>
                            </div>
                        </div>

                        {/* Connection Status */}
                        <p className='text-white/60 text-xs mt-4'>
                            {isConnected ? '🟢 Connected to game' : '🔴 Reconnecting...'}
                        </p>
                    </div>
                )
        }
    }

    return renderStep()
}

export default JoinGame