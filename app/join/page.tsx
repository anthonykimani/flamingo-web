'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { ConnectionStatus } from '@/components/ui/connection-status'
import { JoinGameStep } from '@/enums/join_game_step'
import { HourglassIcon, MagicWandIcon, PencilSimpleIcon, PlayIcon, UserIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { getGameSessionByGamePin, getActiveGames, joinGame } from '@/services/quiz_service'
import { setGuestToken } from '@/utils/tokens'

import { GameState } from '@/enums/game_state'
import { GameMode } from '@/enums/game_mode'
import socketClient from '@/utils/socket/socket.client'
import { SocketEvents } from '@/enums/socket-events'
import NavigationBar from '@/components/navigation/navigation-bar'
import SwipeGames from '@/components/pages/swipe_games'
import { useWorldApp } from '@/hooks/use-world-app'
import { useAccount } from 'wagmi'
import { getPlayerName, setPlayerName } from '@/lib/fun-names'

const JoinGame = () => {
  const [stepper, setStepper] = useState<JoinGameStep>(JoinGameStep.BROWSEGAMES)
  const { address, isConnected } = useAccount()
  const { isInstalled, walletAddress, username } = useWorldApp()

  const [nickname, setNickname] = useState('')
  const [gameSession, setGameSession] = useState<any>(null)
  const [activeGames, setActiveGames] = useState<any[]>([])
  const [loadingGames, setLoadingGames] = useState(true)
  const [error, setError] = useState('')
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [isDesignatedHost, setIsDesignatedHost] = useState(false)
  const router = useRouter()

  const gameSessionRef = useRef(gameSession)
  const nicknameRef = useRef(nickname)
  const countdownRef = useRef(countdown)
  gameSessionRef.current = gameSession
  nicknameRef.current = nickname
  countdownRef.current = countdown

  const isWorldApp = isInstalled
  const userAddress = isWorldApp ? walletAddress : address

  useEffect(() => {
    const socket = socketClient.connect()

    socket.on('connect', () => {
      console.log('Player WebSocket connected')
      setIsSocketConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('Player WebSocket disconnected')
      setIsSocketConnected(false)
    })

    socket.on('pre-game-countdown', (data: { count: number }) => {
      console.log('⏳ Pre-game countdown:', data.count)
      setCountdown(data.count)
    })

    socket.on('game-started', () => {
      console.log('🚀 Game started, navigating to play...')
      const session = gameSessionRef.current
      const name = nicknameRef.current
      if (session?.id) {
        router.push(`/play?sessionId=${session.id}&playerName=${name}&gamePin=${session.gamePin}`)
      }
    })

    socket.on('game-state-changed', (data: { state: string }) => {
      if (data.state === 'countdown' || data.state === 'in_progress') {
        const session = gameSessionRef.current
        const name = nicknameRef.current
        if (session?.id) {
          router.push(`/play?sessionId=${session.id}&playerName=${name}&gamePin=${session.gamePin}`)
        }
      }
    })

    socket.on('host-transferred', (data: { successorName: string }) => {
      const name = nicknameRef.current
      if (name === data.successorName) {
        setIsDesignatedHost(true)
      }
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('pre-game-countdown')
      socket.off('game-started')
      socket.off('game-state-changed')
      socket.off('host-transferred')
      socketClient.off(SocketEvents.JOINED_GAME)
      socketClient.off(SocketEvents.ERROR)
    }
  }, [router])

  useEffect(() => {
    if (nickname) return
    const saved = getPlayerName()
    setNickname(saved)
  }, [nickname])

  useEffect(() => {
    if (stepper !== JoinGameStep.BROWSEGAMES) return

    const fetchGames = async () => {
      try {
        setLoadingGames(true)
        const response = await getActiveGames()
        setActiveGames(response.payload || [])
      } catch (err) {
        console.error('Failed to fetch active games:', err)
      } finally {
        setLoadingGames(false)
      }
    }

    fetchGames()
    const interval = setInterval(fetchGames, 15000)

    return () => clearInterval(interval)
  }, [stepper])

  const handleJoinGame = async (pin: string) => {
    if (!nickname.trim()) {
      setError('Please enter a nickname')
      return
    }

    if (nickname.length < 2) {
      setError('Nickname must be at least 2 characters')
      return
    }

    if (nickname.length > 20) {
      setError('Nickname must be 20 characters or less')
      return
    }

    setIsSubmitting(true)
    try {
      setError('')

      const pinToUse = pin
      const response = await getGameSessionByGamePin(pinToUse)
      console.log('Game session:', response.payload)

      if (
        response.payload.status !== GameState.CREATED &&
        response.payload.status !== GameState.WAITING &&
        response.payload.status !== GameState.COUNTDOWN &&
        response.payload.status !== GameState.IN_PROGRESS
      ) {
        setError('Game has already ended')
        setIsSubmitting(false)
        return
      }

      const isGameAlreadyRunning = response.payload.status === GameState.COUNTDOWN || response.payload.status === GameState.IN_PROGRESS

      // Register the player server-side and obtain a guest token that binds
      // this tab to the player identity (required for socket + answers)
      const joinResponse = await joinGame(pinToUse, nickname.trim(), userAddress ?? undefined)
      const { session, token: guestToken } = joinResponse.payload
      setGuestToken(guestToken)
      setGameSession(session)

      if (isGameAlreadyRunning) {
        router.push(`/play?sessionId=${session.id}&playerName=${nickname}&gamePin=${session.gamePin}`)
        setIsSubmitting(false)
        return
      }

      // Force reconnect so the fresh guest token is used in the socket handshake
      socketClient.reconnect()
      socketClient.joinGame(session.id, nickname, (userAddress ?? '') as `0x${string}`)

      // Remove stale listeners before registering new ones
      socketClient.off(SocketEvents.JOINED_GAME)
      socketClient.off(SocketEvents.ERROR)

      socketClient.onJoinedGame((data) => {
        console.log('Joined game via WebSocket:', data)
        if (data.success) {
          if (data.gameState === 'countdown' || data.gameState === 'in_progress') {
            router.push(`/play?sessionId=${session.id}&playerName=${nickname}&gamePin=${session.gamePin}`)
          } else {
            setGameSession(session)
            setStepper(JoinGameStep.LOBBYROOM)
          }
        } else {
          setError('Failed to join game')
        }
        setIsSubmitting(false)
      })

      socketClient.onError((data) => {
        console.error('Join error:', data.message)
        setError(data.message)
        setIsSubmitting(false)
      })

    } catch (err) {
      console.error('Add player error:', err)
      setError('Invalid game PIN or game not found')
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (stepper) {
      case JoinGameStep.BROWSEGAMES:
        return (
          <div className='start-screen-background h-screen w-screen bg-no-repeat bg-cover flex flex-col p-2 overflow-y-auto'>
            <NavigationBar />

            <div className='flex-1 flex flex-col items-center justify-center px-2 sm:px-4 -mt-12'>
              <h1 className="font-[Oi] text-white [-webkit-text-stroke:2px_black] sm:[-webkit-text-stroke:3px_black] text-4xl xsm:text-6xl sm:text-7xl text-center">
                Flamingo
              </h1>

              {loadingGames && activeGames.length === 0 ? (
                <div className='flex justify-center py-16'>
                  <div className='animate-fadeIn text-white/70 text-lg font-oldschool'>Browsing games...</div>
                </div>
              ) : activeGames.length === 0 ? (
                <div className='flex flex-col items-center gap-4 mt-8'>
                  <p className='text-white/80 text-lg font-oldschool text-center'>
                    No active games right now
                  </p>
                  <p className='text-white/60 text-sm text-center'>
                    Create a game or enter a PIN below
                  </p>
                  <Button
                    variant="active"
                    size="xl"
                    onClick={() => router.push('/create')}
                    className='mt-2'
                  >
                    <MagicWandIcon size={24} />
                    Create a Game
                  </Button>
                </div>
              ) : (
                <div className='mt-6 w-full flex justify-center'>
                  <SwipeGames
                    games={activeGames}
                    onJoin={handleJoinGame}
                    isSubmitting={isSubmitting}
                  />
                </div>
              )}

              {error && (
                <div className='fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fadeIn'>
                  <p className='text-red-500 text-center font-oldschool bg-white/95 p-3 rounded-xl border-2 border-red-300 border-b-[4px] border-r-[4px] text-sm'>
                    {error}
                  </p>
                </div>
              )}
            </div>
          </div>
        )

      case JoinGameStep.LOBBYROOM:
        return (
          <div className="flex flex-col gap-2 game-type-background h-screen w-screen bg-no-repeat bg-cover md:flex justify-center p-1 sm:p-3">
            <div className="absolute top-4 left-4 z-50">
              <NavigationBar />
            </div>
            <h1 className="font-[Oi] text-white [-webkit-text-stroke:2px_black] sm:[-webkit-text-stroke:3px_black] text-4xl xsm:text-6xl sm:text-8xl text-center">
              Flamingo
            </h1>
            <div className='flex flex-col items-center gap-3'>
              <div className='relative group'>
                <Card className='active:border-b-6 active:border-r-6 active:border-t-2 active:border-l-2 text-black p-6'>
                  <CardHeader className='justify-center items-center px-10'>
                    <UserIcon size={32} weight='bold' />
                  </CardHeader>
                </Card>
                {!isEditingNickname && (
                  <button
                    onClick={() => { setEditName(nickname); setIsEditingNickname(true) }}
                    className='absolute -top-1 -right-1 bg-white rounded-full p-1.5 border-2 border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-slate-100'
                    title='Edit nickname'
                  >
                    <PencilSimpleIcon size={14} />
                  </button>
                )}
              </div>
              {isEditingNickname ? (
                <div className='flex items-center gap-2'>
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={20}
                    className='text-white text-2xl font-bold text-center bg-white/20 rounded-lg px-3 py-1 outline-none border border-white/40'
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && editName.trim().length >= 2) {
                        setNickname(editName.trim())
                        setPlayerName(editName.trim())
                        setIsEditingNickname(false)
                      }
                      if (e.key === 'Escape') {
                        setIsEditingNickname(false)
                      }
                    }}
                    onBlur={() => {
                      if (editName.trim().length >= 2) {
                        setNickname(editName.trim())
                        setPlayerName(editName.trim())
                      }
                      setIsEditingNickname(false)
                    }}
                  />
                  <button
                    onClick={() => {
                      if (editName.trim().length >= 2) {
                        setNickname(editName.trim())
                        setPlayerName(editName.trim())
                      }
                      setIsEditingNickname(false)
                    }}
                    className='text-white/70 hover:text-white text-sm font-oldschool cursor-pointer'
                    disabled={editName.trim().length < 2}
                  >
                    Save
                  </button>
                </div>
              ) : (
                <h3 className='text-white text-2xl font-oldschool text-center'>{nickname}</h3>
              )}
            </div>

            {countdown !== null && countdown > 0 ? (
              <div className='flex justify-center items-center flex-1'>
                <div className='text-center animate-fadeIn'>
                  <div className='text-white text-9xl font-bold'>{countdown}</div>
                  <p className='text-white text-2xl font-oldschool mt-4'>Game starting in {countdown}s...</p>
                </div>
              </div>
            ) : (
              <>
                <div className='flex justify-around'>
                  <Card className='w-full max-w-md'>
                    <CardHeader className='text-center px-8'>
                      <div>
                        <p className='text-2xl font-oldschool mb-2'>You're in!</p>
                        {gameSession?.gameMode && (
                          <span className='inline-block bg-black/20 text-white/80 text-xs uppercase tracking-wider px-3 py-1 rounded-full font-oldschool mb-4'>
                            {gameSession.gameMode === GameMode.HANGOUTS ? 'Hangouts' : gameSession.gameMode === GameMode.TEAM_BUILDING ? 'Team Building' : 'Degen PvP'}
                          </span>
                        )}
                        {gameSession?.gameMode === GameMode.TEAM_BUILDING && !isDesignatedHost && (
                          <div>
                            <p className='text-lg font-oldschool mb-2'>
                              Waiting for game to start...
                            </p>
                            <div className='animate-pulse text-black/80 text-sm flex items-center justify-center gap-2'>
                              <HourglassIcon size={16} className="animate-icon-spin" />
                              <span>Get ready!</span>
                            </div>
                          </div>
                        )}
                      </div>
                  </CardHeader>
                </Card>
              </div>
              {(gameSession?.gameMode === GameMode.HANGOUTS || isDesignatedHost) && (
                <div className='flex justify-center'>
                  <Button
                    buttoncolor="gamePin"
                    size="xl"
                    onClick={() => socketClient.startGame(gameSession.id)}
                    className='w-full max-w-md'
                  >
                    <PlayIcon size={24} /> {gameSession?.gameMode === GameMode.HANGOUTS ? 'Play!' : 'Start Game as Host'}
                  </Button>
                </div>
              )}
              </>
            )}

            <ConnectionStatus>
              {isSocketConnected ? 'Connected to game' : 'Reconnecting...'}
            </ConnectionStatus>
          </div>
        )
    }
  }

  return renderStep()
}

export default JoinGame
