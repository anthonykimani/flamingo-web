# Quick Reference Guide

> Fast lookup for common tasks and patterns in Flamingo Web

## Table of Contents
- [Common Imports](#common-imports)
- [Socket.IO Patterns](#socketio-patterns)
- [API Calls](#api-calls)
- [State Management](#state-management)
- [Routing](#routing)
- [TypeScript Types](#typescript-types)
- [Styling](#styling)
- [Error Handling](#error-handling)

---

## Common Imports

### React & Next.js
```typescript
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
```

### UI Components
```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
```

### Services
```typescript
import socketClient from '@/utils/socket.client';
import { addQuiz, getQuizById, createGameSession } from '@/services/quiz_service';
```

### Types
```typescript
import { IQuiz, IQuestion, IAnswer, IPlayer } from '@/interfaces/IQuiz';
import { GameState } from '@/enums/game_state';
import { SocketEvents } from '@/enums/socket-events';
```

### Icons
```typescript
import { UserIcon, SparkleIcon, LegoIcon } from '@phosphor-icons/react';
import { Check, ChevronDown, X } from 'lucide-react';
```

### Web3
```typescript
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useAppKitAccount } from '@reown/appkit/react';
```

---

## Socket.IO Patterns

### Connect & Setup
```typescript
useEffect(() => {
  const socket = socketClient.connect();

  socket.on('connect', () => {
    console.log('✅ Connected:', socket.id);
    setIsConnected(true);
  });

  socket.on('disconnect', () => {
    setIsConnected(false);
  });

  return () => {
    // Don't disconnect - keep connection alive
  };
}, []);
```

### Listen to Events
```typescript
useEffect(() => {
  socketClient.onPlayerJoined((data) => {
    setPlayers(prev => [...prev, data]);
  });

  return () => {
    socketClient.off(SocketEvents.PLAYER_JOINED);
  };
}, []);
```

### Emit Events
```typescript
// Join game
socketClient.joinGame(sessionId, playerName, walletAddress);

// Start game
socketClient.startGame(sessionId);

// Submit answer
socketClient.submitAnswer({
  gameSessionId,
  playerName,
  questionId,
  answerId,
  timeToAnswer
});
```

---

## API Calls

### Create Quiz
```typescript
const quiz: IQuiz = {
  title: "My Quiz",
  questions: [
    {
      questionNumber: 1,
      question: "Question text?",
      answers: [
        { answer: "Option 1", correctAnswer: true },
        { answer: "Option 2", correctAnswer: false }
      ]
    }
  ]
};

const response = await addQuiz(quiz);
```

### Create Game Session
```typescript
const session = await createGameSession(quizId);
console.log(session.gamePin); // 6-digit PIN
```

### Get Game by PIN
```typescript
const session = await getGameSessionByGamePin("123456");
```

### Get Leaderboard
```typescript
const leaderboard = await getLeaderboard(sessionId);
```

---

## State Management

### Basic State
```typescript
const [quiz, setQuiz] = useState<IQuiz | null>(null);
const [players, setPlayers] = useState<IPlayer[]>([]);
const [error, setError] = useState<string>('');
const [isLoading, setIsLoading] = useState(false);
```

### Loading Pattern
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
```

### Timer Pattern
```typescript
const [timeRemaining, setTimeRemaining] = useState(20);

useEffect(() => {
  if (timeRemaining <= 0) return;

  const timer = setInterval(() => {
    setTimeRemaining(prev => Math.max(0, prev - 1));
  }, 1000);

  return () => clearInterval(timer);
}, [timeRemaining]);
```

---

## Routing

### Navigation
```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();

// Navigate
router.push('/lobby?sessionId=123&gamePin=456789');

// Go back
router.back();

// Replace (no history)
router.replace('/');
```

### Read Query Params
```typescript
import { useSearchParams } from 'next/navigation';

const searchParams = useSearchParams();

const sessionId = searchParams.get('sessionId');
const gamePin = searchParams.get('gamePin');
```

### Build URLs
```typescript
const url = `/play?sessionId=${sessionId}&playerName=${encodeURIComponent(name)}`;
router.push(url);
```

---

## TypeScript Types

### Component Props
```typescript
interface GameControllerProps {
  sessionId: string;
  gamePin: string;
}

export const GameController: React.FC<GameControllerProps> = ({
  sessionId,
  gamePin
}) => {
  // Component logic
};
```

### Event Handlers
```typescript
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  // Handle click
};

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setValue(event.target.value);
};
```

### Async Functions
```typescript
const fetchData = async (): Promise<IResponse> => {
  const response = await getQuizById(id);
  return response;
};
```

---

## Styling

### Conditional Classes
```typescript
import clsx from 'clsx';

className={clsx(
  'base-class',
  isActive && 'active-class',
  isDisabled && 'disabled-class'
)}
```

### TailwindCSS Utilities
```typescript
// Layout
className="flex flex-col items-center justify-center gap-4"

// Sizing
className="w-full max-w-md h-screen"

// Spacing
className="p-4 m-2 space-y-3"

// Colors
className="bg-white text-black border-gray-200"

// States
className="hover:bg-gray-100 active:scale-95 disabled:opacity-50"

// Responsive
className="sm:text-lg md:text-xl lg:text-2xl"
```

### Background Images
```typescript
// In component
className="game-pin-background h-screen w-screen bg-no-repeat bg-cover"

// In globals.css
.game-pin-background {
  background-image: url('/images/bg.png');
}
```

---

## Error Handling

### Try-Catch Pattern
```typescript
try {
  const result = await apiCall();
  // Success handling
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error('Error:', message);
  setError(message);
  toast.error(message);
}
```

### Socket Error Handling
```typescript
socketClient.onError((data) => {
  console.error('Socket error:', data.message);
  toast.error(data.message);
});
```

### Form Validation
```typescript
const handleSubmit = async () => {
  // Validate
  if (!title.trim()) {
    setError('Title is required');
    return;
  }

  if (questions.length === 0) {
    setError('Add at least one question');
    return;
  }

  // Submit
  try {
    await addQuiz({ title, questions });
  } catch (error) {
    setError('Failed to save quiz');
  }
};
```

---

## Common Code Snippets

### Wait for Event
```typescript
const waitForGameStart = () => {
  return new Promise((resolve) => {
    socketClient.onGameStarted((data) => {
      resolve(data);
    });
  });
};

await waitForGameStart();
router.push('/play');
```

### Countdown Timer
```typescript
const [countdown, setCountdown] = useState(3);

useEffect(() => {
  if (countdown <= 0) {
    startQuestion();
    return;
  }

  const timer = setTimeout(() => {
    setCountdown(prev => prev - 1);
  }, 1000);

  return () => clearTimeout(timer);
}, [countdown]);
```

### Array Updates
```typescript
// Add item
setItems(prev => [...prev, newItem]);

// Remove item
setItems(prev => prev.filter(item => item.id !== removeId));

// Update item
setItems(prev => prev.map(item =>
  item.id === updateId ? { ...item, ...updates } : item
));

// Replace all
setItems(newItems);
```

### Object Updates
```typescript
// Update property
setUser(prev => ({ ...prev, name: 'New Name' }));

// Update nested property
setData(prev => ({
  ...prev,
  user: {
    ...prev.user,
    profile: {
      ...prev.user.profile,
      avatar: newAvatar
    }
  }
}));
```

---

## Debugging

### Console Logging
```typescript
// Socket events
socketClient.getSocket()?.onAny((event, ...args) => {
  console.log(`📡 Socket Event: ${event}`, args);
});

// Component lifecycle
useEffect(() => {
  console.log('Component mounted');

  return () => {
    console.log('Component unmounted');
  };
}, []);

// State changes
useEffect(() => {
  console.log('State changed:', state);
}, [state]);
```

### Connection Status
```typescript
<div className="fixed top-4 right-4 text-xs p-2 bg-black/50 text-white rounded">
  {socketClient.isConnected() ? '🟢 Connected' : '🔴 Disconnected'}
</div>
```

---

## Environment Variables

### Access in Code
```typescript
const apiUrl = process.env.NEXT_PUBLIC_GAMESERVICE_BASE_URL;
const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
```

### Required Variables
```bash
NEXT_PUBLIC_GAMESERVICE_BASE_URL=http://localhost:3077
NEXT_PUBLIC_PRIVY_APP_ID=your_app_id
NEXT_PUBLIC_PRIVY_CLIENT_ID=your_client_id
NEXT_PUBLIC_PIMLICO_API_KEY=your_api_key
```

---

## Keyboard Shortcuts (Development)

### VS Code
- `Ctrl+Shift+P` - Command palette
- `Ctrl+P` - Quick file open
- `F12` - Go to definition
- `Alt+Shift+F` - Format document

### Browser DevTools
- `F12` - Open DevTools
- `Ctrl+Shift+C` - Inspect element
- `Ctrl+Shift+M` - Toggle mobile view

---

## Quick Links

- [Full Documentation](./README.md)
- [API Reference](./services/01-api-services.md)
- [Socket Events](./services/02-socket-client.md)
- [Component Docs](./components/01-app-routes.md)
- [Coding Standards](./guides/01-coding-standards.md)

---

**Last Updated:** 2025-11-05
