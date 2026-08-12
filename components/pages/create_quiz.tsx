"use client"

import { useState, type ChangeEvent, type MouseEvent } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { JoystickIcon, MagicWandIcon, PlusCircleIcon, XIcon } from '@phosphor-icons/react'
import { toast } from 'sonner'
import Image from 'next/image'
import { circleAnswer, squareAnswer, starAnswer, triangleAnswer } from '@/lib/svg'
import { useRouter } from 'next/navigation'
import { addQuiz, createGameSession } from '@/services/quiz_service'
import { IQuestion, IQuiz } from '@/interfaces/IQuiz'
import { GameMode } from '@/enums/game_mode'

const ANSWER_ICONS = [triangleAnswer, circleAnswer, squareAnswer, starAnswer]

interface CreateQuizProps {
    onSave: (gameSession: any) => void;
    gameMode: GameMode;
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
                    { answer: '', correctAnswer: false }
                ]
            }
        ]
    })

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setQuizData(prev => ({
            ...prev,
            title: e.target.value
        }))
    }

    const handleQuestionChange = (e: ChangeEvent<HTMLInputElement>) => {
        setQuizData(prev => ({
            ...prev,
            questions: prev.questions.map((q, idx) =>
                idx === currentQuestionIndex
                    ? { ...q, question: e.target.value }
                    : q
            )
        }))
    }

    const handleAnswerChange = (answerIndex: number, value: string) => {
        setQuizData(prev => ({
            ...prev,
            questions: prev.questions.map((q, idx) =>
                idx === currentQuestionIndex
                    ? {
                        ...q,
                        answers: q.answers.map((a, aIdx) =>
                            aIdx === answerIndex ? { ...a, answer: value } : a
                        )
                    }
                    : q
            )
        }))
    }

    const handleCorrectAnswerToggle = (answerIndex: number, checked: boolean) => {
        setQuizData(prev => ({
            ...prev,
            questions: prev.questions.map((q, idx) =>
                idx === currentQuestionIndex
                    ? {
                        ...q,
                        answers: q.answers.map((a, aIdx) =>
                            aIdx === answerIndex ? { ...a, correctAnswer: checked } : a
                        )
                    }
                    : q
            )
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
                { answer: '', correctAnswer: false }
            ]
        }

        setQuizData(prev => ({
            ...prev,
            questions: [...prev.questions, newQuestion]
        }))

        setCurrentQuestionIndex(quizData.questions.length)
    }

    const handleQuestionSelect = (index: number) => {
        setCurrentQuestionIndex(index)
    }

    const handleDeleteQuestion = (index: number, e: MouseEvent) => {
        e.stopPropagation()

        if (quizData.questions.length === 1) {
            toast.warning("You must have at least one question")
            return
        }

        setQuizData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, idx) => idx !== index).map((q, idx) => ({
                ...q,
                questionNumber: idx + 1
            }))
        }))

        if (currentQuestionIndex >= quizData.questions.length - 1) {
            setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
        }
    }

    const handleSubmit = async () => {
        // Validate quiz data
        if (!quizData.title.trim()) {
            toast.warning('Please add a quiz title')
            return
        }

        const hasEmptyQuestions = quizData.questions.some(q => !q.question.trim())
        if (hasEmptyQuestions) {
            toast.warning('Please fill in all questions')
            return
        }

        const hasEmptyAnswers = quizData.questions.some(q =>
            q.answers.some(a => !a.answer.trim())
        )
        if (hasEmptyAnswers) {
            toast.warning('Please fill in all answers')
            return
        }

        const hasCorrectAnswers = quizData.questions.every(q =>
            q.answers.some(a => a.correctAnswer)
        )
        if (!hasCorrectAnswers) {
            toast.warning('Each question must have at least one correct answer')
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
            };

            const sessionResponse = await createGameSession(gameConfig)
            console.log('Game session created:', sessionResponse.payload)

            // Pass game session to parent
            onSave(sessionResponse.payload)

        } catch (error) {
            console.error('Failed to create quiz/session:', error)
            toast.error('Failed to create game. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const currentQuestion = quizData.questions[currentQuestionIndex]

    return (
        <div className='flex flex-col md:flex-row gap-4 md:gap-10 h-full w-full max-w-full overflow-hidden'>
            <div className='flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible md:overflow-y-auto min-h-[60px] md:min-h-[110px] gap-1 md:gap-2 px-1 md:px-0 shrink-0'>
                {quizData.questions.map((q, index) => (
                    <Button
                        key={q.questionNumber}
                        variant={currentQuestionIndex === index ? "active" : "default"}
                        size="sidebarquestion"
                        onClick={() => handleQuestionSelect(index)}
                        onDelete={(e) => handleDeleteQuestion(index, e)}
                        showDelete={quizData.questions.length > 1 && currentQuestionIndex === index}
                    >
                        {q.questionNumber}
                    </Button>
                ))}
                <Button
                    variant="default"
                    size="sidebarquestion"
                    onClick={handleAddQuestion}
                >
                    <PlusCircleIcon size={24} />
                </Button>
            </div>

            <div className="flex flex-col w-full gap-3 min-w-0 px-2">
                <Input
                    variant="title"
                    leftIcon={<MagicWandIcon size={24} />}
                    placeholder='Edit Game Title'
                    value={quizData.title}
                    onChange={handleTitleChange}
                />

                <Input
                    variant="question"
                    placeholder='Start Typing Your Question'
                    value={currentQuestion.question}
                    onChange={handleQuestionChange}
                />

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                    {currentQuestion.answers.map((answer, index) => (
                        <Input
                            key={index}
                            variant="answer"
                            leftIcon={<Image src={ANSWER_ICONS[index]} alt="" className='w-5 h-5 sm:w-6 sm:h-6' />}
                            placeholder={`Add Answer ${index + 1}`}
                            rightCheckbox={true}
                            value={answer.answer}
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                            checkboxChecked={answer.correctAnswer}
                            onCheckboxChange={(checked) => handleCorrectAnswerToggle(index, checked)}
                        />
                    ))}
                </div>



                <div className='flex flex-col-reverse md:flex-row justify-end mt-4 gap-2'>
                    <Button
                        leftIcon={<XIcon size={24} color='white' />}
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