# Quiz Game Frontend - Real-Time Multiplayer Quiz Platform

A modern, responsive Next.js frontend for a real-time multiplayer quiz game similar to Kahoot. Built with Next.js 14, TypeScript, TailwindCSS, and Socket.IO.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Pages Overview](#pages-overview)
- [Components](#components)
- [Socket.IO Integration](#socketio-integration)
- [Styling Guide](#styling-guide)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### User Experience
- 🎮 **Intuitive Game Flow** - Seamless host and player experiences
- 📱 **Fully Responsive** - Works on mobile, tablet, and desktop
- 🎨 **Modern UI/UX** - Clean, colorful, and engaging design
- ⚡ **Real-Time Updates** - Instant synchronization across all clients
- 🏆 **Live Leaderboards** - Watch scores update in real-time
- ⏱️ **Visual Timers** - Countdown animations and progress indicators
- 🎯 **Answer Feedback** - Immediate visual feedback on selections

### Game Features
- 👥 **Two User Modes** - Host and Player experiences
- 🎲 **Quiz Selection** - Browse and select from available quizzes
- 📊 **Live Game Stats** - See who's answered and current standings
- 🔢 **Game PIN System** - Easy 6-digit join codes
- 🎭 **Player Avatars** - Colorful unique player identifiers
- 📈 **Score Tracking** - Points, streaks, and rankings
- 🎉 **Animated Results** - Engaging result screens

### Technical Features
- ⚡ **Next.js 14** - App Router with Server Components
- 🔌 **WebSocket** - Real-time bidirectional communication
- 🎨 **TailwindCSS** - Utility-first styling
- 🔤 **TypeScript** - Full type safety
- 🧩 **Modular Components** - Reusable UI components
- 🎯 **Custom Hooks** - Shared logic extraction
- 📦 **Optimized Builds** - Fast loading and performance

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | React framework with App Router |
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| TailwindCSS | 3.x | Utility-first CSS |
| Socket.IO Client | 4.x | WebSocket client |
| Phosphor Icons | 2.x | Icon library |
| Radix UI | 1.x | Headless UI components |

---

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Backend server** running (see backend README)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd quiz-game-frontend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration (see [Environment Variables](#environment-variables) section).

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
```

The application will start on `http://localhost:3001`

---

## 🔐 Environment Variables

Create a `.env.local` file with the following:

```bash
# ============================================
# BACKEND API CONFIGURATION
# ============================================
NEXT_PUBLIC_GAMESERVICE_BASE_URL=http://localhost:3000

# ============================================
# OPTIONAL: FEATURE FLAGS
# ============================================
NEXT_PUBLIC_ENABLE_AI_QUIZ=true
NEXT_PUBLIC_MAX_PLAYERS=100
```

### Environment Variable Descriptions

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_GAMESERVICE_BASE_URL` | Backend API URL | - | ✅ |
| `NEXT_PUBLIC_ENABLE_AI_QUIZ` | Enable AI quiz generation | `true` | ❌ |
| `NEXT_PUBLIC_MAX_PLAYERS` | Max players per game | `100` | ❌ |

**Important:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

---

## 🏃 Running the Application

### Development Mode

```bash
# Standard development
npm run dev

# Development with turbo
npm run dev -- --turbo

# Expose to network
npm run dev -- --hostname 0.0.0.0
```

Access the app at:
- Local: `http://localhost:3001`
- Network: `http://[your-ip]:3001`

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start

# Build and start
npm run build && npm start
```

### Linting

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix
```

---

## 📁 Project Structure

```
quiz-game-frontend/
├── app/                              # Next.js 14 App Router
│   ├── page.tsx                      # Home page
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Global styles
│   ├── create/
│   │   └── page.tsx                  # Create quiz page
│   ├── lobby/
│   │   └── page.tsx                  # Game lobby (host)
│   ├── join/
│   │   └── page.tsx                  # Join game (player)
│   ├── game/
│   │   └── page.tsx                  # Game controller (host)
│   ├── play/
│   │   └── page.tsx                  # Play game (player)
│   ├── score/
│   │   └── page.tsx                  # Final scores (host)
│   └── scoreboard/
│       └── page.tsx                  # Final scores (player)
├── components/
│   ├── ui/                           # Reusable UI components
│   │   ├── button.tsx                # Button component
│   │   ├── card.tsx                  # Card component
│   │   ├── input.tsx                 # Input component
│   │   └── ...
│   └── game/                         # Game-specific components
│       ├── PlayerCard.tsx
│       ├── QuestionCard.tsx
│       └── ...
├── lib/
│   └── utils.ts                      # Utility functions
├── services/
│   └── quiz_service.ts               # API service functions
├── utils/
│   └── socket.client.ts              # Socket.IO client (Singleton)
├── interfaces/
│   └── IQuiz.ts                      # TypeScript interfaces
├── enums/
│   ├── game_state.ts                 # Game state enum
│   └── socket-events.ts              # Socket event names
├── public/                           # Static assets
│   ├── images/
│   └── fonts/
├── .env.local                        # Environment variables (gitignored)
├── .env.example                      # Example env file
├── tailwind.config.ts                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
├── next.config.js                    # Next.js configuration
├── package.json                      # Dependencies
└── README.md                         # This file
```

---

## 📄 Pages Overview

### 1. Home Page (`/`)
**Route:** `/`  
**Purpose:** Landing page with game mode selection

**Features:**
- Game mode selection (Hangouts, Team Building, Degen PvP)
- "Coming Soon" badges for disabled modes
- Navigation to create quiz or join game

**Code Location:** `app/page.tsx`

---

### 2. Create Quiz (`/create`)
**Route:** `/create`  
**Purpose:** Create and manage quizzes

**Features:**
- Add/edit/delete questions
- Add 4 answer options per question
- Mark correct answer
- Quiz preview
- Save quiz to database

**Code Location:** `app/create/page.tsx`

---

### 3. Lobby (Host) (`/lobby`)
**Route:** `/lobby?gamePin={PIN}&sessionId={ID}`  
**Purpose:** Host's waiting room before game starts

**Features:**
- Display 6-digit game PIN prominently
- Show all joined players in real-time
- Player list with colored avatars
- "Start Game" button
- Live player count

**User Flow:**
```
Host creates game → Gets PIN → Shares PIN → Waits for players → Starts game
```

**Code Location:** `app/lobby/page.tsx`

---

### 4. Join Game (Player) (`/join`)
**Route:** `/join`  
**Purpose:** Player entry point to join a game

**Features:**
- Enter game PIN
- Enter player nickname
- Validation (unique names, active game)
- Join game room
- Wait for host to start

**User Flow:**
```
Enter PIN → Enter nickname → Join → Wait in lobby → Game starts
```

**Code Location:** `app/join/page.tsx`

**States:**
- `ENTERGAMEPIN`: Enter 6-digit PIN
- `ENTERNICKNAME`: Choose nickname
- `LOBBYROOM`: Waiting room

---

### 5. Game Controller (Host) (`/game`)
**Route:** `/game?gamePin={PIN}&sessionId={ID}`  
**Purpose:** Host's game control interface

**Features:**
- Display current question
- Show all answer options with icons
- Real-time timer countdown
- Show which players have answered
- Display answer statistics
- "Next Question" button
- View live leaderboard after each question

**User Flow:**
```
Question displayed → Timer counts down → Players answer → Results → Next question
```

**Code Location:** `app/game/page.tsx`

---

### 6. Play Game (Player) (`/play`)
**Route:** `/play?sessionId={ID}&playerName={NAME}`  
**Purpose:** Player's game interface

**Features:**
- View question
- Select answer (icon-based buttons)
- Visual feedback on selection
- Timer display
- Score display
- Answer result feedback
- View leaderboard after each question

**User Flow:**
```
See question → Click answer → See if correct → View leaderboard → Next question
```

**Code Location:** `app/play/page.tsx`

---

### 7. Final Scores (Host) (`/score`)
**Route:** `/score?sessionId={ID}`  
**Purpose:** Host's final game results

**Features:**
- Final leaderboard
- Top 3 podium display
- All player rankings
- Score breakdown
- "Play Again" or "New Game" options

**Code Location:** `app/score/page.tsx`

---

### 8. Scoreboard (Player) (`/scoreboard`)
**Route:** `/scoreboard?sessionId={ID}`  
**Purpose:** Player's final results

**Features:**
- Final leaderboard
- Player's final rank
- Score summary
- Personal stats (correct answers, streaks)

**Code Location:** `app/scoreboard/page.tsx`

---

## 🧩 Components

### UI Components (`components/ui/`)

#### Button Component
**File:** `components/ui/button.tsx`

**Features:**
- Multiple variants (default, active, primary, outline, destructive)
- Multiple sizes (sm, lg, xl, gametype, gameanswer)
- Color options (gametype, gameCanvas, gamePin, darkened)
- Left/center icon support
- Delete button overlay (showDelete)
- "Coming Soon" badge overlay (showComingSoon)
- 3D button effect (border styling)

**Usage:**
```typescript
import { Button } from '@/components/ui/button'

// Basic button
<Button variant="primary" size="xl">
    Click Me
</Button>

// With left icon
<Button leftIcon={<Icon size={32} />} variant="active">
    With Icon
</Button>

// With center icon (for answer buttons)
<Button centerIcon={<Icon size={64} />} variant="active" size="gameanswer">
</Button>

// Disabled with "Coming Soon" badge
<Button disabled showComingSoon variant="active">
    Future Feature
</Button>

// Custom badge text
<Button disabled showComingSoon comingSoonText="BETA" variant="active">
    Beta Feature
</Button>

// With delete button
<Button showDelete onDelete={() => console.log('Delete')}>
    Question 1
</Button>
```

**Variants:**
- `default`: Light gray with hover effect
- `active`: White with bold border
- `primary`: Sky blue primary color
- `outline`: White with outline
- `destructive`: Red for destructive actions

**Button Colors:**
- `gametype`: Purple (#2819DB)
- `gameCanvas`: Red (#DA0202)
- `gamePin`: Orange (#FF9700)
- `darkened`: Pink (#E950BE)
- `transparent`: Transparent with border

---

#### Card Component
**File:** `components/ui/card.tsx`

**Features:**
- Consistent styling across app
- 3D border effect
- Sections: Header, Content, Footer
- Action slot for buttons

**Usage:**
```typescript
import { Card, CardHeader, CardContent } from '@/components/ui/card'

<Card>
    <CardHeader>
        <h2>Title</h2>
    </CardHeader>
    <CardContent>
        Content here
    </CardContent>
</Card>
```

---

#### Input Component
**File:** `components/ui/input.tsx`

**Features:**
- Consistent input styling
- Error states
- Placeholder support

**Usage:**
```typescript
import { Input } from '@/components/ui/input'

<Input 
    placeholder="Enter game PIN"
    value={gamePin}
    onChange={(e) => setGamePin(e.target.value)}
    maxLength={6}
/>
```

---

### Game Components

#### Answer Icons
**Icons Used:**
- Triangle (Green - #009900)
- Circle (Orange - #FF9700)
- Square (Blue - #2819DB)
- Star (Red - #F14100)

**Configuration:**
```typescript
const ANSWER_CONFIG = [
    { Icon: TriangleIcon, color: 'bg-[#009900]', borderColor: 'border-[#006600]' },
    { Icon: CircleIcon, color: 'bg-[#FF9700]', borderColor: 'border-[#cc7800]' },
    { Icon: SquareIcon, color: 'bg-[#2819DB]', borderColor: 'border-[#1a0f8a]' },
    { Icon: StarIcon, color: 'bg-[#F14100]', borderColor: 'border-[#b33000]' }
]
```

#### Player Color System
**File:** Throughout game components

**Purpose:** Assign consistent colors to players

**Implementation:**
```typescript
const PLAYER_COLORS = [
    'bg-[#F14100]', 'bg-[#2819DB]', 'bg-[#009900]', 'bg-[#FF9700]',
    'bg-[#E950BE]', 'bg-[#DA0202]', 'bg-[#00B8D4]', 'bg-[#7B1FA2]',
]

// Get consistent color based on player name
const getPlayerColor = (playerName: string) => {
    const hash = playerName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return PLAYER_COLORS[hash % PLAYER_COLORS.length]
}
```

---

## 🔌 Socket.IO Integration

### SocketClient Singleton
**File:** `utils/socket.client.ts`

**Purpose:** Single WebSocket connection shared across the app

**Implementation:**
```typescript
class SocketClient {
    private socket: Socket | null = null;
    private url: string;
    
    constructor() {
        this.url = process.env.NEXT_PUBLIC_GAMESERVICE_BASE_URL ?? "";
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
        
        return this.socket;
    }
    
    // Emit events
    joinGame(gameSessionId: string, playerName: string) {
        this.socket?.emit('join-game', { gameSessionId, playerName });
    }
    
    startGame(gameSessionId: string) {
        this.socket?.emit('start-game', { gameSessionId });
    }
    
    submitAnswer(data: {...}) {
        this.socket?.emit('submit-answer', data);
    }
    
    nextQuestion(gameSessionId: string, questionIndex: number) {
        this.socket?.emit('next-question', { gameSessionId, questionIndex });
    }
    
    // Listen to events
    onQuestionStarted(callback: (data: any) => void) {
        this.socket?.on('question-started', callback);
    }
    
    onAnswerSubmitted(callback: (data: any) => void) {
        this.socket?.on('answer-submitted', callback);
    }
    
    onQuestionResults(callback: (data: any) => void) {
        this.socket?.on('question-results', callback);
    }
    
    onGameStateChanged(callback: (data: any) => void) {
        this.socket?.on('game-state-changed', callback);
    }
    
    // Remove listeners
    off(event: string) {
        this.socket?.off(event);
    }
    
    // Disconnect
    disconnect() {
        this.socket?.disconnect();
    }
}

export default new SocketClient();
```

### Using Socket in Components

**Pattern:**
```typescript
import socketClient from '@/utils/socket.client'
import { SocketEvents } from '@/enums/socket-events'

function GameComponent() {
    useEffect(() => {
        // Connect
        const socket = socketClient.connect()
        
        // Sync state on mount (handles refresh)
        if (socket.connected && sessionId) {
            getGameSession(sessionId).then(response => {
                setGameState(response.payload.status)
            })
        }
        
        // Connection handlers
        socket.on('connect', () => {
            console.log('Connected')
        })
        
        socket.on('disconnect', () => {
            console.log('Disconnected')
        })
        
        // Game state changes
        socket.on('game-state-changed', (data) => {
            setGameState(data.state)
        })
        
        // Other listeners
        socketClient.onQuestionStarted((data) => {
            setQuestion(data.question)
        })
        
        // Cleanup
        return () => {
            socket.off('connect')
            socket.off('disconnect')
            socket.off('game-state-changed')
            socketClient.off('question-started')
        }
    }, [sessionId])
    
    return <div>...</div>
}
```

**Why Cleanup?**
- Prevents memory leaks
- Removes old listeners before adding new ones
- Avoids duplicate event handlers
- Essential for React component lifecycle

---

## 🎨 Styling Guide

### TailwindCSS Configuration
**File:** `global.css`

**Custom Colors:**
```typescript
colors: {
    gameBlue: '#2819DB',
    gameRed: '#DA0202',
    gameOrange: '#FF9700',
    gamePink: '#E950BE',
    gameGreen: '#009900',
}
```

### Custom Fonts
**Fonts Used:**
- **Oi** - Score/points display
- **Inter** - General UI text

**Usage:**
```typescript
// For scores
<h1 className="font-[Oi] text-4xl">1500</h1>

// With text stroke
<h1 className="font-[Oi] [-webkit-text-stroke:2px_black] text-white">
    1500
</h1>
```

### Common Patterns

#### 3D Button Effect
```typescript
className="
    bg-blue-500 
    border-2 border-blue-700 
    border-b-[6px] border-r-[6px] 
    active:border-b-2 active:border-r-2
"
```

#### Responsive Grid
```typescript
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
```

#### Card with Shadow
```typescript
className="
    bg-white rounded-xl 
    border-2 border-slate-800 
    border-b-6 border-r-6 
    shadow-lg
"
```

#### Centered Content
```typescript
className="flex items-center justify-center h-screen"
```

### Background Images
**Location:** `public/images/`

**Usage:**
```typescript
<div className="game-pin-background h-screen bg-no-repeat bg-cover">
    {/* Content */}
</div>
```

**CSS:**
```css
.game-pin-background {
    background-image: url('/images/game-background.jpg');
}

.result-background {
    background-image: url('/images/result-background.jpg');
}
```

---

## 🔄 Game State Flow

### Game States
```typescript
enum GameState {
    CREATED = "created",
    WAITING = "waiting",
    COUNTDOWN = "countdown",
    IN_PROGRESS = "in_progress",
    RESULTS_READY = "results_ready",
    COMPLETED = "completed"
}
```

### State Transitions

```
HOST                    PLAYER
  │                       │
  ├─ CREATED              │
  │  (create game)        │
  │                       │
  ├─ WAITING ────────────┤
  │  (lobby)              │ WAITING
  │                       │ (joined lobby)
  │                       │
  ├─ COUNTDOWN ──────────┤
  │  (3-2-1)              │ COUNTDOWN
  │                       │ (see countdown)
  │                       │
  ├─ IN_PROGRESS ────────┤
  │  (question active)    │ IN_PROGRESS
  │                       │ (answer question)
  │                       │
  ├─ RESULTS_READY ──────┤
  │  (show leaderboard)   │ RESULTS_READY
  │                       │ (see result)
  │                       │
  ├─ IN_PROGRESS ────────┤
  │  (next question)      │ IN_PROGRESS
  │                       │
  │  ... repeat ...       │
  │                       │
  ├─ COMPLETED ──────────┤
  │  (final scores)       │ COMPLETED
  │                       │ (final scores)
```

---

## 🚀 Deployment

### Vercel (Recommended)

#### 1. Install Vercel CLI
```bash
npm i -g vercel
```

#### 2. Login
```bash
vercel login
```

#### 3. Deploy
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### 4. Environment Variables
Add in Vercel dashboard:
- `NEXT_PUBLIC_GAMESERVICE_BASE_URL`

### Manual Deployment

#### Build
```bash
npm run build
```

#### Export Static Site (if applicable)
```bash
npm run build
npm run export
```

#### Deploy `out/` folder to:
- Netlify
- GitHub Pages
- AWS S3
- Any static hosting

### Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3001
CMD ["npm", "start"]
```

#### Build and Run
```bash
docker build -t quiz-frontend .
docker run -p 3001:3001 --env-file .env.local quiz-frontend
```

### Environment-Specific Builds

#### Production
```bash
NEXT_PUBLIC_GAMESERVICE_BASE_URL=https://api.yourdomain.com npm run build
```

#### Staging
```bash
NEXT_PUBLIC_GAMESERVICE_BASE_URL=https://staging-api.yourdomain.com npm run build
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. WebSocket Connection Failed

**Problem:** Cannot connect to backend

**Solution:**
```bash
# Check environment variable
echo $NEXT_PUBLIC_GAMESERVICE_BASE_URL

# Should be: http://localhost:3000 (dev) or https://api.yourdomain.com (prod)

# Verify backend is running
curl http://localhost:3000/health
```

#### 2. Game State Not Syncing

**Problem:** Players see different game states

**Solution:**
- Ensure `game-state-changed` listener is added
- Check browser console for WebSocket errors
- Verify backend is broadcasting state changes
- Clear browser cache and refresh

#### 3. Players Not Showing in Lobby

**Problem:** Joined players don't appear

**Solution:**
```typescript
// Check if socket is connected
socket.connected // should be true

// Check if player-joined listener is active
socket.listeners('player-joined') // should have listener

// Verify player successfully joined
// Check backend logs for join-game event
```

#### 4. Timer Desynchronization

**Problem:** Timer shows different values for different users

**Solution:**
- Timers are server-controlled
- Clients should only display received time values
- Don't run client-side countdown
- Sync on reconnection

#### 5. Answer Not Submitting

**Problem:** Click answer but nothing happens

**Solution:**
```typescript
// Check if already answered
hasAnswered // should be false

// Check game state
gameState === GameState.IN_PROGRESS // should be true

// Check question loaded
question !== null // should be true

// Verify WebSocket connected
socket.connected // should be true
```

#### 6. Build Errors

**Problem:** TypeScript errors during build

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules
npm install

# Check TypeScript version
npm list typescript

# Rebuild
npm run build
```

#### 7. Hydration Errors

**Problem:** React hydration mismatch

**Solution:**
```typescript
// Use client components for dynamic content
'use client'

// Suppress hydration warning if needed (use sparingly)
<div suppressHydrationWarning>
    {dynamicContent}
</div>

// Or use useEffect for client-only rendering
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (!mounted) return null
```

### Debug Mode

```bash
# Enable debug logs
DEBUG=* npm run dev

# Next.js specific
NODE_OPTIONS='--inspect' npm run dev
```

### Browser Console Commands

```javascript
// Check socket connection
window.socket = socketClient.connect()
window.socket.connected

// Emit test event
window.socket.emit('ping')

// Check listeners
window.socket.listeners('question-started')

// Force reconnect
window.socket.disconnect()
window.socket.connect()
```

---

## 📊 Performance Optimization

### Image Optimization

```typescript
import Image from 'next/image'

<Image
    src="/images/logo.png"
    alt="Logo"
    width={200}
    height={100}
    priority // for above-the-fold images
/>
```

### Code Splitting

```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
    loading: () => <p>Loading...</p>,
    ssr: false // client-side only if needed
})
```

### Caching

```typescript
// Cache API responses
const getQuizzes = async () => {
    const res = await fetch('/api/quizzes', {
        next: { revalidate: 3600 } // Cache for 1 hour
    })
    return res.json()
}
```

---

## 🧪 Testing

### Manual Testing Checklist

#### Host Flow
- [ ] Create game session
- [ ] Game PIN displayed correctly
- [ ] Players appear in lobby
- [ ] Start game button works
- [ ] Countdown displays (3-2-1)
- [ ] Questions display correctly
- [ ] Timer counts down
- [ ] Player answers appear in real-time
- [ ] Leaderboard shows after question
- [ ] Next question button works
- [ ] Final scores display correctly

#### Player Flow
- [ ] Enter valid game PIN
- [ ] Enter unique nickname
- [ ] Join game successfully
- [ ] See lobby with other players
- [ ] Countdown displays
- [ ] Question displays correctly
- [ ] Answer buttons work
- [ ] Selected answer highlighted
- [ ] Cannot answer twice
- [ ] Result feedback shows (correct/wrong)
- [ ] Points awarded correctly
- [ ] Leaderboard displays
- [ ] Final scores display

#### Edge Cases
- [ ] Invalid game PIN
- [ ] Duplicate nickname
- [ ] Join after game started
- [ ] Page refresh during game
- [ ] Network disconnection
- [ ] Reconnection handling
- [ ] Multiple games simultaneously
- [ ] All players answer at once

---

## 📝 Scripts

```json
{
  "dev": "next dev -p 3001",
  "build": "next build",
  "start": "next start -p 3001",
  "lint": "next lint",
  "type-check": "tsc --noEmit"
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Code Style

- Use TypeScript for all new files
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful component names
- Add comments for complex logic
- Keep components under 300 lines

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Support

For issues and questions:
- Open an issue on GitHub
- Email: support@quizgame.com
- Documentation: https://docs.quizgame.com

---

## 🎯 Roadmap

### Planned Features
- [ ] User authentication
- [ ] Quiz library browsing
- [ ] Custom quiz themes
- [ ] Profile pages
- [ ] Game history
- [ ] Statistics dashboard
- [ ] Team mode
- [ ] Tournament mode
- [ ] Mobile apps
- [ ] Social sharing

### UI Improvements
- [ ] Dark mode
- [ ] Accessibility improvements
- [ ] Animation polish
- [ ] Sound effects
- [ ] Confetti on win
- [ ] Custom avatar selection

---

## 📚 Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Socket.IO Client Docs](https://socket.io/docs/v4/client-api/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Tools
- [Phosphor Icons](https://phosphoricons.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Vercel](https://vercel.com/)

---

**Built with ❤️ by the Flamingo Team**