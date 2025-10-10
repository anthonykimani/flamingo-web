'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { JoystickIcon, SquareIcon, StarIcon, CircleIcon, TriangleIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

// Dummy questions data - replace this with API data later
const dummyQuestions = [
    {
        id: 1,
        question: "Who is Satoshi Nakamoto?",
        timer: 10,
        options: [
            { id: 1, text: "Anonymous Bitcoin Creator", icon: SquareIcon },
            { id: 2, text: "Elon Musk", icon: CircleIcon },
            { id: 3, text: "Vitalik Buterin", icon: TriangleIcon },
            { id: 4, text: "Craig Wright", icon: StarIcon }
        ]
    },
    {
        id: 2,
        question: "What year was Bitcoin created?",
        timer: 8,
        options: [
            { id: 1, text: "2007", icon: SquareIcon },
            { id: 2, text: "2009", icon: CircleIcon },
            { id: 3, text: "2011", icon: TriangleIcon },
            { id: 4, text: "2013", icon: StarIcon }
        ]
    },
    {
        id: 3,
        question: "What is the maximum supply of Bitcoin?",
        timer: 12,
        options: [
            { id: 1, text: "21 million", icon: SquareIcon },
            { id: 2, text: "100 million", icon: CircleIcon },
            { id: 3, text: "No limit", icon: TriangleIcon },
            { id: 4, text: "50 million", icon: StarIcon }
        ]
    },
    {
        id: 4,
        question: "What is a blockchain?",
        timer: 15,
        options: [
            { id: 1, text: "Distributed ledger", icon: SquareIcon },
            { id: 2, text: "Type of cryptocurrency", icon: CircleIcon },
            { id: 3, text: "Mining software", icon: TriangleIcon },
            { id: 4, text: "Digital wallet", icon: StarIcon }
        ]
    },
    {
        id: 5,
        question: "Which consensus mechanism does Bitcoin use?",
        timer: 10,
        options: [
            { id: 1, text: "Proof of Work", icon: SquareIcon },
            { id: 2, text: "Proof of Stake", icon: CircleIcon },
            { id: 3, text: "Delegated PoS", icon: TriangleIcon },
            { id: 4, text: "Proof of Authority", icon: StarIcon }
        ]
    }
]

const GamePage = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answersReceived, setAnswersReceived] = useState(2) // Simulated answer count
    const router = useRouter();

    const currentQuestion = dummyQuestions[currentQuestionIndex]

    const handleNextQuestion = () => {
        if (currentQuestionIndex < dummyQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
            // Reset answers for new question
            setAnswersReceived(Math.floor(Math.random() * 5)) // Random for demo
        } else {
            router.push("/score")
        }
    }

    return (
        <div className='game-pin-background h-screen bg-no-repeat bg-cover flex justify-around '>
            <div className='w-full md:w-1/2 flex flex-col justify-center gap-10'>
                <Card>
                    <CardHeader className='text-3xl text-center'>
                        {currentQuestion.question}
                    </CardHeader>
                </Card>
                <div className='flex justify-between'>
                    <div className='border-2 border-black p-5 font-[Oi] text-white text-3xl rounded-full bg-[#F24E1E]'>
                        {currentQuestion.timer}
                    </div>
                    <Button
                        variant="active"
                        size="xl"
                    >
                        {answersReceived} Answers
                    </Button>
                </div>
                <div className='grid grid-cols-2 gap-2'>
                    {currentQuestion.options.map((option) => {
                        const IconComponent = option.icon
                        return (
                            <Button
                                key={option.id}
                                leftIcon={<IconComponent size={32} />}
                                variant="active"
                                size="xl"
                            >
                                {option.text}
                            </Button>
                        )
                    })}
                </div>
                <div className='flex flex-col md:flex-row justify-between items-center mt-4 gap-2'>
                    <div className='text-white text-lg font-semibold'>
                        Question {currentQuestionIndex + 1} of {dummyQuestions.length}
                    </div>
                    <Button
                        leftIcon={<JoystickIcon size={28} />}
                        variant="active"
                        size="xl"
                        onClick={handleNextQuestion}
                    >
                        {currentQuestionIndex < dummyQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default GamePage