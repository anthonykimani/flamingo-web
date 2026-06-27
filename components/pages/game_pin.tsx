'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { UserIcon } from '@phosphor-icons/react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { getGameSession, getLeaderboard } from '@/services/quiz_service'
import { IPlayer } from '@/interfaces/IQuiz'
import socketClient from '@/utils/socket/socket.client'
import { IGameSession } from '@/interfaces/IGame'
import { SocketEvents } from '@/enums/socket-events'
import { PLAYER_COLORS } from '@/lib/constant'
import { useAccount } from 'wagmi'


const LobbyPage = () => {
    const [players, setPlayers] = useState<IPlayer[]>([])
    const [gameSession, setGameSession] = useState<IGameSession | null>(null)
    const [loading, setLoading] = useState(true)
    const [isSocketConnected, setIsSocketConnected] = useState(false)
    const [preGameCountdown, setPreGameCountdown] = useState<number | null>(null)
    const [gameStarted, setGameStarted] = useState(false)
    const { address, isConnected } = useAccount();
    const router = useRouter()
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('sessionId')
    const gamePin = searchParams.get('gamePin')
    const isHost = searchParams.get('host') === 'true'


    // Helper function to refresh player list
    const refreshPlayerList = async () => {
        if (!sessionId) return
        try {
            const leaderboardResponse = await getLeaderboard(sessionId)
            setPlayers(leaderboardResponse.payload)
        } catch (error) {
            console.error('Failed to refresh player list:', error)
        }
    }

    useEffect(() => {
        if (!sessionId) return

        // Fetch initial game session
        const fetchGameSession = async () => {
            try {
                const response = await getGameSession(sessionId)
                setGameSession(response.payload)

                // Get initial players from leaderboard
                const leaderboardResponse = await getLeaderboard(sessionId)
                setPlayers(leaderboardResponse.payload)

                setLoading(false)
            } catch (error) {
                console.error('Failed to fetch game session:', error)
                setLoading(false)
            }
        }

        fetchGameSession()


        // Connect to WebSocket
        const socket = socketClient.connect()

        socket.on('connect', () => {
            console.log('✅ Connected to WebSocket')
            setIsSocketConnected(true)

            // FIX #1: Join as Host (won't create player entity in backend)
            if (sessionId) {
                console.log('🎮 Joining game room:', sessionId)
                socketClient.joinGame(sessionId, isHost ? 'Host' : 'Spectator', address??"")
            }
        })

        socket.on('disconnect', () => {
            console.log('❌ Disconnected from WebSocket')
            setIsSocketConnected(false)
        })

        // Listen for player joined events
        socketClient.onPlayerJoined((data) => {
            console.log('👥 Player joined:', data)
            if (data.players && Array.isArray(data.players)) {
                setPlayers(data.players)
            } else {
                refreshPlayerList()
            }
        })

        // Listen for player left events
        socketClient.onPlayerLeft((data) => {
            console.log('👋 Player left:', data)
            if (data.players && Array.isArray(data.players)) {
                setPlayers(data.players)
            } else {
                refreshPlayerList()
            }
        })

        // Listen for pre-game countdown
        socket.on('pre-game-countdown', (data) => {
            console.log('⏳ Pre-game countdown:', data.count)
            setPreGameCountdown(data.count)
        })

        // Listen for game started event
        socketClient.onGameStarted((data) => {
            console.log('🚀 Game started:', data)
            setGameStarted(true)
            if (isHost) {
                router.push(`/game?sessionId=${sessionId}&gamePin=${gamePin}`)
            } else {
                router.push(`/play?sessionId=${sessionId}&gamePin=${gamePin}`)
            }
        })

        // Listen for errors
        socketClient.onError((data) => {
            console.error('⚠️ Socket error:', data.message)
        })

        // Cleanup
        return () => {
            socketClient.off(SocketEvents.PLAYER_JOINED)
            socketClient.off(SocketEvents.PLAYER_LEFT)
            socketClient.off(SocketEvents.GAME_STARTED)
            socketClient.off(SocketEvents.ERROR)
            socket.off('pre-game-countdown')
        }
    }, [sessionId, gamePin, isHost, router])

    // Auto-start game when host + players are present
    useEffect(() => {
        if (!isHost || gameStarted || preGameCountdown !== null) return
        if (players.length === 0) return

        const autoStartTimer = setTimeout(() => {
            console.log('🎮 Auto-starting game...')
            socketClient.startGame(sessionId!)
        }, 2000)

        return () => clearTimeout(autoStartTimer)
    }, [isHost, players.length, gameStarted, preGameCountdown, sessionId])

    // Host skip pre-game countdown
    const handleSkipCountdown = () => {
        if (!sessionId) return
        socketClient.startGame(sessionId)
    }


    const handleStartGame = async () => {
        if (!sessionId || !gameSession) return

        try {
            console.log('🎮 Starting game...')

            // Emit WebSocket event to notify all players
            console.log('📡 Broadcasting start-game event')
            socketClient.startGame(sessionId)

        } catch (error) {
            console.error('❌ Failed to start game:', error)
        }
    }

    if (loading) {
        return (
            <div className='h-screen bg-no-repeat bg-cover flex justify-center items-center'>
                <Card>
                    <CardHeader className='text-2xl'>Loading lobby...</CardHeader>
                </Card>
            </div>
        )
    }

    if (!gameSession) {
        return (
            <div className='h-screen bg-no-repeat bg-cover flex justify-center items-center'>
                <Card>
                    <CardHeader className='text-2xl text-red-500'>
                        Game session not found
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col p-4 gap-4 game-type-background h-screen bg-no-repeat bg-cover justify-center items-center w-full">
            {/* Connection Debug Info */}
            <div className='absolute top-4 right-4 bg-black/50 text-white text-xs p-2 rounded'>
                {isSocketConnected ? '🟢 Connected' : '🔴 Disconnected'}
                {sessionId && <div>Room: {sessionId.slice(0, 8)}...</div>}
                {players.length > 0 && <div>Players: {players.length}</div>}
                {isHost && <div>👑 Host View</div>}
            </div>

            <h1 className="font-[Oi] text-white [-webkit-text-stroke:2px_black] sm:[-webkit-text-stroke:3px_black] text-4xl xsm:text-6xl sm:text-8xl">
                Flamingo
            </h1>

            {/* Game PIN Display */}
            <Card className='w-full max-w-md'>
                <CardHeader className='text-center'>
                    <h2 className='text-2xl font-bold mb-2'>Game PIN</h2>
                    <p className='text-5xl font-bold tracking-wider'>{gamePin}</p>
                </CardHeader>
            </Card>

            {/* Quiz Title */}
            <Card className='w-full max-w-md'>
                <CardHeader className='text-center'>
                    <h3 className='text-xl font-semibold'>{gameSession.quiz?.title}</h3>
                    <h3 className='text-xl font-semibold text-center'>
                        Players {players.length}
                    </h3>
                </CardHeader>
            </Card>

            {/* Players List */}
            <div className='w-full max-w-2xl max-h-96 overflow-y-auto'>
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 px-6 pb-6'>
                    {players.length === 0 ? null : (
                        players.map((player, index) => (
                            <div key={player.id} className='flex flex-col items-center gap-2 animate-fadeIn'>
                                <Card className={`active:border-b-6 active:border-r-6 active:border-t-2 active:border-l-2 ${PLAYER_COLORS[index % PLAYER_COLORS.length]} text-white p-6`}>
                                    <CardHeader className='justify-center items-center'>
                                        <UserIcon size={32} weight='fill' />
                                    </CardHeader>
                                </Card>
                                <p className='text-lg text-white text-center font-bold truncate w-full'>
                                    {player.playerName}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Pre-game Countdown */}
            {preGameCountdown !== null && preGameCountdown > 0 && (
                <Card className='w-full max-w-md bg-white/95'>
                    <CardHeader className='text-center'>
                        <div className='text-7xl font-bold text-[#FF00B7] animate-pulse'>
                            {preGameCountdown}
                        </div>
                        <p className='text-xl font-semibold mt-2'>Game starting in {preGameCountdown}...</p>
                        {isHost && (
                            <button
                                onClick={handleSkipCountdown}
                                className='mt-3 text-sm text-gray-500 hover:text-gray-800 underline cursor-pointer'
                            >
                                Start Now
                            </button>
                        )}
                    </CardHeader>
                </Card>
            )}

            {/* Waiting for players */}
            {preGameCountdown === null && (
                <div className='flex flex-col gap-2 w-full max-w-md'>
                    {isHost && players.length === 0 && (
                        <p className='text-white text-center text-sm'>
                            Share the PIN above with players
                        </p>
                    )}
                    {!isHost && players.length > 0 && preGameCountdown === null && (
                        <Card className='w-full max-w-md'>
                            <CardHeader className='text-center'>
                                <div className='animate-pulse'>
                                    <p className='text-lg font-semibold mb-2'>Get Ready! 🎮</p>
                                    <p className='text-sm text-gray-600'>
                                        Waiting for the game to start...
                                    </p>
                                </div>
                            </CardHeader>
                        </Card>
                    )}
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    )
}

export default LobbyPage