'use client'

import { CountdownScreen } from '@/components/game/CountdownScreen'
import { LeaderboardCard } from '@/components/game/LeaderboardCard'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { GameState } from '@/enums/game_state'
import { SocketEvents } from '@/enums/socket-events'
import { IAnswer, IPlayer, IQuestion } from '@/interfaces/IQuiz'
import { getGameSession } from '@/services/quiz_service'
import socketClient from '@/utils/socket/socket.client'
import { CircleIcon, SquareIcon, StarIcon, TriangleIcon } from '@phosphor-icons/react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const ANSWER_CONFIG = [
  { Icon: TriangleIcon, color: 'bg-[#009900]', borderColor: 'border-[#006600]' },
  { Icon: CircleIcon, color: 'bg-[#FF9700]', borderColor: 'border-[#cc7800]' },
  { Icon: SquareIcon, color: 'bg-[#2819DB]', borderColor: 'border-[#1a0f8a]' },
  { Icon: StarIcon, color: 'bg-[#F14100]', borderColor: 'border-[#b33000]' },
]

const PlayGame = () => {
  const [question, setQuestion] = useState<IQuestion | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(10)
  const [gameState, setGameState] = useState<GameState>(GameState.WAITING)
  const [playerScore, setPlayerScore] = useState(0)
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [answerResult, setAnswerResult] = useState<{
    isCorrect: boolean
    pointsEarned: number
    currentStreak: number
  } | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null)
  const [leaderboard, setLeaderboard] = useState<IPlayer[]>([])

  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')
  const playerName = searchParams.get('playerName')

  useEffect(() => {
    if (!sessionId || !playerName) {
      console.error('Missing sessionId or playerName')
      return
    }

    const socket = socketClient.connect()

    if (socket.connected && sessionId) {
      getGameSession(sessionId)
        .then((response) => {
          setGameState(response.payload.status as GameState)
        })
        .catch(console.error)
    }

    // Listen for countdown
    socket.on('countdown-tick', (data: { count: number }) => {
      console.log('⏰ Countdown:', data.count)
      setCountdown(data.count)
      setGameState(GameState.COUNTDOWN)
    })

    // Listen for question started
    socketClient.onQuestionStarted(
      (data: {
        question: IQuestion
        questionIndex: number
        duration: number
        startTime: Date
        totalQuestions: number
      }) => {
        console.log('📝 Question started:', data)
        setQuestion(data.question)
        setTimeLeft(data.duration)
        setCurrentQuestionNumber(data.questionIndex + 1)
        setTotalQuestions(data.totalQuestions)
        setSelectedAnswer(null)
        setHasAnswered(false)
        setAnswerResult(null)
        setGameState(GameState.IN_PROGRESS)
        setCountdown(null)
        setQuestionStartTime(new Date(data.startTime))
      }
    )

    // Listen for time updates
    socket.on('time-update', (data: { timeLeft: number }) => {
      setTimeLeft(data.timeLeft)
    })

    // Listen for answer confirmation
    socketClient.onAnswerSubmitted(
      (data: {
        success: boolean
        isCorrect: boolean
        pointsEarned: number
        currentStreak: number
        totalScore: number
      }) => {
        console.log('✅ Answer submitted:', data)
        setAnswerResult({
          isCorrect: data.isCorrect,
          pointsEarned: data.pointsEarned,
          currentStreak: data.currentStreak,
        })
        setPlayerScore(data.totalScore)
        setHasAnswered(true)
      }
    )

    // Listen for question results
    socketClient.onQuestionResults((data: { leaderboard: any[] }) => {
      console.log('📊 Question results:', data)
      setLeaderboard(data.leaderboard)
      setGameState(GameState.RESULTS_READY)
    })

    // Listen for game ended
    socketClient.onGameEnded((data: { leaderboard: any[] }) => {
      console.log('🏁 Game ended:', data)
      router.push(`/score?sessionId=${sessionId}`)
    })

    // Listen for errors
    socketClient.onError((data: { message: string }) => {
      console.error('⚠️ Socket error:', data.message)
      alert(data.message)
    })

    return () => {
      socket.off('countdown-tick')
      socket.off('time-update')
      socketClient.off(SocketEvents.QUESTION_STARTED)
      socketClient.off(SocketEvents.ANSWER_SUBMITTED)
      socketClient.off(SocketEvents.QUESTION_RESULTS)
      socketClient.off(SocketEvents.GAME_ENDED)
      socketClient.off(SocketEvents.ERROR)
      socket.off('game-state-changed')
    }
  }, [sessionId, playerName, router])

  const handleAnswerSelect = async (answer: IAnswer) => {
    if (hasAnswered || !question || !sessionId || !playerName || !questionStartTime) return

    setSelectedAnswer(answer.id!)

    // Calculate time to answer
    const timeToAnswer = (new Date().getTime() - questionStartTime.getTime()) / 1000

    // Submit answer via WebSocket
    socketClient.submitAnswer({
      gameSessionId: sessionId,
      playerName: playerName,
      questionId: question.id!,
      answerId: answer.id!,
      timeToAnswer: Math.round(timeToAnswer),
    })
  }

  // FIX #2: Show countdown UI (like GamePage)
  if (countdown !== null && gameState === GameState.COUNTDOWN) {
    return <CountdownScreen countdown={countdown} />
  }

  // FIX #4: Only show waiting screen for WAITING state, and make it clearer
  if (gameState === GameState.WAITING) {
    return (
      <div className="game-pin-background flex h-screen items-center justify-center bg-cover bg-no-repeat">
        <Card className="mx-4 w-full max-w-md">
          <CardHeader className="text-center">
            <div className="animate-pulse">
              <p className="mb-4 text-2xl font-bold">⏳ Loading Game...</p>
              <p className="text-sm text-gray-600">Waiting for host to start the game</p>
              <div className="mt-4 text-xs text-gray-500">
                Player: <strong>{playerName}</strong>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Show results screen
  if (gameState === GameState.RESULTS_READY) {
    return (
      <div className="result-background flex h-screen flex-col items-center justify-center bg-cover bg-no-repeat px-1 py-4">
        <div className="w-full max-w-2xl space-y-6">
          {/* Answer Result Card */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-4 py-8 text-center">
              <h2 className="text-4xl font-bold">
                {answerResult?.isCorrect ? '✅ Correct!' : '❌ Wrong!'}
              </h2>

              {answerResult && (
                <>
                  <div className="text-6xl font-bold text-blue-600">
                    +{answerResult.pointsEarned}
                  </div>
                  <div className="flex items-center justify-center gap-6 text-lg">
                    <div className="font-semibold">
                      Total: <span className="text-2xl text-blue-600">{playerScore}</span>
                    </div>
                    {answerResult.currentStreak > 0 && (
                      <div className="font-semibold text-orange-600">
                        🔥 {answerResult.currentStreak}x
                      </div>
                    )}
                  </div>
                </>
              )}

              {!answerResult && hasAnswered && (
                <div className="text-xl text-gray-600">Answer recorded! Calculating results...</div>
              )}

              {!hasAnswered && <div className="text-xl text-gray-600">Time&apos;s up!</div>}
            </CardHeader>
          </Card>

          <LeaderboardCard
            leaderboard={leaderboard}
            highlightPlayerName={playerName ?? undefined}
          />
        </div>
      </div>
    )
  }
  // Show question
  if (question && gameState === GameState.IN_PROGRESS) {
    return (
      <div className="game-pin-background flex h-screen flex-col justify-between bg-cover bg-no-repeat p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-white">
            Question {currentQuestionNumber}/{totalQuestions}
          </div>
          <div className="rounded bg-black/50 px-4 py-2 text-2xl font-bold text-white">
            ⏱️ {timeLeft}s
          </div>
          <div className="text-xl font-bold text-white">Score: {playerScore}</div>
        </div>

        {/* Question */}
        <Card className="w-full">
          <CardHeader className="text-center text-2xl font-bold">{question.question}</CardHeader>
        </Card>

        {/* Answers Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {question.answers?.map((answer, index) => {
            const { Icon, color, borderColor } = ANSWER_CONFIG[index % ANSWER_CONFIG.length]
            const isSelected = selectedAnswer === answer.id

            return (
              <Button
                key={answer.id}
                onClick={() => handleAnswerSelect(answer)}
                disabled={hasAnswered}
                leftIcon={<Icon size={32} color="white" weight="fill" />}
                className={` ${color} border-2 ${borderColor} border-r-[6px] border-b-[6px] ${isSelected ? 'ring-4 ring-white' : ''} ${hasAnswered ? 'cursor-not-allowed opacity-50 active:border-r-[6px] active:border-b-[6px]' : 'hover:scale-105 active:border-r-2 active:border-b-2'} min-h-[80px] text-left text-lg font-bold text-white transition-all sm:min-h-[100px] sm:text-xl`}
                variant="active"
                size="xl"
              >
                {answer.answer}
              </Button>
            )
          })}
        </div>

        {/* Status Message */}
        <div className="text-center">
          {hasAnswered ? (
            <Card>
              <CardHeader>
                <p className="text-lg font-semibold">Answer submitted! ✅ Waiting for results...</p>
              </CardHeader>
            </Card>
          ) : (
            <p className="text-lg text-white">Select your answer!</p>
          )}
        </div>
      </div>
    )
  }

  // Fallback loading state
  return (
    <div className="game-pin-background flex h-screen items-center justify-center bg-cover bg-no-repeat">
      <Card>
        <CardHeader className="text-2xl">
          <div className="animate-pulse">Connecting...</div>
        </CardHeader>
      </Card>
    </div>
  )
}

export default PlayGame
