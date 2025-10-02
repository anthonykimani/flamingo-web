export interface Answer {
  text: string
  isCorrect: boolean
  icon: any
}

export interface Question {
  id: number
  question: string
  answers: Answer[]
}

export interface QuizData {
  title: string
  questions: Question[]
}