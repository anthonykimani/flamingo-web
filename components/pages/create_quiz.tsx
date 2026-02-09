'use client'

import React, { useState } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import {
  JoystickIcon,
  MagicWandIcon,
  PlusCircleIcon,
  XIcon,
  CoinsIcon,
} from '@phosphor-icons/react'
import Image from 'next/image'
import { circleAnswer, squareAnswer, starAnswer, triangleAnswer } from '@/lib/svg'
import { useRouter } from 'next/navigation'
import { addQuiz, createGameSession } from '@/services/quiz_service'
import { IQuestion, IQuiz } from '@/interfaces/IQuiz'
import { GameMode } from '@/enums/game_mode'
import { Card } from '../ui/card'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'

const ANSWER_ICONS = [circleAnswer, starAnswer, triangleAnswer, squareAnswer]

interface CreateQuizProps {
  onSave: (gameSession: any) => void
  gameMode: GameMode
}

const CreateQuiz = ({ onSave, gameMode }: CreateQuizProps) => {
  const [quizData, setQuizData] = useState<IQuiz>({
    title: '',
    questions: [
      {
        questionNumber: 1,
        question: '',
        answers: [
          { answer: '', correctAnswer: false },
          { answer: '', correctAnswer: false },
          { answer: '', correctAnswer: false },
          { answer: '', correctAnswer: false },
        ],
      },
    ],
  })

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [hasPrizes, setHasPrizes] = useState(false)
  const [prizePool, setPrizePool] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuizData((prev) => ({
      ...prev,
      title: e.target.value,
    }))
  }

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, idx) =>
        idx === currentQuestionIndex ? { ...q, question: e.target.value } : q
      ),
    }))
  }

  const handleAnswerChange = (answerIndex: number, value: string) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, idx) =>
        idx === currentQuestionIndex
          ? {
              ...q,
              answers: q.answers.map((a, aIdx) =>
                aIdx === answerIndex ? { ...a, answer: value } : a
              ),
            }
          : q
      ),
    }))
  }

  const handleCorrectAnswerToggle = (answerIndex: number, checked: boolean) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, idx) =>
        idx === currentQuestionIndex
          ? {
              ...q,
              answers: q.answers.map((a, aIdx) =>
                aIdx === answerIndex ? { ...a, correctAnswer: checked } : a
              ),
            }
          : q
      ),
    }))
  }

  const handleAddQuestion = () => {
    const newQuestion: IQuestion = {
      questionNumber: quizData.questions.length + 1,
      question: '',
      answers: [
        { answer: '', correctAnswer: false },
        { answer: '', correctAnswer: false },
        { answer: '', correctAnswer: false },
        { answer: '', correctAnswer: false },
      ],
    }

    setQuizData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }))

    setCurrentQuestionIndex(quizData.questions.length)
  }

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  const handleDeleteQuestion = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()

    if (quizData.questions.length === 1) {
      alert('You must have at least one question')
      return
    }

    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions
        .filter((_, idx) => idx !== index)
        .map((q, idx) => ({
          ...q,
          questionNumber: idx + 1,
        })),
    }))

    if (currentQuestionIndex >= quizData.questions.length - 1) {
      setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
    }
  }

  const handleSubmit = async () => {
    // Validate quiz data
    if (!quizData.title.trim()) {
      alert('Please add a quiz title')
      return
    }

    const hasEmptyQuestions = quizData.questions.some((q) => !q.question.trim())
    if (hasEmptyQuestions) {
      alert('Please fill in all questions')
      return
    }

    const hasEmptyAnswers = quizData.questions.some((q) => q.answers.some((a) => !a.answer.trim()))
    if (hasEmptyAnswers) {
      alert('Please fill in all answers')
      return
    }

    const hasCorrectAnswers = quizData.questions.every((q) =>
      q.answers.some((a) => a.correctAnswer)
    )
    if (!hasCorrectAnswers) {
      alert('Each question must have at least one correct answer')
      return
    }

    // Validate prize settings
    if (hasPrizes && !prizePool.trim()) {
      alert('Please enter a prize pool amount')
      return
    }

    if (hasPrizes && parseFloat(prizePool) <= 0) {
      alert('Prize pool must be greater than 0')
      return
    }

    try {
      setIsSubmitting(true)

      // Create quiz
      const quizResponse = await addQuiz(quizData)
      console.log('Quiz created:', quizResponse.payload)

      // Create game session with config
      const gameConfig = {
        quizId: quizResponse.payload.id,
        gameMode,
        hasPrizes,
        ...(hasPrizes && {
          prizePool: parseFloat(prizePool),
          minPlayers: 3, // Prizes require minimum 3 players
        }),
      }

      const sessionResponse = await createGameSession(gameConfig)
      console.log('Game session created:', sessionResponse.payload)

      // Pass game session to parent
      onSave(sessionResponse.payload)
    } catch (error) {
      console.error('Failed to create quiz/session:', error)
      alert('Failed to create game. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentQuestion = quizData.questions[currentQuestionIndex]

  return (
    <div className="flex h-full w-screen flex-col gap-10 md:flex-row">
      <div className="flex min-h-[110px] flex-row overflow-x-auto md:flex-col md:overflow-x-visible md:overflow-y-auto">
        {quizData.questions.map((q, index) => (
          <Button
            key={q.questionNumber}
            variant={currentQuestionIndex === index ? 'active' : 'default'}
            size="sidebarquestion"
            onClick={() => handleQuestionSelect(index)}
            onDelete={(e) => handleDeleteQuestion(index, e)}
            showDelete={quizData.questions.length > 1 && currentQuestionIndex === index}
          >
            Question {q.questionNumber}
          </Button>
        ))}
        <Button variant="default" size="sidebarquestion" onClick={handleAddQuestion}>
          <PlusCircleIcon size={32} />
        </Button>
      </div>

      <div className="flex w-full flex-col justify-around gap-3">
        <Input
          className=""
          variant="title"
          leftIcon={<MagicWandIcon size={32} />}
          placeholder="Edit Game Title"
          value={quizData.title}
          onChange={handleTitleChange}
        />

        <Input
          className=""
          variant="question"
          placeholder="Start Typing Your Question"
          value={currentQuestion.question}
          onChange={handleQuestionChange}
        />

        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          {currentQuestion.answers.map((answer, index) => (
            <Input
              key={index}
              variant="answer"
              leftIcon={<Image src={ANSWER_ICONS[index]} alt="" />}
              placeholder={`Add Answer ${index + 1}`}
              rightCheckbox={true}
              value={answer.answer}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              checkboxChecked={answer.correctAnswer}
              onCheckboxChange={(checked) => handleCorrectAnswerToggle(index, checked)}
            />
          ))}
        </div>

        {/* Prize Configuration - Only for Hangouts mode */}
        {gameMode === GameMode.HANGOUTS && (
          <Card className="bg-white/90 p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CoinsIcon size={24} />
                  <Label
                    htmlFor="prizes-toggle-create"
                    className="cursor-pointer text-lg font-semibold"
                  >
                    Enable Prizes/Payouts
                  </Label>
                </div>
                <Switch
                  id="prizes-toggle-create"
                  checked={hasPrizes}
                  onCheckedChange={setHasPrizes}
                />
              </div>

              {hasPrizes && (
                <div className="animate-fadeIn flex flex-col gap-2">
                  <Label htmlFor="prize-pool-create" className="text-sm">
                    Prize Pool Amount (ETH)
                  </Label>
                  <Input
                    id="prize-pool-create"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.1"
                    value={prizePool}
                    onChange={(e) => setPrizePool(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600">
                    ⚠️ Enabling prizes requires a minimum of 3 players to start the game.
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Other game modes show prize info */}
        {gameMode !== GameMode.HANGOUTS && (
          <Card className="border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-2">
              <CoinsIcon size={24} className="text-blue-600" />
              <p className="text-sm text-blue-800">
                {gameMode === GameMode.DEGEN_PVP
                  ? 'This mode includes prizes by default. Min 3 players required.'
                  : 'This mode will include prizes in future updates.'}
              </p>
            </div>
          </Card>
        )}

        <div className="mt-4 flex flex-col-reverse justify-end gap-2 md:flex-row">
          <Button
            leftIcon={<XIcon size={24} color="white" />}
            variant="destructive"
            size="xl"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            leftIcon={<JoystickIcon size={28} />}
            variant="active"
            size="xl"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Save & Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CreateQuiz
