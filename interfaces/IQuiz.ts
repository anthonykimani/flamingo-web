// interfaces/IQuiz.ts
export interface IQuiz {
    id?: string;
    title: string;
    questions: IQuestion[];
    isPublished?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface IQuestion {
    id?: string;
    questionNumber: number;
    question: string;
    answers: IAnswer[];
    createdAt?: string;
}

export interface IAnswer {
    id?: string;
    answer: string;
    correctAnswer: boolean;
    deleted?: boolean;
}

export interface IPlayer {
    id: string;
    playerName: string;
    totalScore: number;
    correctAnswers: number;
    wrongAnswers: number;
    currentStreak: number;
    bestStreak: number;
}