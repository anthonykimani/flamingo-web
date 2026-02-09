# API Services

## Overview

The services layer provides a clean abstraction for all backend API communication. All services are located in `/services` and use the centralized HTTP configuration.

## Service Architecture

```
services/
├── quiz_service.ts         # Quiz and game session operations
└── player_service.ts       # Player operations (placeholder)
```

## HTTP Configuration

**File:** [shared/http.config.ts](../../shared/http.config.ts)

### HTTP Client Setup

Uses Axios with interceptors for authentication and error handling.

```typescript
import axios from 'axios'

const httpClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`, // Added by interceptor
  },
})
```

### Available Methods

- `Http.get(url)` - GET requests
- `Http.post(url, data)` - POST requests
- `Http.put(url, data)` - PUT requests
- `Http.delete(url)` - DELETE requests

### Response Format

All services return standardized `IResponse`:

```typescript
interface IResponse {
  message: string
  payload: any
  status: number
  ok: boolean
  statusText: string
  json: any
}
```

---

## Quiz Service

**File:** [services/quiz_service.ts](../../services/quiz_service.ts)

### Import Requirements

```typescript
import { GameState } from '@/enums/game_state'
import { IQuiz } from '@/interfaces/IQuiz'
import { IResponse } from '@/interfaces/IResponse'
import { apiOptions } from '@/shared/api.config'
import Http from '@/shared/http.config'
```

---

### Quiz Management

#### addQuiz()

Creates a new quiz with questions and answers.

**Signature:**

```typescript
async function addQuiz(gameData: IQuiz): Promise<IResponse>
```

**Parameters:**

```typescript
{
  title: string;
  questions: IQuestion[];
  isPublished?: boolean;
}
```

**Endpoint:**

```
POST /quizzes/createQuiz
```

**Usage Example:**

```typescript
const quizData: IQuiz = {
  title: 'Geography Quiz',
  questions: [
    {
      questionNumber: 1,
      question: 'What is the capital of France?',
      answers: [
        { answer: 'Paris', correctAnswer: true },
        { answer: 'London', correctAnswer: false },
        { answer: 'Berlin', correctAnswer: false },
        { answer: 'Madrid', correctAnswer: false },
      ],
    },
  ],
}

const response = await addQuiz(quizData)
console.log(response.payload) // Created quiz with ID
```

**Response Payload:**

```typescript
{
  id: string;
  title: string;
  questions: IQuestion[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

#### addAgentQuiz()

Creates a quiz using AI generation based on a prompt.

**Signature:**

```typescript
async function addAgentQuiz(prompt: string): Promise<IResponse>
```

**Parameters:**

- `prompt`: Text description of desired quiz content

**Endpoint:**

```
POST /quizzes/createAgentQuiz
```

**Usage Example:**

```typescript
const prompt = 'Create a 10-question quiz about World War 2 history'
const response = await addAgentQuiz(prompt)
console.log(response.payload) // AI-generated quiz
```

**AI Prompt Guidelines:**

- Be specific about topic and difficulty
- Specify number of questions if desired
- Include any special requirements

---

#### getQuizById()

Retrieves a quiz by its unique ID.

**Signature:**

```typescript
async function getQuizById(id: string): Promise<IResponse>
```

**Endpoint:**

```
GET /quizzes/quiz/:id
```

**Usage Example:**

```typescript
const quizId = 'abc123'
const response = await getQuizById(quizId)
const quiz = response.payload
```

---

### Game Session Management

#### createGameSession()

Creates a new game session from an existing quiz.

**Signature:**

```typescript
async function createGameSession(quizId: string): Promise<IResponse>
```

**Endpoint:**

```
POST /games/create-session
```

**Usage Example:**

```typescript
const response = await createGameSession(quizId)
const session = response.payload

// Session includes:
// - id: unique session ID
// - gamePin: 6-digit PIN for players
// - quizId: reference to quiz
// - status: GameState enum
// - players: array of joined players
```

**Response Payload:**

```typescript
{
  id: string;
  gamePin: string;
  quizId: string;
  status: GameState;
  players: IPlayer[];
  currentQuestionIndex: number;
  createdAt: string;
}
```

---

#### joinGame()

Validates game PIN and checks if game is joinable.

**Signature:**

```typescript
async function joinGame(gamePin: string): Promise<IResponse>
```

**Endpoint:**

```
POST /games/join
```

**Usage Example:**

```typescript
const response = await joinGame('123456')
if (response.payload.status === GameState.WAITING) {
  // Game is joinable
}
```

**Validation:**

- Game PIN must exist
- Game must be in WAITING or CREATED state
- Returns game session details if valid

---

#### getGameSession()

Fetches game session by session ID.

**Signature:**

```typescript
async function getGameSession(id: string): Promise<IResponse>
```

**Endpoint:**

```
GET /games/session/:id
```

**Usage Example:**

```typescript
const sessionId = 'session_abc123'
const response = await getGameSession(sessionId)
const session = response.payload
```

---

#### getGameSessionByGamePin()

Fetches game session by game PIN.

**Signature:**

```typescript
async function getGameSessionByGamePin(id: string): Promise<IResponse>
```

**Endpoint:**

```
GET /games/gamepin/:id
```

**Usage Example:**

```typescript
const gamePin = '123456'
const response = await getGameSessionByGamePin(gamePin)
const session = response.payload
```

**Common Use Case:**
Used in `/join` page to validate PIN and get session details.

---

### Game State Management

#### startGame()

Starts a game session and updates state.

**Signature:**

```typescript
async function startGame(id: string, gameState: GameState): Promise<IResponse>
```

**Parameters:**

- `id`: Game session ID
- `gameState`: New game state (typically `GameState.IN_PROGRESS`)

**Endpoint:**

```
POST /games/start/:id
```

**Usage Example:**

```typescript
await startGame(sessionId, GameState.IN_PROGRESS)
// Broadcasts game-started event via WebSocket
```

---

#### updateGame()

Updates game state during gameplay.

**Signature:**

```typescript
async function updateGame(id: string, gameState: GameState): Promise<IResponse>
```

**Endpoint:**

```
POST /games/updateGame/:id
```

**Usage Example:**

```typescript
// Move to next question
await updateGame(sessionId, GameState.COUNTDOWN)

// Show results
await updateGame(sessionId, GameState.RESULTS_READY)

// Complete game
await updateGame(sessionId, GameState.COMPLETED)
```

---

### Answer Submission

#### submitAnswer()

Submits a player's answer to a question.

**Signature:**

```typescript
async function submitAnswer(answerData: {
  gameSessionId: string
  playerName: string
  questionId: string
  answerId: string
  isCorrect: boolean
  pointsEarned: number
  answerStreak: number
  timeToAnswer: number
}): Promise<IResponse>
```

**Endpoint:**

```
POST /games/submit-answer
```

**Usage Example:**

```typescript
const answerData = {
  gameSessionId: 'session_123',
  playerName: 'Alice',
  questionId: 'q1',
  answerId: 'a2',
  isCorrect: true,
  pointsEarned: 1000,
  answerStreak: 3,
  timeToAnswer: 2500, // milliseconds
}

await submitAnswer(answerData)
```

**Points Calculation:**
Points are typically calculated based on:

- Correctness (base points)
- Speed (faster = more points)
- Streak multiplier

---

### Leaderboards & Statistics

#### getLeaderboard()

Fetches current leaderboard for a game session.

**Signature:**

```typescript
async function getLeaderboard(gameSessionId: string): Promise<IResponse>
```

**Endpoint:**

```
GET /games/leaderboard/:gameSessionId
```

**Usage Example:**

```typescript
const response = await getLeaderboard(sessionId)
const leaderboard = response.payload

// Sorted array of players by score
leaderboard.forEach((player, index) => {
  console.log(`${index + 1}. ${player.playerName}: ${player.totalScore}`)
})
```

**Response Payload:**

```typescript
Array<{
  playerName: string
  totalScore: number
  correctAnswers: number
  wrongAnswers: number
  currentStreak: number
  bestStreak: number
  walletAddress: string
}>
```

---

#### getPlayerStats()

Retrieves detailed statistics for a specific player.

**Signature:**

```typescript
async function getPlayerStats(gameSessionId: string, playerName: string): Promise<IResponse>
```

**Endpoint:**

```
GET /games/player-stats/:gameSessionId/:playerName
```

**Usage Example:**

```typescript
const response = await getPlayerStats(sessionId, 'Alice')
const stats = response.payload

console.log(`Total Score: ${stats.totalScore}`)
console.log(
  `Accuracy: ${(stats.correctAnswers / (stats.correctAnswers + stats.wrongAnswers)) * 100}%`
)
console.log(`Best Streak: ${stats.bestStreak}`)
```

---

### Player Management

#### addPlayer()

Adds a player to a game session.

**Signature:**

```typescript
async function addPlayer(playerData: {
  playerName: string
  gameSessionId: string
}): Promise<IResponse>
```

**Endpoint:**

```
POST /players/createPlayer
```

**Usage Example:**

```typescript
const playerData = {
  playerName: 'Bob',
  gameSessionId: 'session_123',
}

const response = await addPlayer(playerData)
console.log(response.payload) // Player object with ID
```

**Note:** In current implementation, player joining is primarily handled via Socket.IO for real-time updates. This endpoint provides REST fallback.

---

## API Configuration

**File:** [shared/api.config.ts](../../shared/api.config.ts)

### Base URL Configuration

```typescript
export const apiOptions = {
  endpoints: {
    gameService: process.env.NEXT_PUBLIC_GAMESERVICE_BASE_URL,
  },
}
```

### Environment Variables

Required in `.env.development`:

```bash
NEXT_PUBLIC_GAMESERVICE_BASE_URL=http://localhost:3077
```

---

## Error Handling

### Standard Pattern

All service functions follow this error handling pattern:

```typescript
export async function serviceName(params): Promise<IResponse> {
  const response = await Http.method(endpoint, data)

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

  throw new Error(`Failed to perform action: ${response.payload.message}`)
}
```

### Usage with Try-Catch

```typescript
try {
  const response = await addQuiz(quizData)
  console.log('Success:', response.payload)
} catch (error) {
  console.error('Error:', error.message)
  // Handle error (show toast, set error state, etc.)
}
```

---

## Best Practices

### 1. Always Handle Errors

```typescript
const [error, setError] = useState('')

try {
  const response = await getQuizById(id)
  // Process response
} catch (err) {
  setError('Failed to load quiz')
}
```

### 2. Loading States

```typescript
const [loading, setLoading] = useState(false)

setLoading(true)
try {
  const response = await createGameSession(quizId)
} finally {
  setLoading(false)
}
```

### 3. Type Safety

Always import and use TypeScript interfaces:

```typescript
import { IQuiz, IQuestion, IAnswer } from '@/interfaces/IQuiz'
```

### 4. Environment Validation

Check environment variables are set:

```typescript
if (!process.env.NEXT_PUBLIC_GAMESERVICE_BASE_URL) {
  throw new Error('NEXT_PUBLIC_GAMESERVICE_BASE_URL not configured')
}
```

---

## Service Function Reference Table

| Function                    | Method | Endpoint                        | Purpose                |
| --------------------------- | ------ | ------------------------------- | ---------------------- |
| `addQuiz()`                 | POST   | `/quizzes/createQuiz`           | Create manual quiz     |
| `addAgentQuiz()`            | POST   | `/quizzes/createAgentQuiz`      | Create AI quiz         |
| `getQuizById()`             | GET    | `/quizzes/quiz/:id`             | Fetch quiz details     |
| `createGameSession()`       | POST   | `/games/create-session`         | Start new game session |
| `joinGame()`                | POST   | `/games/join`                   | Validate game PIN      |
| `getGameSession()`          | GET    | `/games/session/:id`            | Get session by ID      |
| `getGameSessionByGamePin()` | GET    | `/games/gamepin/:id`            | Get session by PIN     |
| `startGame()`               | POST   | `/games/start/:id`              | Begin game             |
| `updateGame()`              | POST   | `/games/updateGame/:id`         | Update game state      |
| `submitAnswer()`            | POST   | `/games/submit-answer`          | Submit player answer   |
| `getLeaderboard()`          | GET    | `/games/leaderboard/:id`        | Get rankings           |
| `getPlayerStats()`          | GET    | `/games/player-stats/:id/:name` | Get player stats       |
| `addPlayer()`               | POST   | `/players/createPlayer`         | Register player        |

---

## Related Documentation

- [Socket Client](./02-socket-client.md) - Real-time communication
- [Interfaces](../types/01-interfaces.md) - TypeScript types
- [Game State Enum](../types/02-enums.md#gamestate) - State values

---

**Last Updated:** 2025-11-05
