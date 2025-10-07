"use client"

import React, { useState } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { JoystickIcon, MagicWandIcon, PlusCircleIcon, XIcon } from '@phosphor-icons/react'
import Image from 'next/image'
import { circleAnswer, squareAnswer, starAnswer, triangleAnswer } from '@/lib/svg'
import { useRouter } from 'next/navigation'

// Types for quiz data
interface Answer {
    text: string
    isCorrect: boolean
    icon: any
}

interface Question {
    id: number
    question: string
    answers: Answer[]
}

interface QuizData {
    title: string
    questions: Question[]
}

const ANSWER_ICONS = [circleAnswer, starAnswer, triangleAnswer, squareAnswer]

const CreateQuiz = ({ onSave }: { onSave: () => void }) => {
    const [quizData, setQuizData] = useState<QuizData>({
        title: '',
        questions: [
            {
                id: 1,
                question: '',
                answers: [
                    { text: '', isCorrect: false, icon: circleAnswer },
                    { text: '', isCorrect: false, icon: starAnswer },
                    { text: '', isCorrect: false, icon: triangleAnswer },
                    { text: '', isCorrect: false, icon: squareAnswer }
                ]
            }
        ]
    })

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const router = useRouter();

    // Update quiz title
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuizData(prev => ({
            ...prev,
            title: e.target.value
        }))
    }

    // Update question text
    const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuizData(prev => ({
            ...prev,
            questions: prev.questions.map((q, idx) =>
                idx === currentQuestionIndex
                    ? { ...q, question: e.target.value }
                    : q
            )
        }))
    }

    // Update answer text
    const handleAnswerChange = (answerIndex: number, value: string) => {
        setQuizData(prev => ({
            ...prev,
            questions: prev.questions.map((q, idx) =>
                idx === currentQuestionIndex
                    ? {
                        ...q,
                        answers: q.answers.map((a, aIdx) =>
                            aIdx === answerIndex ? { ...a, text: value } : a
                        )
                    }
                    : q
            )
        }))
    }

    // Toggle correct answer
    const handleCorrectAnswerToggle = (answerIndex: number, checked: boolean) => {
        setQuizData(prev => ({
            ...prev,
            questions: prev.questions.map((q, idx) =>
                idx === currentQuestionIndex
                    ? {
                        ...q,
                        answers: q.answers.map((a, aIdx) =>
                            aIdx === answerIndex ? { ...a, isCorrect: checked } : a
                        )
                    }
                    : q
            )
        }))
    }

    // Add new question
    const handleAddQuestion = () => {
        const newQuestion: Question = {
            id: quizData.questions.length + 1,
            question: '',
            answers: [
                { text: '', isCorrect: false, icon: circleAnswer },
                { text: '', isCorrect: false, icon: starAnswer },
                { text: '', isCorrect: false, icon: triangleAnswer },
                { text: '', isCorrect: false, icon: squareAnswer }
            ]
        }

        setQuizData(prev => ({
            ...prev,
            questions: [...prev.questions, newQuestion]
        }))

        // Navigate to the new question
        setCurrentQuestionIndex(quizData.questions.length)
    }

    // Navigate to specific question
    const handleQuestionSelect = (index: number) => {
        setCurrentQuestionIndex(index)
    }

    // Delete question
    const handleDeleteQuestion = (index: number, e: React.MouseEvent) => {
        e.stopPropagation() // Prevent button click from triggering

        // Don't allow deleting if it's the only question
        if (quizData.questions.length === 1) {
            alert("You must have at least one question")
            return
        }

        setQuizData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, idx) => idx !== index).map((q, idx) => ({
                ...q,
                id: idx + 1 // Renumber questions
            }))
        }))

        // Adjust current question index if needed
        if (currentQuestionIndex >= quizData.questions.length - 1) {
            setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
        }
    }

    // Submit quiz
    const handleSubmit = () => {
        console.log('Quiz Data:', quizData)
        // Add your submission logic here
        router.push("/lobby");
    }

    const currentQuestion = quizData.questions[currentQuestionIndex]

    return (
        <div className='flex flex-col md:flex-row gap-10 h-full w-screen'>
            {/* Sidebar with question navigation */}
            <div className='flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible md:overflow-y-auto min-h-[110px]'>
                {quizData.questions.map((q, index) => (
                    <Button
                        key={q.id}
                        variant={currentQuestionIndex === index ? "active" : "default"}
                        size="sidebarquestion"
                        onClick={() => handleQuestionSelect(index)}
                        onDelete={(e) => handleDeleteQuestion(index, e)}
                        showDelete={quizData.questions.length > 1 && currentQuestionIndex === index}
                    >
                        Question {q.id}
                    </Button>
                ))}
                <Button
                    variant="default"
                    size="sidebarquestion"
                    onClick={handleAddQuestion}
                >
                    <PlusCircleIcon size={32} />
                </Button>
            </div>

            {/* Main form area */}
            <div className="flex flex-col justify-around w-full gap-3">
                <Input
                    className=''
                    variant="title"
                    leftIcon={<MagicWandIcon size={32} />}
                    placeholder='Edit Game Title'
                    value={quizData.title}
                    onChange={handleTitleChange}
                />

                <Input
                    className=''
                    variant="question"
                    placeholder='Start Typing Your Question'
                    value={currentQuestion.question}
                    onChange={handleQuestionChange}
                />

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-2'>
                    {currentQuestion.answers.map((answer, index) => (
                        <Input
                            key={index}
                            variant="answer"
                            leftIcon={<Image src={answer.icon} alt="" />}
                            placeholder={`Add Answer ${index + 1}`}
                            rightCheckbox={true}
                            value={answer.text}
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                            checkboxChecked={answer.isCorrect}
                            onCheckboxChange={(checked) => handleCorrectAnswerToggle(index, checked)}
                        />
                    ))}
                </div>

                {/* Submit button */}
                <div className='flex flex-col md:flex-row justify-end mt-4 gap-2'>
                    <Button
                        leftIcon={<XIcon size={24} color='white' />}
                        variant="destructive"
                        size="xl"
                    >
                        Cancel
                    </Button>
                    <Button
                        leftIcon={<JoystickIcon size={28} />}
                        variant="active"
                        size="xl"
                        onClick={handleSubmit}
                    >
                        Save & Continue
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default CreateQuiz