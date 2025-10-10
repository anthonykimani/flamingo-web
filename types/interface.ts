export interface Answer {
    answer: string
    isCorrect: boolean
    icon: any
}

export interface Question {
    questionNumber: number
    question: string
    answers: Answer[]
}

export interface QuizData {
    title: string
    questions: Question[]
}
