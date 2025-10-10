export interface IQuiz {
    title: string;
    questions: IQuestion[];
}

export const QUIZ: IQuiz = {
    title: "",
    questions: []
}

export interface IQuestion {
    questionNumber: number;
    question: string;
    answers: IAnswer[];
}

export const QUESTION: IQuestion = {
    questionNumber: 1,
    question: "",
    answers: []
}

export interface IAnswer {
    answer: string;
    correctAnswer: boolean;
}

export const ANSWER: IAnswer = {
    answer: "",
    correctAnswer: false,
}