'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { UserIcon } from '@phosphor-icons/react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { getGameSession, getLeaderboard } from '@/services/quiz_service'
import { IPlayer } from '@/interfaces/IQuiz'
import { GameState } from '@/enums/game_state'
import socketClient from '@/utils/socket.client'
import { IGameSession } from '@/interfaces/IGame'
import { SocketEvents } from '@/enums/socket-events'

const LobbyPage = () => {
    const [players, setPlayers] = useState<IPlayer[]>([])
    const [gameSession, setGameSession] = useState<IGameSession | null>(null)
    const [loading, setLoading] = useState(true)
    const [isConnected, setIsConnected] = useState(false)
    
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
            setIsConnected(true)
            
            // FIX #1: Join as Host (won't create player entity in backend)
            if (sessionId) {
                console.log('🎮 Joining game room:', sessionId)
                socketClient.joinGame(sessionId, isHost ? 'Host' : 'Spectator')
            }
        })

        socket.on('disconnect', () => {
            console.log('❌ Disconnected from WebSocket')
            setIsConnected(false)
        })

        // Listen for player joined events
        socketClient.onPlayerJoined((data) => {
            console.log('👥 Player joined:', data)
            // Update players list from the event data
            if (data.players && Array.isArray(data.players)) {
                setPlayers(data.players)
            } else {
                // Fallback: fetch fresh leaderboard
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

        // Listen for game started event
        socketClient.onGameStarted((data) => {
            console.log('🚀 Game started:', data)
            // Navigate to game page
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
            // Don't disconnect, other pages need the connection
        }
    }, [sessionId, gamePin, isHost, router])


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
                {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
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
                    <p className='text-sm text-gray-600'>
                        {gameSession.quiz?.questions?.length} Questions
                    </p>
                </CardHeader>
            </Card>

            {/* Players List */}
            <div className='w-full max-w-2xl max-h-96 overflow-y-auto'>
                <CardHeader>
                </CardHeader>
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 px-6 pb-6'>
                    {players.length === 0 ? null : (
                        players.map((player) => (
                            <div key={player.id} className='flex flex-col items-center gap-2 animate-fadeIn'>
                                <Card className='active:border-b-6 active:border-r-6 w-full'>
                                    <CardHeader className='justify-center items-center py-4'>
                                        <UserIcon size={32} />
                                    </CardHeader>
                                </Card>
                                <p className='text-sm text-center font-medium truncate w-full'>
                                    {player.playerName}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Host Controls */}
            {isHost && (
                <div className='flex flex-col gap-2 w-full max-w-md'>
                    <Button
                        variant="active"
                        size="xl"
                        onClick={handleStartGame}
                        disabled={players.length === 0}
                        buttoncolor='gametype'
                    >
                        {players.length === 0 
                            ? 'Waiting for players...' 
                            : `Start Game (${players.length} players)`}
                    </Button>
                    <p className='text-white text-center text-sm'>
                        {players.length === 0 
                            ? 'Share the PIN above with players' 
                            : 'Click to start when everyone is ready'}
                    </p>
                </div>
            )}

            {/* Player Waiting Message */}
            {!isHost && (
                <Card className='w-full max-w-md'>
                    <CardHeader className='text-center'>
                        <div className='animate-pulse'>
                            <p className='text-lg font-semibold mb-2'>Get Ready! 🎮</p>
                            <p className='text-sm text-gray-600'>
                                Waiting for host to start the game...
                            </p>
                        </div>
                    </CardHeader>
                </Card>
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