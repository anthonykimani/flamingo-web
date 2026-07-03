'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { JoinGameStep } from '@/enums/join_game_step'
import { MagicWandIcon, UserIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect, useRef } from 'react'
import { getGameSessionByGamePin, getActiveGames } from '@/services/quiz_service'
import { GameState } from '@/enums/game_state'
import socketClient from '@/utils/socket/socket.client'
import { SocketEvents } from '@/enums/socket-events'
import NavigationBar from '@/components/navigation/navigation-bar'
import SwipeGames from '@/components/pages/swipe_games'
import { useWorldApp } from '@/hooks/use-world-app'
import { useAccount } from 'wagmi'

const JoinGame = () => {
  const [stepper, setStepper] = useState<JoinGameStep>(JoinGameStep.BROWSEGAMES)
  const { address, isConnected } = useAccount()
  const { isInstalled, walletAddress, username, isAuthenticated, isAuthenticating } = useWorldApp()

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
  const router = useRouter()

  // Refs to avoid stale closures in socket listeners
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

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('pre-game-countdown')
      socket.off('game-started')
      socket.off('game-state-changed')
    }
  }, [router])

  // Pre-fill nickname from World App username or truncated wallet address
  useEffect(() => {
    if (nickname) return
    if (isWorldApp && username) {
      setNickname(username)
    } else if (!isWorldApp && address) {
      setNickname(`${address.slice(0, 6)}...${address.slice(-4)}`)
    }
  }, [isWorldApp, username, address, nickname])

  // Fetch active games on mount and periodically
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

    const isGuest = localStorage.getItem('flamingo_guest') === 'true'

    if (isWorldApp) {
      if (!isAuthenticated && !isAuthenticating) {
        setError('World App authentication still connecting...')
        return
      }
      if (!isAuthenticated) {
        setError('World App authentication still connecting...')
        return
      }
    } else if (!isConnected && !isGuest) {
      setError('Wallet connection lost. Please return to start.')
      setTimeout(() => router.push('/'), 2000)
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

      if (isGameAlreadyRunning) {
        // Game already started — go straight to play
        router.push(`/play?sessionId=${response.payload.id}&playerName=${nickname}&gamePin=${response.payload.gamePin}`)
        setIsSubmitting(false)
        return
      }

      setGameSession(response.payload)

      socketClient.joinGame(response.payload.id, nickname, (userAddress ?? '') as `0x${string}`)

      socketClient.onJoinedGame((data) => {
        console.log('Joined game via WebSocket:', data)
        if (data.success) {
          if (data.gameState === 'countdown' || data.gameState === 'in_progress') {
            router.push(`/play?sessionId=${response.payload.id}&playerName=${nickname}&gamePin=${response.payload.gamePin}`)
          } else {
            setGameSession(response.payload)
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
                  <div className='animate-pulse text-white text-lg'>Loading games...</div>
                </div>
              ) : activeGames.length === 0 ? (
                <div className='flex flex-col items-center gap-4 mt-8'>
                  <p className='text-white/80 text-lg font-semibold text-center'>
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
                <div className='fixed bottom-8 left-1/2 -translate-x-1/2 z-50'>
                  <p className='text-red-500 text-center font-semibold bg-white/95 p-3 rounded-xl shadow-lg text-sm'>
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
                    className='absolute -top-1 -right-1 bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'
                    title='Edit nickname'
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"/>
                    </svg>
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
                        setIsEditingNickname(false)
                      }
                      if (e.key === 'Escape') {
                        setIsEditingNickname(false)
                      }
                    }}
                    onBlur={() => {
                      if (editName.trim().length >= 2) {
                        setNickname(editName.trim())
                      }
                      setIsEditingNickname(false)
                    }}
                  />
                  <button
                    onClick={() => {
                      if (editName.trim().length >= 2) {
                        setNickname(editName.trim())
                      }
                      setIsEditingNickname(false)
                    }}
                    className='text-white/70 hover:text-white text-sm font-semibold cursor-pointer'
                    disabled={editName.trim().length < 2}
                  >
                    Save
                  </button>
                </div>
              ) : (
                <h3 className='text-white text-2xl font-bold text-center'>{nickname}</h3>
              )}
            </div>

            <div className='flex justify-around'>
              <Card className='w-full max-w-md'>
                <CardHeader className='text-center px-8'>
                  {countdown !== null && countdown > 0 ? (
                    <div>
                      <p className='text-5xl font-bold text-[#FF00B7] animate-pulse mb-2'>{countdown}</p>
                      <p className='text-xl font-semibold'>Game starting in {countdown}...</p>
                    </div>
                  ) : (
                    <div>
                      <p className='text-2xl font-semibold mb-2'>You're in!</p>
                      <p className='text-lg font-semibold mb-2'>
                        See your nickname on the host's screen?
                      </p>
                      <p className='text-lg font-semibold mb-2'>Waiting for game to start...</p>
                      <div className='animate-pulse text-black/80 text-sm flex items-center justify-center gap-2'>
                        <span>⏳</span>
                        <span>Get ready!</span>
                      </div>
                    </div>
                  )}
                </CardHeader>
              </Card>
            </div>

            <p className='absolute top-4 right-4 bg-black/50 text-white text-xs p-2 rounded'>
              {isSocketConnected ? 'Connected to game' : 'Reconnecting...'}
            </p>
          </div>
        )
    }
  }

  return renderStep()
}

export default JoinGame