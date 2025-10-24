import { io, Socket } from 'socket.io-client';
import { SocketEvents } from '@/enums/socket-events';

class SocketClient {
    private socket: Socket | null = null;
    private url: string;

    constructor() {
        this.url = process.env.NEXT_PUBLIC_GAMESERVICE_BASE_URL??"";
    }

    connect(): Socket {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(this.url, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        this.setupConnectionHandlers();
        return this.socket;
    }

    private setupConnectionHandlers() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('✅ Connected to server:', this.socket?.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error.message);
        });
    }

    // Game Events
    joinGame(gameSessionId: string, playerName: string) {
        this.socket?.emit(SocketEvents.JOIN_GAME, { gameSessionId, playerName });
    }

    leaveGame(gameSessionId: string, playerName: string) {
        this.socket?.emit(SocketEvents.LEAVE_GAME, { gameSessionId, playerName });
    }

    startGame(gameSessionId: string) {
        this.socket?.emit(SocketEvents.START_GAME, { gameSessionId });
    }

    nextQuestion(gameSessionId: string, questionIndex: number) {
        this.socket?.emit(SocketEvents.NEXT_QUESTION, { gameSessionId, questionIndex });
    }

    submitAnswer(data: {
        gameSessionId: string;
        playerName: string;
        questionId: string;
        answerId: string;
        timeToAnswer: number;
    }) {
        this.socket?.emit(SocketEvents.SUBMIT_ANSWER, data);
    }

    showResults(gameSessionId: string, questionId: string) {
        this.socket?.emit(SocketEvents.SHOW_RESULTS, { gameSessionId, questionId });
    }

    endGame(gameSessionId: string) {
        this.socket?.emit(SocketEvents.END_GAME, { gameSessionId });
    }

    // Event Listeners
    onPlayerJoined(callback: (data: any) => void) {
        this.socket?.on(SocketEvents.PLAYER_JOINED, callback);
    }

    onJoinedGame(callback: (data: any) => void) {
        this.socket?.on(SocketEvents.JOINED_GAME, callback);
    }

    onPlayerLeft(callback: (data: any) => void) {
        this.socket?.on(SocketEvents.PLAYER_LEFT, callback);
    }

    onPlayerDisconnected(callback: (data: any) => void) {
        this.socket?.on(SocketEvents.PLAYER_DISCONNECTED, callback);
    }

    onGameStarted(callback: (data: any) => void) {
        this.socket?.on(SocketEvents.GAME_STARTED, callback);
    }

    onNextQuestion(callback: (data: any) => void) {
        this.socket?.on(SocketEvents.NEXT_QUESTION, callback);
    }

    onAnswerSubmitted(callback: (data: any) => void) {
        this.socket?.on(SocketEvents.ANSWER_SUBMITTED, callback);
    }

    onPlayerAnswered(callback: (data: any) => void) {
        this.socket?.on(SocketEvents.PLAYER_ANSWERED, callback);
    }

    onQuestionResults(callback: (data: any) => void) {
        this.socket?.on(SocketEvents.QUESTION_RESULTS, callback);
    }

    onGameEnded(callback: (data: any) => void) {
        this.socket?.on(SocketEvents.GAME_ENDED, callback);
    }

    onError(callback: (data: { message: string }) => void) {
        this.socket?.on(SocketEvents.ERROR, callback);
    }

    // Utility
    off(event: string) {
        this.socket?.off(event);
    }

    removeAllListeners() {
        this.socket?.removeAllListeners();
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    getSocket(): Socket | null {
        return this.socket;
    }
}

// Export singleton
const socketClient = new SocketClient();
export default socketClient;