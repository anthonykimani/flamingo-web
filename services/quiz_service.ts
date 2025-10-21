import { GameState } from "@/enums/game_state";
import { IQuiz } from "@/interfaces/IQuiz";
import { IResponse } from "@/interfaces/IResponse";
import { apiOptions } from "@/shared/api.config";
import Http from "@/shared/http.config";


export async function addQuiz(gameData: IQuiz): Promise<IResponse> {
    const response = await Http.post(
        `${apiOptions.endpoints.gameService}/quizzes/createQuiz`, gameData
    );

    if (response.payload.status == 200) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload.status,
            ok: response.ok,
            statusText: response.payload.statusText,
            json: response.payload.json,
        }
    }
    throw new Error(`
        Failed to add reward program: ${response.payload.message}`);
}

export async function addAgentQuiz(prompt: string): Promise<IResponse> {
    const response = await Http.post(
        `${apiOptions.endpoints.gameService}/quizzes/createAgentQuiz`, {
        "prompt": prompt
    }
    );

    if (response.payload.status == 200) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload.status,
            ok: response.ok,
            statusText: response.payload.statusText,
            json: response.payload.json,
        }
    }
    throw new Error(`
        Failed to add reward program: ${response.payload.message}`);
}


export async function getQuizById(id: string): Promise<IResponse> {
    const response = await Http.get(`${apiOptions.endpoints.gameService}/quizzes/quiz/${id}`)

    if (response.payload.status === 200) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload.status,
            ok: response.ok,
            statusText: response.payload.statusText,
            json: response.payload.json,
        }
    }
    throw new Error(`
        Failed to add reward program: ${response.payload.message}`);
}

export async function createGameSession(quizId: string): Promise<IResponse> {
    const response = await Http.post(
        `${apiOptions.endpoints.gameService}/games/create-session`,
        { quizId }
    );

    if (response.payload.status === 200) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload.status,
            ok: response.ok,
            statusText: response.payload.statusText,
            json: response.payload.json,
        };
    }
    throw new Error(`Failed to create game session: ${response.payload.message}`);
}

export async function joinGame(gamePin: string): Promise<IResponse> {
    const response = await Http.post(
        `${apiOptions.endpoints.gameService}/games/join`,
        { gamePin }
    );

    if (response.payload.status === 200) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload.status,
            ok: response.ok,
            statusText: response.payload.statusText,
            json: response.payload.json,
        };
    }
    throw new Error(`Failed to join game: ${response.payload.message}`);
}

export async function submitAnswer(answerData: {
    gameSessionId: string;
    playerName: string;
    questionId: string;
    answerId: string;
    isCorrect: boolean;
    pointsEarned: number;
    answerStreak: number;
    timeToAnswer: number;
}): Promise<IResponse> {
    const response = await Http.post(
        `${apiOptions.endpoints.gameService}/games/submit-answer`,
        answerData
    );

    if (response.payload.status === 200) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload.status,
            ok: response.ok,
            statusText: response.payload.statusText,
            json: response.payload.json,
        };
    }
    throw new Error(`Failed to submit answer: ${response.payload.message}`);
}

export async function getLeaderboard(gameSessionId: string): Promise<IResponse> {
    const response = await Http.get(
        `${apiOptions.endpoints.gameService}/games/leaderboard/${gameSessionId}`
    );

    if (response.payload.status === 200) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload.status,
            ok: response.ok,
            statusText: response.payload.statusText,
            json: response.payload.json,
        };
    }
    throw new Error(`Failed to get leaderboard: ${response.payload.message}`);
}

export async function getPlayerStats(gameSessionId: string, playerName: string): Promise<IResponse> {
    const response = await Http.get(
        `${apiOptions.endpoints.gameService}/games/player-stats/${gameSessionId}/${playerName}`
    );

    if (response.payload.status === 200) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload.status,
            ok: response.ok,
            statusText: response.payload.statusText,
            json: response.payload.json,
        };
    }
    throw new Error(`Failed to get player stats: ${response.payload.message}`);
}

export async function addPlayer(playerData: {
    playerName: string;
    gameSessionId: string;
}): Promise<IResponse> {
    const response = await Http.post(
        `${apiOptions.endpoints.gameService}/players/createPlayer`,
        playerData
    );

    if (response.payload.status === 200) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload.status,
            ok: response.ok,
            statusText: response.payload.statusText,
            json: response.payload.json,
        };
    }
    throw new Error(`Failed to add player: ${response.payload.message}`);
}

export async function startGame(id: string, gameState: GameState): Promise<IResponse> {
    const response = await Http.post(`${apiOptions.endpoints.gameService}/games/start/${id}`, {
        gameState
    });

    if (response.payload.status === 200) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload.status,
            ok: response.ok,
            statusText: response.payload.statusText,
            json: response.payload.json,
        };
    }
    throw new Error(`Failed to Start Game: ${response.payload.message}`)
}

export async function updateGame(id: string, gameState: GameState): Promise<IResponse> {
    const response = await Http.post(`${apiOptions.endpoints.gameService}/games/updateGame/${id}`, {
        gameState
    });

    if (response.payload.status === 200) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload.status,
            ok: response.ok,
            statusText: response.payload.statusText,
            json: response.payload.json,
        };
    }
    throw new Error(`Failed to Start Game: ${response.payload.message}`)
}

export async function getGameSession(id: string): Promise<IResponse> {
    const response = await Http.get(`${apiOptions.endpoints.gameService}/games/session/${id}`);

    if (response.payload.status === 200) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload.status,
            ok: response.ok,
            statusText: response.payload.statusText,
            json: response.payload.json,
        }
    }

    throw new Error(`Failed to Get Game Session: ${response.payload.message}`)
}


export async function getGameSessionByGamePin(id: string): Promise<IResponse> {
    const response = await Http.get(`${apiOptions.endpoints.gameService}/games/gamepin/${id}`);

    if (response.payload.status === 200) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload.status,
            ok: response.ok,
            statusText: response.payload.statusText,
            json: response.payload.json,
        }
    }

    throw new Error(`Failed to Get Game Session: ${response.payload.message}`)
}