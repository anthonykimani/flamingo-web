'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  JoystickIcon,
  SquareIcon,
  StarIcon,
  CircleIcon,
  TriangleIcon,
  UserIcon,
} from '@phosphor-icons/react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { getGameSession, getGameSessionByGamePin, getQuizById } from '@/services/quiz_service'
import { IPlayer, IQuiz } from '@/interfaces/IQuiz'
import { GameState } from '@/enums/game_state'
import socketClient from '@/utils/socket/socket.client'

// Icon mapping for answers
const ANSWER_CONFIG = [
  { Icon: SquareIcon, color: 'bg-[#009900]', borderColor: 'border-[#006600]' },
  { Icon: StarIcon, color: 'bg-[#FF9700]', borderColor: 'border-[#cc7800]' },
  { Icon: TriangleIcon, color: 'bg-[#2819DB]', borderColor: 'border-[#1a0f8a]' },
  { Icon: CircleIcon, color: 'bg-[#F14100]', borderColor: 'border-[#b33000]' },
]

const GamePage = () => {
  const [quizData, setQuizData] = useState<IQuiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answersReceived, setAnswersReceived] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(10)
  const [leaderboard, setLeaderboard] = useState<IPlayer[]>([])
  const [playersAnswered, setPlayersAnswered] = useState<Set<string>>(new Set())
  const [isConnected, setIsConnected] = useState(false)
  const [gameState, setGameState] = useState<GameState>(GameState.WAITING)
  const [countdown, setCountdown] = useState<number | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const gamePinId = searchParams.get('gamePin')
  const sessionId = searchParams.get('sessionId')

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!gamePinId) {
        setError('No gamePin ID provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const gamePinData = await getGameSessionByGamePin(gamePinId)
        const response = await getQuizById(gamePinData.payload.quiz.id)
        setQuizData(response.payload)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quiz')
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [gamePinId])

  // Handle countdown timer
  useEffect(() => {
    if (countdown === null || countdown <= 0) return

    const countdownTimer = setTimeout(() => {
      setCountdown((prev) => prev! - 1)
    }, 1000)

    return () => clearTimeout(countdownTimer)
  }, [countdown])

  // Connect to WebSocket and setup listeners
  useEffect(() => {
    if (!sessionId) return

    const socket = socketClient.connect()

    // Sync state on mount (handles page refresh)
    if (socket.connected && sessionId) {
      getGameSession(sessionId)
        .then((response) => {
          setGameState(response.payload.status as GameState)
          setCurrentQuestionIndex(response.payload.currentQuestionIndex)
          setTimeLeft(response.payload.timeLeft)
        })
        .catch(console.error)
    }

    if (socket.connected) {
      console.log('✅ Already connected to WebSocket')
      setIsConnected(true)
    }

    socket.on('connect', () => {
      console.log('✅ Host connected to WebSocket')
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('❌ Host disconnected from WebSocket')
      setIsConnected(false)
    })

    // Listen for countdown ticks from backend
    socket.on('countdown-tick', (data) => {
      console.log('⏳ Countdown tick:', data.countdown)
      setCountdown(data.countdown)
      setGameState(GameState.COUNTDOWN)
    })

    // Listen for real-time timer updates from backend
    socket.on('time-update', (data) => {
      setTimeLeft(data.timeLeft)
    })

    socket.on('game-state-changed', (data: { state: GameState }) => {
      console.log('🔄 Game state changed:', data.state)
      setGameState(data.state)
    })

    // Listen for player answers in real-time
    socketClient.onPlayerAnswered((data) => {
      console.log('✅ Player answered:', data.playerName)
      setPlayersAnswered((prev) => new Set([...prev, data.playerName]))
      setAnswersReceived(data.answerCount)
    })

    // Listen for question results (when timer hits 0)
    socketClient.onQuestionResults((data) => {
      console.log('📊 Question results:', data)
      setLeaderboard(data.leaderboard)
      setGameState(GameState.RESULTS_READY)
    })

    // Listen for question started (after countdown)
    socket.on('question-started', (data) => {
      console.log('⏱️ Question timer started:', data)
      setGameState(GameState.IN_PROGRESS)
      setCountdown(null)
    })

    // Cleanup
    return () => {
      socketClient.off('player-answered')
      socketClient.off('question-results')
      socket.off('question-started')
      socket.off('countdown-tick')
      socket.off('time-update')
      socket.off('game-state-changed')
    }
  }, [sessionId])

  // Reset answer tracking when moving to next question
  useEffect(() => {
    setPlayersAnswered(new Set())
    setAnswersReceived(0)
  }, [currentQuestionIndex])

  const handleNextQuestion = async () => {
    if (!quizData || !sessionId) return

    if (currentQuestionIndex < quizData.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)
      setGameState(GameState.IN_PROGRESS)

      // Emit WebSocket event for next question - backend handles timer
      socketClient.nextQuestion(sessionId, nextIndex)
    } else {
      // Game finished
      setGameState(GameState.COMPLETED)

      // Emit game ended event
      socketClient.endGame(sessionId)

      // Navigate to final score
      router.push(`/score?sessionId=${sessionId}`)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="game-pin-background flex h-screen items-center justify-center bg-cover bg-no-repeat">
        <Card>
          <CardHeader className="text-2xl">Loading quiz...</CardHeader>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !quizData) {
    return (
      <div className="game-pin-background flex h-screen items-center justify-center bg-cover bg-no-repeat">
        <Card>
          <CardHeader className="text-2xl text-red-500">{error || 'Quiz not found'}</CardHeader>
        </Card>
      </div>
    )
  }

  // Connection waiting
  if (!isConnected) {
    return (
      <div className="game-pin-background flex h-screen items-center justify-center bg-cover bg-no-repeat">
        <Card>
          <CardHeader className="text-2xl">Connecting to game server...</CardHeader>
        </Card>
      </div>
    )
  }

  const currentQuestion = quizData.questions[currentQuestionIndex]

  // Show countdown screen before question starts
  if (countdown !== null && countdown > 0) {
    return (
      <div className="game-pin-background flex h-screen items-center justify-center bg-cover bg-no-repeat">
        <div className="text-center">
          <div className="mb-4 animate-pulse text-9xl font-bold text-white">{countdown}</div>
          <p className="text-2xl text-white">Get Ready!</p>
        </div>
      </div>
    )
  }

  // Show result screen
  if (gameState === GameState.RESULTS_READY || gameState === GameState.PAYOUT) {
    return (
      <div className="result-background flex h-screen flex-col items-center justify-center bg-cover bg-no-repeat p-4">
        <div className="w-full max-w-3xl space-y-6">
          {/* Leaderboard Card */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="py-6">
              <h3 className="mb-6 text-center text-3xl font-bold">Scoreboard</h3>
              <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-2">
                {leaderboard.length === 0 ? (
                  <p className="py-8 text-center text-gray-500">Loading scores...</p>
                ) : (
                  leaderboard.map((player, index) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-4 rounded-lg bg-slate-50 p-4"
                    >
                      <div className="w-10 text-center text-2xl font-bold">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </div>
                      <div className="flex flex-1 items-center gap-3">
                        <h3 className="truncate text-xl font-semibold">{player.playerName}</h3>
                      </div>
                      <div className="text-3xl font-bold text-slate-700">{player.totalScore}</div>
                    </div>
                  ))
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Next Button */}
          <div className="flex justify-center">
            <Button
              leftIcon={<JoystickIcon size={28} />}
              variant="active"
              size="xl"
              onClick={handleNextQuestion}
              className="px-8 text-xl"
            >
              {currentQuestionIndex < quizData.questions.length - 1
                ? 'Next Question'
                : 'View Final Score'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show question screen
  return (
    <div className="game-pin-background flex h-full justify-around bg-cover bg-no-repeat md:h-screen">
      <div className="flex w-full flex-col justify-center gap-10 px-4">
        {/* Connection Status */}
        <div className="absolute top-4 right-4">
          <span className="text-sm text-white">{isConnected ? '🟢 Live' : '🔴 Offline'}</span>
        </div>

        {/* Question */}
        <Card>
          <CardHeader className="text-center text-3xl">{currentQuestion.question}</CardHeader>
        </Card>

        {/* Answer Options */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {currentQuestion.answers.map((answer, index) => {
            const { Icon, color, borderColor } = ANSWER_CONFIG[index % ANSWER_CONFIG.length]
            return (
              <Card
                key={answer.id}
                className={`${color} ${borderColor} relative flex h-[150px] cursor-default items-center justify-center border-2 border-r-[6px] border-b-[6px]`}
              >
                <div className="absolute top-1/2 left-6 -translate-y-1/2">
                  <Icon size={48} color="white" weight="fill" />
                </div>
                <CardContent className="flex w-full items-center justify-center pr-6 pl-20">
                  <p className="line-clamp-3 overflow-hidden text-center text-4xl font-bold break-words text-white">
                    {answer.answer}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Timer and Answers Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xl text-white">
            <div className="rounded-full border-2 border-black bg-[#F24E1E] p-5 font-[Oi] text-3xl text-white">
              {timeLeft}
            </div>
            <p className="ml-2">seconds remaining</p>
          </div>
          <Button variant="active" size="xl">
            Question {currentQuestionIndex + 1} of {quizData.questions.length}
          </Button>
        </div>

        {/* Players Who Answered (Real-time) */}
        {playersAnswered.size > 0 && (
          <Card>
            <CardHeader>
              <p className="text-sm text-gray-600">Players who answered:</p>
              <div className="flex flex-wrap gap-2">
                {Array.from(playersAnswered).map((playerName) => (
                  <span
                    key={playerName}
                    className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
                  >
                    {playerName} ✓
                  </span>
                ))}
              </div>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  )
}

export default GamePage
