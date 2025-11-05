# Socket.IO Client - Real-Time Communication

## Overview

The Socket.IO client provides real-time bidirectional communication between the frontend and backend. It uses a **singleton pattern** to ensure a single connection per client session.

**File:** [utils/socket.client.ts](../../utils/socket.client.ts)

## Architecture

### Singleton Pattern
```typescript
class SocketClient {
  private socket: Socket | null = null;
  private url: string;

  constructor() {
    this.url = process.env.NEXT_PUBLIC_GAMESERVICE_BASE_URL ?? "";
  }
}

// Export singleton instance
const socketClient = new SocketClient();
export default socketClient;
```

### Import Usage
```typescript
import socketClient from '@/utils/socket.client';
```

---

## Connection Management

### connect()
Establishes WebSocket connection to the server.

**Signature:**
```typescript
connect(): Socket
```

**Usage:**
```typescript
useEffect(() => {
  const socket = socketClient.connect();

  socket.on('connect', () => {
    console.log('✅ Connected:', socket.id);
  });

  return () => {
    // Don't disconnect - other pages need the connection
  };
}, []);
```

**Connection Configuration:**
```typescript
{
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
}
```

**Features:**
- Automatic reconnection on disconnect
- Fallback from WebSocket to polling
- Connection reuse across components

---

### disconnect()
Closes the WebSocket connection.

**Signature:**
```typescript
disconnect(): void
```

**Usage:**
```typescript
// On app unmount or logout
socketClient.disconnect();
```

**Warning:** Only disconnect when user leaves the entire application, not between page navigations.

---

### isConnected()
Checks if socket is currently connected.

**Signature:**
```typescript
isConnected(): boolean
```

**Usage:**
```typescript
const [isConnected, setIsConnected] = useState(false);

useEffect(() => {
  setIsConnected(socketClient.isConnected());
}, []);
```

---

### getSocket()
Returns the raw Socket.IO socket instance.

**Signature:**
```typescript
getSocket(): Socket | null
```

**Usage:**
```typescript
const socket = socketClient.getSocket();
if (socket) {
  console.log('Socket ID:', socket.id);
}
```

---

## Event Emission (Client → Server)

### joinGame()
Player joins a game session.

**Signature:**
```typescript
joinGame(gameSessionId: string, playerName: string, walletAddress: string): void
```

**Socket Event:** `SocketEvents.JOIN_GAME`

**Usage:**
```typescript
const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');

socketClient.joinGame(
  sessionId,
  nickname,
  embeddedWallet?.address
);

// Listen for confirmation
socketClient.onJoinedGame((data) => {
  if (data.success) {
    console.log('Joined successfully');
  }
});
```

**Payload Sent:**
```typescript
{
  gameSessionId: string,
  playerName: string,
  walletAddress: string
}
```

---

### leaveGame()
Player leaves a game session.

**Signature:**
```typescript
leaveGame(gameSessionId: string, playerName: string): void
```

**Socket Event:** `SocketEvents.LEAVE_GAME`

**Usage:**
```typescript
socketClient.leaveGame(sessionId, playerName);
```

---

### startGame()
Host starts the game (moves from lobby to gameplay).

**Signature:**
```typescript
startGame(gameSessionId: string): void
```

**Socket Event:** `SocketEvents.START_GAME`

**Usage:**
```typescript
const handleStartGame = () => {
  socketClient.startGame(gameSessionId);

  // Server broadcasts GAME_STARTED to all players
  // Host navigates to /game
  // Players auto-navigate to /play
};
```

**Broadcasts To:** All players in the game session

---

### nextQuestion()
Host advances to the next question.

**Signature:**
```typescript
nextQuestion(gameSessionId: string, questionIndex: number): void
```

**Socket Event:** `SocketEvents.NEXT_QUESTION`

**Usage:**
```typescript
const [currentQuestion, setCurrentQuestion] = useState(0);

const handleNextQuestion = () => {
  const nextIndex = currentQuestion + 1;
  socketClient.nextQuestion(gameSessionId, nextIndex);
  setCurrentQuestion(nextIndex);
};
```

**Broadcasts To:** All players receive new question data

---

### submitAnswer()
Player submits an answer to the current question.

**Signature:**
```typescript
submitAnswer(data: {
  gameSessionId: string;
  playerName: string;
  questionId: string;
  answerId: string;
  timeToAnswer: number;
}): void
```

**Socket Event:** `SocketEvents.SUBMIT_ANSWER`

**Usage:**
```typescript
const handleAnswerSelect = (answerId: string) => {
  const timeToAnswer = Date.now() - questionStartTime;

  socketClient.submitAnswer({
    gameSessionId,
    playerName,
    questionId: currentQuestion.id,
    answerId,
    timeToAnswer
  });
};
```

**Server Processing:**
- Validates answer correctness
- Calculates points based on speed
- Updates player score and streak
- Broadcasts to host for real-time tracking

---

### showResults()
Host triggers display of question results.

**Signature:**
```typescript
showResults(gameSessionId: string, questionId: string): void
```

**Socket Event:** `SocketEvents.SHOW_RESULTS`

**Usage:**
```typescript
const handleShowResults = () => {
  socketClient.showResults(gameSessionId, currentQuestionId);
};
```

**Broadcasts To:** All players receive:
- Correct answer
- Player rankings
- Score updates
- Streak information

---

### endGame()
Host ends the game and triggers final results.

**Signature:**
```typescript
endGame(gameSessionId: string): void
```

**Socket Event:** `SocketEvents.END_GAME`

**Usage:**
```typescript
const handleEndGame = () => {
  socketClient.endGame(gameSessionId);

  // Server processes final scores
  // Triggers prize distribution if applicable
  // Broadcasts GAME_ENDED to all players
};
```

---

## Event Listeners (Server → Client)

### onGameStateChanged()
Listens for game state transitions.

**Signature:**
```typescript
onGameStateChanged(callback: (data: {
  state: GameState;
  gameSessionId: string;
}) => void): void
```

**Event:** `game-state-changed`

**Usage:**
```typescript
useEffect(() => {
  socketClient.onGameStateChanged((data) => {
    console.log('Game state:', data.state);

    switch (data.state) {
      case GameState.COUNTDOWN:
        // Show countdown
        break;
      case GameState.IN_PROGRESS:
        // Start question timer
        break;
      case GameState.RESULTS_READY:
        // Display results
        break;
    }
  });

  return () => {
    socketClient.off('game-state-changed');
  };
}, []);
```

**State Values:**
```typescript
enum GameState {
  CREATED = "created",
  WAITING = "waiting",
  IN_PROGRESS = "in_progress",
  COUNTDOWN = "countdown",
  TIMEOUT = "question_timeout",
  RESULTS_READY = "results_ready",
  PAYOUT = "payout",
  COMPLETED = "completed"
}
```

---

### onPlayerJoined()
Host receives notification when a player joins.

**Signature:**
```typescript
onPlayerJoined(callback: (data: any) => void): void
```

**Event:** `SocketEvents.PLAYER_JOINED`

**Usage:**
```typescript
useEffect(() => {
  socketClient.onPlayerJoined((data) => {
    console.log('New player:', data.playerName);
    setPlayers(prev => [...prev, data]);
    toast.success(`${data.playerName} joined!`);
  });

  return () => {
    socketClient.off(SocketEvents.PLAYER_JOINED);
  };
}, []);
```

**Data Received:**
```typescript
{
  playerName: string,
  walletAddress: string,
  gameSessionId: string,
  joinedAt: string
}
```

---

### onJoinedGame()
Player receives confirmation after joining.

**Signature:**
```typescript
onJoinedGame(callback: (data: any) => void): void
```

**Event:** `SocketEvents.JOINED_GAME`

**Usage:**
```typescript
socketClient.onJoinedGame((data) => {
  if (data.success) {
    setStepper(JoinGameStep.LOBBYROOM);
  } else {
    setError(data.message);
  }
});
```

---

### onPrizesDistributed()
Notification when prize distribution is complete.

**Signature:**
```typescript
onPrizesDistributed(callback: (data: {
  txHash: string;
  winners: string[];
}) => void): void
```

**Event:** `prizes-distributed`

**Usage:**
```typescript
socketClient.onPrizesDistributed((data) => {
  console.log('Transaction:', data.txHash);
  console.log('Winners:', data.winners);

  toast.success('Prizes distributed!');
  setTxHash(data.txHash);
});
```

---

### onPrizeDistributionFailed()
Handles prize distribution errors.

**Signature:**
```typescript
onPrizeDistributionFailed(callback: (data: {
  message: string;
}) => void): void
```

**Event:** `prize-distribution-failed`

**Usage:**
```typescript
socketClient.onPrizeDistributionFailed((data) => {
  console.error('Prize error:', data.message);
  toast.error('Prize distribution failed');
});
```

---

### onPlayerLeft()
Player voluntarily leaves the game.

**Signature:**
```typescript
onPlayerLeft(callback: (data: any) => void): void
```

**Event:** `SocketEvents.PLAYER_LEFT`

**Usage:**
```typescript
socketClient.onPlayerLeft((data) => {
  setPlayers(prev =>
    prev.filter(p => p.playerName !== data.playerName)
  );
});
```

---

### onPlayerDisconnected()
Player connection lost (network issue).

**Signature:**
```typescript
onPlayerDisconnected(callback: (data: any) => void): void
```

**Event:** `SocketEvents.PLAYER_DISCONNECTED`

**Usage:**
```typescript
socketClient.onPlayerDisconnected((data) => {
  console.warn(`${data.playerName} disconnected`);
  // Optionally remove from player list or mark as disconnected
});
```

---

### onGameStarted()
Game has begun (sent to all players).

**Signature:**
```typescript
onGameStarted(callback: (data: any) => void): void
```

**Event:** `SocketEvents.GAME_STARTED`

**Usage:**
```typescript
// In lobby room (player view)
socketClient.onGameStarted((data) => {
  router.push(`/play?sessionId=${data.gameSessionId}&playerName=${playerName}`);
});
```

---

### onQuestionStarted()
New question is active.

**Signature:**
```typescript
onQuestionStarted(callback: (data: any) => void): void
```

**Event:** `SocketEvents.QUESTION_STARTED`

**Usage:**
```typescript
socketClient.onQuestionStarted((data) => {
  setCurrentQuestion(data.question);
  setTimeRemaining(data.timeLimit);
  startTimer();
});
```

**Data Received:**
```typescript
{
  question: {
    id: string,
    questionNumber: number,
    question: string,
    answers: IAnswer[]
  },
  timeLimit: number,
  questionIndex: number
}
```

---

### onNextQuestion()
Transition to next question.

**Signature:**
```typescript
onNextQuestion(callback: (data: any) => void): void
```

**Event:** `SocketEvents.NEXT_QUESTION`

---

### onAnswerSubmitted()
Confirmation that answer was received.

**Signature:**
```typescript
onAnswerSubmitted(callback: (data: any) => void): void
```

**Event:** `SocketEvents.ANSWER_SUBMITTED`

**Usage:**
```typescript
socketClient.onAnswerSubmitted((data) => {
  setAnswerSubmitted(true);
  setSelectedAnswer(data.answerId);
});
```

---

### onPlayerAnswered()
Host receives notification when a player answers.

**Signature:**
```typescript
onPlayerAnswered(callback: (data: any) => void): void
```

**Event:** `SocketEvents.PLAYER_ANSWERED`

**Usage:**
```typescript
socketClient.onPlayerAnswered((data) => {
  setAnsweredPlayers(prev => [...prev, data.playerName]);
  console.log(`${data.playerName} answered`);
});
```

---

### onQuestionResults()
Results for the current question.

**Signature:**
```typescript
onQuestionResults(callback: (data: any) => void): void
```

**Event:** `SocketEvents.QUESTION_RESULTS`

**Usage:**
```typescript
socketClient.onQuestionResults((data) => {
  setIsCorrect(data.isCorrect);
  setCorrectAnswer(data.correctAnswer);
  setPlayerScore(data.newScore);
  setPlayerRank(data.rank);
  setStreak(data.streak);
});
```

**Data Received:**
```typescript
{
  correctAnswer: string,
  isCorrect: boolean,
  newScore: number,
  rank: number,
  streak: number,
  leaderboard: IPlayer[]
}
```

---

### onGameEnded()
Game has completed.

**Signature:**
```typescript
onGameEnded(callback: (data: any) => void): void
```

**Event:** `SocketEvents.GAME_ENDED`

**Usage:**
```typescript
socketClient.onGameEnded((data) => {
  // Navigate to scoreboard
  router.push(`/score?sessionId=${gameSessionId}&playerName=${playerName}`);
});
```

---

### onError()
Error occurred during gameplay.

**Signature:**
```typescript
onError(callback: (data: { message: string }) => void): void
```

**Event:** `SocketEvents.ERROR`

**Usage:**
```typescript
socketClient.onError((data) => {
  console.error('Socket error:', data.message);
  toast.error(data.message);
});
```

---

## Utility Methods

### off()
Removes a specific event listener.

**Signature:**
```typescript
off(event: string): void
```

**Usage:**
```typescript
useEffect(() => {
  socketClient.onPlayerJoined(handlePlayerJoin);

  return () => {
    socketClient.off(SocketEvents.PLAYER_JOINED);
  };
}, []);
```

---

### removeAllListeners()
Removes all event listeners.

**Signature:**
```typescript
removeAllListeners(): void
```

**Usage:**
```typescript
useEffect(() => {
  return () => {
    socketClient.removeAllListeners();
  };
}, []);
```

**Warning:** Use with caution - this affects all components.

---

## Common Patterns

### Pattern 1: Component-Level Socket Integration
```typescript
const GameComponent = () => {
  useEffect(() => {
    const socket = socketClient.connect();

    socket.on('connect', () => {
      console.log('Connected');
    });

    socketClient.onGameStarted((data) => {
      // Handle game start
    });

    return () => {
      // Clean up specific listeners
      socketClient.off(SocketEvents.GAME_STARTED);
      // Don't disconnect - other pages need it
    };
  }, []);

  return <div>Game Component</div>;
};
```

---

### Pattern 2: Multiple Event Listeners
```typescript
useEffect(() => {
  // Set up multiple listeners
  socketClient.onPlayerJoined(handlePlayerJoin);
  socketClient.onPlayerLeft(handlePlayerLeft);
  socketClient.onGameStarted(handleGameStart);

  return () => {
    // Clean up all listeners
    socketClient.off(SocketEvents.PLAYER_JOINED);
    socketClient.off(SocketEvents.PLAYER_LEFT);
    socketClient.off(SocketEvents.GAME_STARTED);
  };
}, []);
```

---

### Pattern 3: Conditional Listening
```typescript
useEffect(() => {
  if (stepper === JoinGameStep.LOBBYROOM) {
    socketClient.onGameStarted((data) => {
      router.push(`/play?sessionId=${data.gameSessionId}`);
    });
  }

  return () => {
    socketClient.off(SocketEvents.GAME_STARTED);
  };
}, [stepper]);
```

---

## Socket Events Reference

### Complete Event List

**Emitted Events (Client → Server):**
- `SocketEvents.JOIN_GAME`
- `SocketEvents.LEAVE_GAME`
- `SocketEvents.START_GAME`
- `SocketEvents.NEXT_QUESTION`
- `SocketEvents.SUBMIT_ANSWER`
- `SocketEvents.SHOW_RESULTS`
- `SocketEvents.END_GAME`

**Listened Events (Server → Client):**
- `game-state-changed`
- `SocketEvents.PLAYER_JOINED`
- `SocketEvents.JOINED_GAME`
- `prizes-distributed`
- `prize-distribution-failed`
- `SocketEvents.PLAYER_LEFT`
- `SocketEvents.PLAYER_DISCONNECTED`
- `SocketEvents.GAME_STARTED`
- `SocketEvents.QUESTION_STARTED`
- `SocketEvents.NEXT_QUESTION`
- `SocketEvents.ANSWER_SUBMITTED`
- `SocketEvents.PLAYER_ANSWERED`
- `SocketEvents.QUESTION_RESULTS`
- `SocketEvents.GAME_ENDED`
- `SocketEvents.ERROR`

---

## Best Practices

### 1. Always Clean Up Listeners
```typescript
useEffect(() => {
  socketClient.onEventName(handler);

  return () => {
    socketClient.off(SocketEvents.EVENT_NAME);
  };
}, []);
```

### 2. Connection Status UI
```typescript
const [isConnected, setIsConnected] = useState(false);

useEffect(() => {
  const socket = socketClient.connect();

  socket.on('connect', () => setIsConnected(true));
  socket.on('disconnect', () => setIsConnected(false));
}, []);

// Display status
<div className={isConnected ? 'text-green-500' : 'text-red-500'}>
  {isConnected ? '🟢 Connected' : '🔴 Reconnecting...'}
</div>
```

### 3. Error Handling
```typescript
socketClient.onError((data) => {
  console.error('Socket error:', data.message);
  toast.error(data.message);
  // Optionally navigate or reset state
});
```

### 4. Single Connection
Never call `disconnect()` between pages - the singleton ensures one connection for the entire session.

---

## Related Documentation

- [Socket Events Enum](../types/02-enums.md#socketevents) - Event constants
- [Game State Enum](../types/02-enums.md#gamestate) - State values
- [API Services](./01-api-services.md) - REST API calls

---

**Last Updated:** 2025-11-05
