import { GameState } from "@/enums/game_state";
import { IQuiz } from "@/interfaces/IQuiz";
import { IResponse } from "@/interfaces/IResponse";
import { IGameConfig } from "@/interfaces/IGame";
import { apiOptions } from "@/shared/api.config";
import Http from "@/shared/http.config";
import posthog from "posthog-js";


export async function addQuiz(gameData: IQuiz): Promise<IResponse> {
    const response = await Http.post(
        `${apiOptions.endpoints.gameService}/quizzes/createQuiz`, gameData
    );

    if (response.status >= 200 && response.status < 300 && response.payload) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload?.status,
            ok: response.ok,
            statusText: response.payload?.statusText,
            json: response.payload.json,
        }
    }
    throw new Error(response.message || `Request failed with status ${response.status}`);
}

export async function addAgentQuiz(prompt: string): Promise<IResponse> {
    const response = await Http.post(
        `${apiOptions.endpoints.gameService}/quizzes/createAgentQuiz`, {
        "prompt": prompt
    }
    );

    console.log("AgentQuiz Response:", response)
    posthog.capture('agentquiz response', response)

    if (response.status >= 200 && response.status < 300 && response.payload) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload?.status,
            ok: response.ok,
            statusText: response.payload?.statusText,
            json: response.payload.json,
        }
    }
    throw new Error(response.message || `Request failed with status ${response.status}`);
}


export async function getQuizById(id: string): Promise<IResponse> {
    const response = await Http.get(`${apiOptions.endpoints.gameService}/quizzes/quiz/${id}`)

    if (response.status >= 200 && response.status < 300 && response.payload) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload?.status,
            ok: response.ok,
            statusText: response.payload?.statusText,
            json: response.payload.json,
        }
    }
    throw new Error(response.message || `Request failed with status ${response.status}`);
}

export async function createGameSession(config: string | IGameConfig): Promise<IResponse> {
    // Support both old string format and new config object for backwards compatibility
    const requestData = typeof config === 'string'
        ? { quizId: config }
        : config;

    const response = await Http.post(
        `${apiOptions.endpoints.gameService}/games/create-session`,
        requestData
    );

    if (response.status >= 200 && response.status < 300 && response.payload) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload?.status,
            ok: response.ok,
            statusText: response.payload?.statusText,
            json: response.payload.json,
        };
    }
    throw new Error(response.message || `Request failed with status ${response.status}`);
}

export async function joinGame(gamePin: string, playerName: string, walletAddress?: string): Promise<IResponse> {
    const response = await Http.post(
        `${apiOptions.endpoints.gameService}/games/join`,
        { gamePin, playerName, walletAddress }
    );

    if (response.status >= 200 && response.status < 300 && response.payload) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload?.status,
            ok: response.ok,
            statusText: response.payload?.statusText,
            json: response.payload.json,
        };
    }
    throw new Error(response.message || `Request failed with status ${response.status}`);
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

    if (response.status >= 200 && response.status < 300 && response.payload) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload?.status,
            ok: response.ok,
            statusText: response.payload?.statusText,
            json: response.payload.json,
        };
    }
    throw new Error(response.message || `Request failed with status ${response.status}`);
}

export async function getLeaderboard(gameSessionId: string): Promise<IResponse> {
    const response = await Http.get(
        `${apiOptions.endpoints.gameService}/games/leaderboard/${gameSessionId}`
    );

    if (response.status >= 200 && response.status < 300 && response.payload) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload?.status,
            ok: response.ok,
            statusText: response.payload?.statusText,
            json: response.payload.json,
        };
    }
    throw new Error(response.message || `Request failed with status ${response.status}`);
}

export async function getPlayerStats(gameSessionId: string, playerName: string): Promise<IResponse> {
    const response = await Http.get(
        `${apiOptions.endpoints.gameService}/games/player-stats/${gameSessionId}/${playerName}`
    );

    if (response.status >= 200 && response.status < 300 && response.payload) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload?.status,
            ok: response.ok,
            statusText: response.payload?.statusText,
            json: response.payload.json,
        };
    }
    throw new Error(response.message || `Request failed with status ${response.status}`);
}

export async function addPlayer(playerData: {
    playerName: string;
    gameSessionId: string;
}): Promise<IResponse> {
    const response = await Http.post(
        `${apiOptions.endpoints.gameService}/players/createPlayer`,
        playerData
    );

    if (response.status >= 200 && response.status < 300 && response.payload) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload?.status,
            ok: response.ok,
            statusText: response.payload?.statusText,
            json: response.payload.json,
        };
    }
    throw new Error(response.message || `Request failed with status ${response.status}`);
}

export async function startGame(id: string, gameState: GameState): Promise<IResponse> {
    const response = await Http.post(`${apiOptions.endpoints.gameService}/games/start/${id}`, {
        gameState
    });

    if (response.status >= 200 && response.status < 300 && response.payload) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload?.status,
            ok: response.ok,
            statusText: response.payload?.statusText,
            json: response.payload.json,
        };
    }
    throw new Error(response.message || `Request failed with status ${response.status}`)
}

export async function updateGame(id: string, gameState: GameState): Promise<IResponse> {
    const response = await Http.post(`${apiOptions.endpoints.gameService}/games/updateGame/${id}`, {
        gameState
    });

    if (response.status >= 200 && response.status < 300 && response.payload) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload?.status,
            ok: response.ok,
            statusText: response.payload?.statusText,
            json: response.payload.json,
        };
    }
    throw new Error(response.message || `Request failed with status ${response.status}`)
}

export async function getGameSession(id: string): Promise<IResponse> {
    const response = await Http.get(`${apiOptions.endpoints.gameService}/games/session/${id}`);

    if (response.status >= 200 && response.status < 300 && response.payload) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload?.status,
            ok: response.ok,
            statusText: response.payload?.statusText,
            json: response.payload.json,
        }
    }

    throw new Error(response.message || `Request failed with status ${response.status}`)
}


export async function getActiveGames(): Promise<IResponse> {
    const response = await Http.get(`${apiOptions.endpoints.gameService}/games/active`);

    if (response.status >= 200 && response.status < 300 && response.payload) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload?.status,
            ok: response.ok,
            statusText: response.payload?.statusText,
            json: response.payload.json,
        }
    }

    throw new Error(response.message || `Request failed with status ${response.status}`)
}

export async function getActivePlayers(gameSessionId: string): Promise<IResponse> {
    const response = await Http.get(
        `${apiOptions.endpoints.gameService}/games/active-players/${gameSessionId}`
    );

    if (response.status >= 200 && response.status < 300 && response.payload) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload?.status,
            ok: response.ok,
            statusText: response.payload?.statusText,
            json: response.payload.json,
        }
    }

    throw new Error(response.message || `Request failed with status ${response.status}`)
}

export async function getGameSessionByGamePin(id: string): Promise<IResponse> {
    const response = await Http.get(`${apiOptions.endpoints.gameService}/games/gamepin/${id}`);

    if (response.status >= 200 && response.status < 300 && response.payload) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload?.status,
            ok: response.ok,
            statusText: response.payload?.statusText,
            json: response.payload.json,
        }
    }

    throw new Error(response.message || `Request failed with status ${response.status}`)
}