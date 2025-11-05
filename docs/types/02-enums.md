# TypeScript Enumerations

## Overview

Enumerations define constant values used throughout the application. All enums are located in `/enums`.

## GameState Enum

**File:** [enums/game_state.ts](../../enums/game_state.ts)

### Definition
```typescript
export enum GameState {
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

### States Explained

#### CREATED
**Purpose:** Initial state when game session is created

**When:** Immediately after `createGameSession()` is called

**Valid Actions:**
- Host can start inviting players
- Navigate to lobby page

**Next States:** `WAITING`

**Example:**
```typescript
const session = await createGameSession(quizId);
// session.status === GameState.CREATED
```

---

#### WAITING
**Purpose:** Lobby state where players can join

**When:** Host is in lobby waiting for players

**Valid Actions:**
- Players can join via game PIN
- Display player list
- Host can start game

**Next States:** `IN_PROGRESS`

**Socket Events:**
- Listen: `player-joined`, `player-left`
- Emit: `start-game`

**Example:**
```typescript
if (gameSession.status === GameState.WAITING) {
  // Show "Start Game" button to host
  // Allow players to join
}
```

---

#### IN_PROGRESS
**Purpose:** Active gameplay state

**When:** Game has started, questions are being answered

**Valid Actions:**
- Display current question
- Accept player answers
- Show timers
- Track scores

**Next States:** `COUNTDOWN`, `TIMEOUT`, `RESULTS_READY`, `COMPLETED`

**Example:**
```typescript
await updateGame(sessionId, GameState.IN_PROGRESS);
// Players can now see and answer questions
```

---

#### COUNTDOWN
**Purpose:** Pre-question countdown timer

**When:** Before each question starts (3, 2, 1...)

**Valid Actions:**
- Display countdown animation
- Prepare players for next question
- No answer submission allowed

**Duration:** Typically 3-5 seconds

**Next States:** `IN_PROGRESS`

**Example:**
```typescript
await updateGame(sessionId, GameState.COUNTDOWN);
// Show 3... 2... 1... animation
setTimeout(() => {
  showQuestion();
}, 3000);
```

---

#### TIMEOUT
**Purpose:** Question time has expired

**When:** Question timer reaches zero

**Valid Actions:**
- Stop accepting answers
- Prepare to show results
- Mark non-answering players

**Next States:** `RESULTS_READY`

**Example:**
```typescript
useEffect(() => {
  if (timeRemaining === 0) {
    await updateGame(sessionId, GameState.TIMEOUT);
  }
}, [timeRemaining]);
```

---

#### RESULTS_READY
**Purpose:** Display question results and correct answer

**When:** After question time expires or all players answer

**Valid Actions:**
- Show correct answer
- Display player rankings
- Update scores
- Show streaks

**Duration:** Typically 5-10 seconds

**Next States:** `COUNTDOWN` (next question) or `COMPLETED` (final question)

**Socket Events:**
- Emit: `show-results`
- Listen: `question-results`

**Example:**
```typescript
await updateGame(sessionId, GameState.RESULTS_READY);
socketClient.showResults(sessionId, questionId);
```

---

#### PAYOUT
**Purpose:** Prize distribution in progress

**When:** After game completion, distributing prizes via escrow

**Valid Actions:**
- Process blockchain transactions
- Calculate winner shares
- Display payout progress

**Next States:** `COMPLETED`

**Socket Events:**
- Listen: `prizes-distributed`
- Listen: `prize-distribution-failed`

**Example:**
```typescript
await updateGame(sessionId, GameState.PAYOUT);
// Backend processes escrow payouts
// Wait for prizes-distributed event
```

---

#### COMPLETED
**Purpose:** Game has ended

**When:** Final question results shown and prizes distributed

**Valid Actions:**
- Display final leaderboard
- Show game statistics
- Allow restart/return home

**Next States:** None (terminal state)

**Example:**
```typescript
socketClient.onGameEnded((data) => {
  // Navigate to /score page
  router.push(`/score?sessionId=${sessionId}`);
});
```

---

### State Transition Diagram

```
CREATED → WAITING → IN_PROGRESS → COUNTDOWN → IN_PROGRESS
                         ↓               ↓
                    TIMEOUT ← ──────────┘
                         ↓
                  RESULTS_READY
                         ↓
                    (Next Question?)
                         ├─ Yes → COUNTDOWN
                         └─ No → PAYOUT → COMPLETED
```

---

### Usage Patterns

#### Checking Game State
```typescript
import { GameState } from '@/enums/game_state';

if (gameSession.status === GameState.WAITING) {
  // Show lobby UI
} else if (gameSession.status === GameState.IN_PROGRESS) {
  // Show question UI
} else if (gameSession.status === GameState.COMPLETED) {
  // Show final scores
}
```

#### State-Based Rendering
```typescript
const renderGameUI = () => {
  switch (gameSession.status) {
    case GameState.WAITING:
      return <LobbyScreen />;
    case GameState.COUNTDOWN:
      return <CountdownTimer />;
    case GameState.IN_PROGRESS:
      return <QuestionDisplay />;
    case GameState.RESULTS_READY:
      return <ResultsScreen />;
    case GameState.COMPLETED:
      return <FinalScoreboard />;
    default:
      return <LoadingScreen />;
  }
};
```

---

## SocketEvents Enum

**File:** [enums/socket-events.ts](../../enums/socket-events.ts)

### Definition
```typescript
export enum SocketEvents {
  // Connection
  CONNECTION = 'connection',
  DISCONNECT = 'disconnect',

  // Game Flow
  JOIN_GAME = 'join-game',
  LEAVE_GAME = 'leave-game',
  START_GAME = 'start-game',
  GAME_STARTED = 'game-started',

  // Player Events
  PLAYER_JOINED = 'player-joined',
  PLAYER_LEFT = 'player-left',
  PLAYER_DISCONNECTED = 'player-disconnected',
  JOINED_GAME = 'joined-game',

  // Question Flow
  QUESTION_STARTED = 'question-started',
  NEXT_QUESTION = 'next-question',
  SUBMIT_ANSWER = 'submit-answer',
  ANSWER_SUBMITTED = 'answer-submitted',
  PLAYER_ANSWERED = 'player-answered',

  // Results
  SHOW_RESULTS = 'show-results',
  QUESTION_RESULTS = 'question-results',
  END_GAME = 'end-game',
  GAME_ENDED = 'game-ended',

  // Utility
  ERROR = 'error',
  PING = 'ping',
  PONG = 'pong'
}
```

### Event Categories

#### Connection Events
- **CONNECTION**: Socket connected to server
- **DISCONNECT**: Socket disconnected from server

**Usage:**
```typescript
socket.on(SocketEvents.CONNECTION, () => {
  console.log('Connected');
});

socket.on(SocketEvents.DISCONNECT, (reason) => {
  console.log('Disconnected:', reason);
});
```

---

#### Game Flow Events

##### JOIN_GAME (Emit)
Player requests to join a game session.
```typescript
socketClient.emit(SocketEvents.JOIN_GAME, {
  gameSessionId,
  playerName,
  walletAddress
});
```

##### LEAVE_GAME (Emit)
Player voluntarily leaves the game.
```typescript
socketClient.emit(SocketEvents.LEAVE_GAME, {
  gameSessionId,
  playerName
});
```

##### START_GAME (Emit)
Host starts the game from lobby.
```typescript
socketClient.emit(SocketEvents.START_GAME, {
  gameSessionId
});
```

##### GAME_STARTED (Listen)
Broadcast to all players when game begins.
```typescript
socketClient.on(SocketEvents.GAME_STARTED, (data) => {
  router.push('/play');
});
```

---

#### Player Events

##### PLAYER_JOINED (Listen)
Host receives notification of new player.
```typescript
socketClient.on(SocketEvents.PLAYER_JOINED, (data) => {
  setPlayers(prev => [...prev, data]);
});
```

##### PLAYER_LEFT (Listen)
Player intentionally left the game.
```typescript
socketClient.on(SocketEvents.PLAYER_LEFT, (data) => {
  setPlayers(prev => prev.filter(p => p.playerName !== data.playerName));
});
```

##### PLAYER_DISCONNECTED (Listen)
Player lost connection.
```typescript
socketClient.on(SocketEvents.PLAYER_DISCONNECTED, (data) => {
  console.warn(`${data.playerName} disconnected`);
});
```

##### JOINED_GAME (Listen)
Confirmation that player successfully joined.
```typescript
socketClient.on(SocketEvents.JOINED_GAME, (data) => {
  if (data.success) {
    setStepper(JoinGameStep.LOBBYROOM);
  }
});
```

---

#### Question Flow Events

##### QUESTION_STARTED (Listen)
New question is broadcast to all players.
```typescript
socketClient.on(SocketEvents.QUESTION_STARTED, (data) => {
  setCurrentQuestion(data.question);
  setTimeRemaining(data.timeLimit);
});
```

##### NEXT_QUESTION (Emit)
Host advances to next question.
```typescript
socketClient.emit(SocketEvents.NEXT_QUESTION, {
  gameSessionId,
  questionIndex
});
```

##### SUBMIT_ANSWER (Emit)
Player submits their answer.
```typescript
socketClient.emit(SocketEvents.SUBMIT_ANSWER, {
  gameSessionId,
  playerName,
  questionId,
  answerId,
  timeToAnswer
});
```

##### ANSWER_SUBMITTED (Listen)
Confirmation that answer was received.
```typescript
socketClient.on(SocketEvents.ANSWER_SUBMITTED, (data) => {
  setAnswerSubmitted(true);
});
```

##### PLAYER_ANSWERED (Listen)
Host receives notification that a player answered.
```typescript
socketClient.on(SocketEvents.PLAYER_ANSWERED, (data) => {
  setAnsweredPlayers(prev => [...prev, data.playerName]);
});
```

---

#### Results Events

##### SHOW_RESULTS (Emit)
Host triggers results display.
```typescript
socketClient.emit(SocketEvents.SHOW_RESULTS, {
  gameSessionId,
  questionId
});
```

##### QUESTION_RESULTS (Listen)
Players receive their results.
```typescript
socketClient.on(SocketEvents.QUESTION_RESULTS, (data) => {
  setIsCorrect(data.isCorrect);
  setNewScore(data.newScore);
  setRank(data.rank);
});
```

##### END_GAME (Emit)
Host ends the game.
```typescript
socketClient.emit(SocketEvents.END_GAME, {
  gameSessionId
});
```

##### GAME_ENDED (Listen)
Broadcast when game is complete.
```typescript
socketClient.on(SocketEvents.GAME_ENDED, (data) => {
  router.push(`/score?sessionId=${gameSessionId}`);
});
```

---

#### Utility Events

##### ERROR (Listen)
Server error notification.
```typescript
socketClient.on(SocketEvents.ERROR, (data) => {
  console.error('Socket error:', data.message);
  toast.error(data.message);
});
```

##### PING / PONG
Connection health check.
```typescript
socketClient.emit(SocketEvents.PING);
socketClient.on(SocketEvents.PONG, () => {
  console.log('Server responsive');
});
```

---

## JoinGameStep Enum

**File:** [enums/join_game_step.ts](../../enums/join_game_step.ts)

### Definition (Inferred)
```typescript
export enum JoinGameStep {
  ENTERGAMEPIN = "enter_game_pin",
  ENTERNICKNAME = "enter_nickname",
  LOBBYROOM = "lobby_room"
}
```

### Steps

#### ENTERGAMEPIN
Player enters 6-digit game PIN

**UI:**
- Input for game PIN
- Validation on submit
- Error display

**Next:** `ENTERNICKNAME`

---

#### ENTERNICKNAME
Player chooses their display name

**Validation:**
- 2-20 characters
- Unique within session
- Wallet connected

**Next:** `LOBBYROOM`

---

#### LOBBYROOM
Player waits for game to start

**UI:**
- Display player's nickname
- Connection status
- "Waiting for host..." message

**Auto-navigate:** To `/play` when game starts

---

## CreateGameStep Enum

**File:** [enums/create_game_step.ts](../../enums/create_game_step.ts)

### Definition (Inferred)
```typescript
export enum CreateGameStep {
  GAMETYPE = "game_type",
  GAMECANVAS = "game_canvas",
  GAMEFORM = "game_form"
}
```

### Steps

#### GAMETYPE
Choose game mode

**Options:**
- Hangouts
- Team Building
- Degen PvP

---

#### GAMECANVAS
Choose creation method

**Options:**
- Manual creation
- AI generation

---

#### GAMEFORM
Build the quiz

**UI:**
- Quiz title input
- Question builder
- Answer options
- Save and create session

---

## Usage Best Practices

### 1. Always Import Enums
```typescript
import { GameState } from '@/enums/game_state';
import { SocketEvents } from '@/enums/socket-events';
```

### 2. Use Enum Values, Not Strings
```typescript
// Good
if (status === GameState.WAITING) { }

// Bad
if (status === 'waiting') { }
```

### 3. Exhaustive Switch Statements
```typescript
const getStatusColor = (state: GameState): string => {
  switch (state) {
    case GameState.CREATED:
    case GameState.WAITING:
      return 'blue';
    case GameState.IN_PROGRESS:
    case GameState.COUNTDOWN:
      return 'yellow';
    case GameState.RESULTS_READY:
      return 'green';
    case GameState.COMPLETED:
      return 'gray';
    default:
      // TypeScript ensures all cases are handled
      const _exhaustive: never = state;
      return 'black';
  }
};
```

### 4. Type-Safe Event Handling
```typescript
const handleSocketEvent = (event: SocketEvents, data: any) => {
  switch (event) {
    case SocketEvents.PLAYER_JOINED:
      handlePlayerJoin(data);
      break;
    case SocketEvents.GAME_STARTED:
      handleGameStart(data);
      break;
    // ... other cases
  }
};
```

---

## Related Documentation

- [Interfaces](./01-interfaces.md) - TypeScript interfaces
- [Socket Client](../services/02-socket-client.md) - Socket usage
- [Game Flow](../architecture/04-game-flow.md) - State transitions

---

**Last Updated:** 2025-11-05
