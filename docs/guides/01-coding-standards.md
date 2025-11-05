# Coding Standards & Best Practices

## Overview

This document defines the coding standards, conventions, and best practices for the Flamingo Web codebase.

## TypeScript Guidelines

### Strict Mode
The project uses TypeScript strict mode. All code must be type-safe.

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Type Annotations

#### Always Annotate Function Parameters and Return Types
```typescript
// Good
function calculateScore(correct: number, time: number): number {
  return correct * 100 - time;
}

// Bad
function calculateScore(correct, time) {
  return correct * 100 - time;
}
```

#### Use Interfaces for Object Types
```typescript
// Good
import { IQuiz } from '@/interfaces/IQuiz';

function createQuiz(quizData: IQuiz): Promise<IResponse> {
  // Implementation
}

// Bad
function createQuiz(quizData: any): Promise<any> {
  // Implementation
}
```

#### Avoid `any` Type
```typescript
// Good
function handleData(data: unknown): void {
  if (typeof data === 'string') {
    // Handle string
  }
}

// Bad
function handleData(data: any): void {
  // Implementation
}
```

---

## React Component Guidelines

### Component Structure

#### Functional Components with TypeScript
```typescript
'use client' // Only if client-side features needed

import { useState, useEffect } from 'react';
import { IQuiz } from '@/interfaces/IQuiz';

interface QuizCardProps {
  quiz: IQuiz;
  onSelect: (id: string) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, onSelect }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Cleanup pattern
    return () => {
      // Cleanup code
    };
  }, []);

  return (
    <div>{quiz.title}</div>
  );
};
```

### Component Organization
```
ComponentName/
├── index.tsx           # Component logic
├── types.ts            # Component-specific types (if complex)
└── utils.ts            # Component-specific utilities (if needed)
```

### Props Interface Naming
```typescript
// Good: ComponentNameProps
interface GameControllerProps {
  sessionId: string;
  gamePin: string;
}

// Bad
interface Props { }
interface IProps { }
```

---

## State Management

### useState
```typescript
// Always provide type for complex state
const [quiz, setQuiz] = useState<IQuiz | null>(null);`
const [players, setPlayers] = useState<IPlayer[]>([]);
const [error, setError] = useState<string>('');

// Simple primitives can infer type
const [count, setCount] = useState(0);
const [isLoading, setIsLoading] = useState(false);
```

### useEffect

#### Always Include Cleanup
```typescript
useEffect(() => {
  const socket = socketClient.connect();

  socket.on('connect', handleConnect);

  return () => {
    socket.off('connect', handleConnect);
  };
}, []);
```

#### Explicit Dependencies
```typescript
// Good: All dependencies listed
useEffect(() => {
  fetchData(id);
}, [id, fetchData]);

// Bad: Missing dependencies
useEffect(() => {
  fetchData(id);
}, []); // ESLint will warn
```

---

## Naming Conventions

### Variables and Functions
```typescript
// camelCase for variables and functions
const gameSession = ...;
const playerCount = ...;

function calculateScore() { }
function handlePlayerJoin() { }
```

### Components
```typescript
// PascalCase for components
export const GameController = () => { };
export const StartScreen = () => { };
```

### Interfaces and Types
```typescript
// PascalCase with 'I' prefix for interfaces
export interface IQuiz { }
export interface IPlayer { }

// PascalCase for types
export type QuizFormData = Omit<IQuiz, 'id'>;
```

### Enums
```typescript
// PascalCase for enum name, UPPER_CASE for values
export enum GameState {
  CREATED = "created",
  WAITING = "waiting"
}
```

### Constants
```typescript
// UPPER_CASE for true constants
const MAX_PLAYERS = 50;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// camelCase for configuration objects
const socketConfig = {
  reconnection: true,
  timeout: 5000
};
```

### File Names
```typescript
// kebab-case for files
game-controller.tsx
quiz_service.ts // underscore acceptable
socket.client.ts // dot for namespace
```

---

## Import Organization

### Import Order
```typescript
// 1. React and Next.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { usePrivy } from '@privy-io/react-auth';
import { UserIcon } from '@phosphor-icons/react';

// 3. UI components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. Custom components
import GameController from '@/components/custom/game_controller';

// 5. Services and utilities
import socketClient from '@/utils/socket.client';
import { addQuiz } from '@/services/quiz_service';

// 6. Types and interfaces
import { IQuiz, IQuestion } from '@/interfaces/IQuiz';
import { GameState } from '@/enums/game_state';
import { SocketEvents } from '@/enums/socket-events';
```

### Absolute Imports
Always use `@/` path alias:
```typescript
// Good
import { IQuiz } from '@/interfaces/IQuiz';
import socketClient from '@/utils/socket.client';

// Bad
import { IQuiz } from '../../../interfaces/IQuiz';
import socketClient from '../../utils/socket.client';
```

---

## Error Handling

### Try-Catch Pattern
```typescript
const [error, setError] = useState<string>('');
const [isLoading, setIsLoading] = useState(false);

const fetchQuiz = async (id: string) => {
  setIsLoading(true);
  setError('');

  try {
    const response = await getQuizById(id);

    if (response.ok) {
      setQuiz(response.payload);
    } else {
      throw new Error(response.message);
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred';
    setError(errorMessage);
    console.error('Fetch quiz error:', err);
  } finally {
    setIsLoading(false);
  }
};
```

### API Service Error Handling
```typescript
export async function serviceName(params): Promise<IResponse> {
  const response = await Http.post(endpoint, data);

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

  throw new Error(`Operation failed: ${response.payload.message}`);
}
```

---

## Socket.IO Patterns

### Connection Setup
```typescript
useEffect(() => {
  const socket = socketClient.connect();

  socket.on('connect', () => {
    console.log('✅ Connected:', socket.id);
    setIsConnected(true);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Disconnected:', reason);
    setIsConnected(false);
  });

  // Don't disconnect - other pages need the connection
  return () => {
    // Only clean up specific listeners
  };
}, []);
```

### Event Listener Cleanup
```typescript
useEffect(() => {
  const handlePlayerJoin = (data: any) => {
    setPlayers(prev => [...prev, data]);
  };

  socketClient.onPlayerJoined(handlePlayerJoin);

  return () => {
    socketClient.off(SocketEvents.PLAYER_JOINED);
  };
}, []);
```

### Type-Safe Socket Events
```typescript
// Define event data types
interface PlayerJoinedData {
  playerName: string;
  walletAddress: string;
  gameSessionId: string;
}

// Use in handler
socketClient.onPlayerJoined((data: PlayerJoinedData) => {
  console.log(`${data.playerName} joined`);
});
```

---

## API Service Patterns

### Service Function Template
```typescript
import { IResponse } from '@/interfaces/IResponse';
import { apiOptions } from '@/shared/api.config';
import Http from '@/shared/http.config';

export async function serviceName(params: ParamType): Promise<IResponse> {
  const response = await Http.post(
    `${apiOptions.endpoints.gameService}/path`,
    params
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

  throw new Error(`Failed to perform action: ${response.payload.message}`);
}
```

---

## Form Handling

### React Hook Form Pattern
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const quizSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  questions: z.array(z.object({
    question: z.string().min(1),
    answers: z.array(z.object({
      answer: z.string(),
      correctAnswer: z.boolean()
    }))
  }))
});

type QuizFormValues = z.infer<typeof quizSchema>;

const QuizForm = () => {
  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: '',
      questions: []
    }
  });

  const onSubmit = async (data: QuizFormValues) => {
    try {
      await addQuiz(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
};
```

---

## Component Patterns

### Compound Components
```typescript
export const Card = ({ children, ...props }) => (
  <div className="card" {...props}>{children}</div>
);

export const CardHeader = ({ children }) => (
  <div className="card-header">{children}</div>
);

export const CardContent = ({ children }) => (
  <div className="card-content">{children}</div>
);

// Usage
<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Render Props Pattern
```typescript
interface TimerProps {
  duration: number;
  children: (timeLeft: number) => React.ReactNode;
}

const Timer: React.FC<TimerProps> = ({ duration, children }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <>{children(timeLeft)}</>;
};

// Usage
<Timer duration={30}>
  {(time) => <div>Time left: {time}s</div>}
</Timer>
```

---

## Performance Best Practices

### Memoization
```typescript
import { useMemo, useCallback } from 'react';

// Memoize expensive calculations
const sortedPlayers = useMemo(() => {
  return players.sort((a, b) => b.totalScore - a.totalScore);
}, [players]);

// Memoize callbacks
const handlePlayerJoin = useCallback((player: IPlayer) => {
  setPlayers(prev => [...prev, player]);
}, []);
```

### Lazy Loading
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false
});
```

---

## Styling Guidelines

### TailwindCSS Classes
```typescript
// Good: Organized by category
className="
  flex flex-col items-center justify-center
  w-full max-w-md
  p-4 gap-2
  bg-white rounded-lg shadow-md
  hover:shadow-lg transition-shadow
"

// Use clsx for conditional classes
import clsx from 'clsx';

className={clsx(
  'button',
  isActive && 'button-active',
  isDisabled && 'button-disabled'
)}
```

### Custom Classes
```css
/* globals.css - Use semantic names */
.game-pin-background {
  background-image: url('/images/game-pin-bg.png');
  background-size: cover;
  background-position: center;
}
```

---

## Testing Guidelines

### Test File Structure
```
component.tsx
component.test.tsx
```

### Test Pattern
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## Documentation

### File Headers
```typescript
/**
 * Socket.IO Client Singleton
 *
 * Manages WebSocket connection for real-time communication between
 * the frontend and backend game service.
 *
 * @module utils/socket.client
 * @see {@link SocketEvents} for available events
 */
```

### Function Documentation
```typescript
/**
 * Calculates player score based on correctness and answer speed
 *
 * @param isCorrect - Whether the answer was correct
 * @param timeToAnswer - Time taken in milliseconds
 * @param streak - Current correct answer streak
 * @returns Calculated score points
 *
 * @example
 * const score = calculateScore(true, 2500, 3);
 * // Returns: 1250 (base 1000 + speed bonus - streak multiplier)
 */
function calculateScore(
  isCorrect: boolean,
  timeToAnswer: number,
  streak: number
): number {
  // Implementation
}
```

---

## Git Commit Guidelines

### Commit Message Format
```
type(scope): short description

Longer description if needed

- Bullet points for changes
- Multiple changes listed
```

### Commit Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `test`: Adding tests
- `chore`: Build/config changes

### Examples
```
feat(game): add prize distribution via escrow

- Implement escrow contract integration
- Add prize-distributed socket event
- Update game flow to include payout state

fix(join): validate nickname uniqueness

Prevents players from joining with duplicate nicknames,
which was causing score tracking issues.
```

---

## Code Review Checklist

### Before Submitting PR
- [ ] All TypeScript strict mode checks pass
- [ ] No `any` types used (unless absolutely necessary with comment)
- [ ] All imports use `@/` path alias
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Socket listeners cleaned up in useEffect
- [ ] Component props have TypeScript interface
- [ ] No console.log statements (use console.error for errors)
- [ ] Responsive design works on mobile
- [ ] Code follows naming conventions

### During Review
- [ ] Logic is clear and maintainable
- [ ] No duplicate code
- [ ] State management is appropriate
- [ ] Side effects properly handled
- [ ] Security vulnerabilities checked
- [ ] Performance considerations addressed

---

## Common Pitfalls to Avoid

### 1. Memory Leaks
```typescript
// Bad: No cleanup
useEffect(() => {
  socketClient.onPlayerJoined(handleJoin);
}, []);

// Good: Cleanup listener
useEffect(() => {
  socketClient.onPlayerJoined(handleJoin);

  return () => {
    socketClient.off(SocketEvents.PLAYER_JOINED);
  };
}, []);
```

### 2. Stale Closures
```typescript
// Bad: Closure captures initial value
useEffect(() => {
  socketClient.onPlayerJoined(() => {
    console.log(players); // Always logs initial value
  });
}, []);

// Good: Use functional updates
useEffect(() => {
  socketClient.onPlayerJoined((newPlayer) => {
    setPlayers(prev => [...prev, newPlayer]);
  });

  return () => socketClient.off(SocketEvents.PLAYER_JOINED);
}, []);
```

### 3. Race Conditions
```typescript
// Bad: No cleanup
useEffect(() => {
  fetchData(id).then(setData);
}, [id]);

// Good: Use cleanup to prevent updates after unmount
useEffect(() => {
  let cancelled = false;

  fetchData(id).then(result => {
    if (!cancelled) {
      setData(result);
    }
  });

  return () => {
    cancelled = true;
  };
}, [id]);
```

---

## Related Documentation

- [Component Development](./02-component-development.md)
- [State Management Patterns](./03-state-management.md)
- [Common Patterns](./05-common-patterns.md)

---

**Last Updated:** 2025-11-05
