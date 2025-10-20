import { GameState } from "@/enums/game_state";
import { IQuiz } from "./IQuiz";

export interface IGameSession {
    id: string;
    gamePin: string;
    quiz: IQuiz;
    gameTitle: string;
    entryFee: string;
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