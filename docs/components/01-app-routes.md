# App Routes & Pages

## Overview

Flamingo Web uses **Next.js 15 App Router** with a file-based routing system. All routes are located in the `/app` directory and follow the App Router conventions.

## Route Structure

```
app/
├── layout.tsx              # Root layout (wraps all pages)
├── page.tsx               # Home/Landing page (/)
├── create/
│   └── page.tsx          # Quiz creation flow (/create)
├── generate/
│   └── page.tsx          # AI quiz generation (/generate)
├── lobby/
│   └── page.tsx          # Host waiting room (/lobby)
├── game/
│   └── page.tsx          # Host game controller (/game)
├── join/
│   └── page.tsx          # Player join flow (/join)
├── play/
│   └── page.tsx          # Player game interface (/play)
└── score/
    └── page.tsx          # Final scoreboard (/score)
```

## Root Layout

**File:** [app/layout.tsx](../../app/layout.tsx)

### Purpose

Global layout that wraps all pages with common providers and styling.

### Features

- Custom font loading (OldschoolGrotesk, Oi)
- Privy authentication provider wrapper
- Global CSS styles
- Application metadata

### Code Structure

```typescript
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${oldschool.variable} antialiased font-poppins font-oldschool`}>
        <PrivyProviders>{children}</PrivyProviders>
      </body>
    </html>
  );
}
```

### Fonts Loaded

- **OldschoolGrotesk**: 5 weights (Light: 200, Regular: 300, Medium: 400, Book: 500, Bold: 600)
- **Oi**: Regular (400) - Used for title displays

### Metadata

- **Title**: "Flamingo"
- **Description**: "A real-time multiplayer quiz game similar to Kahoot"

---

## 1. Home Page (/)

**File:** [app/page.tsx](../../app/page.tsx)

### Purpose

Landing page and main entry point for the application.

### User Type

Both Host and Player

### Component Used

- `<StartScreen />` - Main landing interface

### Features

- Game mode selection (Host vs Player)
- Navigation to Create or Join flows
- Wallet connection prompt

### Route Parameters

None

### Navigation

- **To Host**: `/create` - Create a new quiz
- **To Player**: `/join` - Join existing game

---

## 2. Create Quiz Page (/create)

**File:** [app/create/page.tsx](../../app/create/page.tsx)

### Purpose

Multi-step quiz creation and game session setup for hosts.

### User Type

Host only

### State Management

```typescript
const [stepper, setStepper] = useState<CreateGameStep>(CreateGameStep.GAMETYPE)
const [gameSession, setGameSession] = useState<any>(null)
```

### Flow Steps

Uses `CreateGameStep` enum with 3 steps:

#### Step 1: GAMETYPE

- **Component**: `<ChooseGameType />`
- **Purpose**: Select game type (Hangouts, Team Building, Degen PvP)
- **Background**: `.game-type-background`

#### Step 2: GAMECANVAS

- **Component**: `<ChooseCanvasType />`
- **Purpose**: Choose quiz creation method (Manual or AI)
- **Background**: `.canvas-type-background`
- **Navigation**: Includes NavigationBar

#### Step 3: GAMEFORM

- **Component**: `<CreateQuiz />`
- **Purpose**: Build quiz with questions and answers
- **Background**: `.quiz-form-background`
- **On Save**: Creates game session and navigates to lobby

### Navigation Flow

```
/create → Choose Type → Choose Canvas → Create Quiz → /lobby?sessionId=...&gamePin=...&host=true
```

### Key Functions

```typescript
handleNextStep() // Advances to next step
handleQuizSave(session) // Saves quiz and navigates to lobby
```

---

## 3. AI Generate Page (/generate)

**File:** [app/generate/page.tsx](../../app/generate/page.tsx)

### Purpose

AI-powered quiz generation using prompts.

### User Type

Host only

### Features

- Prompt-based quiz generation
- AI agent creates questions and answers
- Similar result to manual creation

### Component Used

- `<GenerateQuiz />` - AI generation interface

### Navigation

Accessed from `/create` GAMECANVAS step when user selects AI option

---

## 4. Lobby Page (/lobby)

**File:** [app/lobby/page.tsx](../../app/lobby/page.tsx)

### Purpose

Host waiting room where players join before game starts.

### User Type

Host only

### URL Parameters

```typescript
?sessionId=<game-session-id>
&gamePin=<6-digit-pin>
&host=true
```

### Features

- Display game PIN prominently
- Real-time player list updates
- Player join notifications via WebSocket
- Start game button
- Player count display

### Socket Events

- **Listen**: `player-joined` - New player added
- **Listen**: `player-left` - Player disconnected
- **Emit**: `start-game` - Begin game session

### Component Used

- `<GamePin />` - Lobby and player management

### Navigation

- **Next**: `/game?sessionId=...` - When host starts game

---

## 5. Game Controller Page (/game)

**File:** [app/game/page.tsx](../../app/game/page.tsx)

### Purpose

Host's game control interface for managing questions and viewing results.

### User Type

Host only

### URL Parameters

```typescript
?sessionId=<game-session-id>
&gamePin=<6-digit-pin>
```

### Features

- Display current question to all players
- Control question timing
- View player answer submissions in real-time
- Display results after each question
- Advance to next question
- End game when complete

### Socket Events

- **Emit**: `next-question` - Start next question
- **Emit**: `show-results` - Display question results
- **Emit**: `end-game` - Finish game
- **Listen**: `player-answered` - Track answer submissions
- **Listen**: `question-results` - Get answer statistics

### Component Used

- `<GameController />` - Question management interface

### State Flow

```
COUNTDOWN → Display Question → Show Timer →
Collect Answers → Show Results → Next Question → ... → End Game
```

### Navigation

- **Next**: `/score?sessionId=...` - After final question

---

## 6. Join Game Page (/join)

**File:** [app/join/page.tsx](../../app/join/page.tsx)

### Purpose

Player flow for joining an active game session.

### User Type

Player only

### State Management

```typescript
const [stepper, setStepper] = useState<JoinGameStep>(JoinGameStep.ENTERGAMEPIN)
const { address, getUserAddress } = useMiniPayInjector()
const [gamePin, setGamePin] = useState('')
const [nickname, setNickname] = useState('')
const [gameSession, setGameSession] = useState<any>(null)
```

### Flow Steps

Uses `JoinGameStep` enum with 3 steps:

#### Step 1: ENTERGAMEPIN

- **Input**: 6-digit game PIN
- **Validation**:
  - PIN must exist
  - Game must be in WAITING or CREATED state
- **API Call**: `getGameSessionByGamePin(gamePin)`
- **Background**: `.game-pin-background`

#### Step 2: ENTERNICKNAME

- **Input**: Player nickname
- **Validation**:
  - Must be 2-20 characters
  - Wallet must be connected
  - Nickname must be unique in session
- **Socket Action**: `socketClient.joinGame(sessionId, nickname, walletAddress)`
- **Background**: `.start-screen-background`

#### Step 3: LOBBYROOM

- **Display**: Player's chosen nickname and avatar
- **Wait**: For host to start game
- **Status**: Connection indicator
- **Socket Listen**: `game-started` event
- **Auto-navigate**: To `/play` when game starts

### Socket Integration

```typescript
// Join game
socketClient.joinGame(gameSession.id, nickname, walletAddress)

// Listen for confirmation
socketClient.onJoinedGame((data) => {
  if (data.success) {
    setStepper(JoinGameStep.LOBBYROOM)
  }
})

// Listen for game start
socketClient.onGameStarted((data) => {
  router.push(`/play?sessionId=...&playerName=...&gamePin=...`)
})
```

### Error Handling

- Invalid game PIN
- Game already started
- Nickname too short/long
- Nickname already taken
- Wallet connection lost

### Navigation Flow

```
/join → Enter PIN → Enter Nickname → Lobby → Auto-navigate to /play
```

---

## 7. Play Game Page (/play)

**File:** [app/play/page.tsx](../../app/play/page.tsx)

### Purpose

Player's game interface for answering questions in real-time.

### User Type

Player only

### URL Parameters

```typescript
?sessionId=<game-session-id>
&playerName=<player-nickname>
&gamePin=<6-digit-pin>
```

### Features

- Display current question
- Show answer options (A, B, C, D)
- Countdown timer
- Submit answer
- Instant feedback (correct/incorrect)
- View personal score
- See current ranking
- Track answer streaks

### Socket Events

- **Listen**: `question-started` - New question broadcast
- **Listen**: `question-results` - Answer feedback
- **Listen**: `game-ended` - Game completed
- **Emit**: `submit-answer` - Player's answer submission

### Answer Submission

```typescript
socketClient.submitAnswer({
  gameSessionId: string,
  playerName: string,
  questionId: string,
  answerId: string,
  timeToAnswer: number, // milliseconds
})
```

### Component Used

- `<PlayGame />` - Player game interface

### UI States

1. **Waiting**: Between questions
2. **Question Active**: Display question and timer
3. **Answer Submitted**: Disable buttons, show feedback
4. **Results**: Show correct answer and score update

### Navigation

- **Next**: `/score?sessionId=...&playerName=...` - After game ends

---

## 8. Scoreboard Page (/score)

**File:** [app/score/page.tsx](../../app/score/page.tsx)

### Purpose

Final results display with rankings and statistics.

### User Type

Both Host and Player (different views)

### URL Parameters

```typescript
// Host view
?sessionId=<game-session-id>&host=true

// Player view
?sessionId=<game-session-id>&playerName=<nickname>
```

### Features

- Final leaderboard with rankings
- Top 3 winners highlighted
- Player statistics:
  - Total score
  - Correct/incorrect answers
  - Best streak
  - Answer accuracy
- Prize distribution information (if applicable)
- Play again button

### Socket Events

- **Listen**: `prizes-distributed` - Prize payout confirmation
- **Listen**: `prize-distribution-failed` - Error handling

### Component Used

- `<ScoreBoard />` - Results display

### Data Displayed

```typescript
{
  ranking: number,
  playerName: string,
  totalScore: number,
  correctAnswers: number,
  wrongAnswers: number,
  currentStreak: number,
  bestStreak: number,
  walletAddress?: string
}
```

### Navigation

- **Back**: `/` - Return to home/start again

---

## Route Guards & Access Control

### Wallet Requirements

All routes require wallet connection via Privy:

- Redirects to `/` if no wallet connected
- Checks `usePrivy()` ready state
- Validates embedded or external wallet

### Role-Based Access

- **Host Routes**: `/create`, `/generate`, `/lobby`, `/game`, `/score?host=true`
- **Player Routes**: `/join`, `/play`, `/score?playerName=...`

### State Validation

- Game session must exist
- Game must be in appropriate state
- Player must be registered in session

---

## Common Patterns Across Routes

### Socket Connection

All real-time routes establish socket connection:

```typescript
useEffect(() => {
  const socket = socketClient.connect()

  socket.on('connect', () => {
    console.log('Connected')
    setIsSocketConnected(true)
  })

  return () => {
    // Cleanup listeners, but keep connection
  }
}, [])
```

### Error Handling

```typescript
const [error, setError] = useState('')

// Display errors
{error && <p className='text-red-500'>{error}</p>}
```

### Navigation with State

```typescript
router.push(`/page?param1=value1&param2=value2`)
```

### Loading States

Most pages include connection status indicators:

```typescript
{
  isSocketConnected ? '🟢 Connected' : '🔴 Reconnecting...'
}
```

---

## Background Classes

Custom background styles used across routes:

- `.start-screen-background` - Home page
- `.game-type-background` - Game type selection
- `.canvas-type-background` - Canvas selection
- `.quiz-form-background` - Quiz creation
- `.game-pin-background` - PIN entry and lobby

These are defined in [app/globals.css](../../app/globals.css)

---

## URL Parameter Conventions

### Standard Parameters

- `sessionId`: Game session database ID
- `gamePin`: 6-digit game PIN
- `playerName`: Player's nickname
- `host`: Boolean flag for host view

### Example URLs

```
/lobby?sessionId=abc123&gamePin=123456&host=true
/play?sessionId=abc123&playerName=Alice&gamePin=123456
/score?sessionId=abc123&host=true
```

---

## Navigation Diagram

```
           [Home /]
              |
        ┌─────┴─────┐
        |           |
    [Host]      [Player]
        |           |
   [/create]    [/join]
        |           |
    [/lobby]    (lobby wait)
        |           |
    [/game]     [/play]
        |           |
        └─────┬─────┘
              |
          [/score]
              |
           [Home]
```

---

## Related Documentation

- [Custom Components](./03-custom-components.md) - Components used in routes
- [Socket Events](../services/02-socket-client.md) - Real-time communication
- [Game Flow](../architecture/04-game-flow.md) - State transitions

---

**Last Updated:** 2025-11-05
