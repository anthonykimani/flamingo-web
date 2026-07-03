import { GameState } from "@/enums/game_state";
import { GameMode } from "@/enums/game_mode";
import { IQuiz } from "./IQuiz";

export interface IGameSession {
    id: string;
    gamePin: string;
    quiz: IQuiz;
    gameTitle: string;
    gameMode: GameMode;
    hasPrizes: boolean;
    entryFee?: string;
    prizePool?: number;
    minPlayers: number;
    maxPlayers: number;
    status: GameState;
    isActive: boolean;
    startedAt: string;
    endedAt: string;
    playerAnswers: [];
    createdAt: string;
    updatedAt: string;
    deleted: boolean;
}

export interface IGameConfig {
    quizId: string;
    gameMode: GameMode;
    hasPrizes?: boolean;
    entryFee?: string;
    prizePool?: number;
    minPlayers?: number;
    maxPlayers?: number;
}