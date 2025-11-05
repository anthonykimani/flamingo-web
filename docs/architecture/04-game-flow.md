# Game Flow & State Management

## Overview

This document describes the complete game flow, state transitions, and interaction patterns for both Host and Player roles in Flamingo Web.

## Game State Lifecycle

### State Diagram

```
┌─────────┐
│ CREATED │ - Initial session creation
└────┬────┘
     │
     v
┌─────────┐
│ WAITING │ - Players joining lobby
└────┬────┘
     │ Host starts game
     v
┌──────────────┐
│ IN_PROGRESS  │ - Active gameplay
└──────┬───────┘
       │
       v
┌───────────┐
│ COUNTDOWN │ - Pre-question countdown (3,2,1)
└─────┬─────┘
      │
      v
┌──────────────┐
│ IN_PROGRESS  │ - Question active, accepting answers
└──────┬───────┘
       │ Time expires or all answered
       v
┌──────────┐
│ TIMEOUT  │ - Stop accepting answers
└────┬─────┘
     │
     v
┌───────────────┐
│ RESULTS_READY │ - Show correct answer and scores
└───────┬───────┘
        │
        ├─ More questions? → COUNTDOWN (next question)
        │
        └─ Final question? ↓
                          v
                    ┌─────────┐
                    │ PAYOUT  │ - Distribute prizes
                    └────┬────┘
                         │
                         v
                    ┌───────────┐
                    │ COMPLETED │ - Game ended
                    └───────────┘
```

---

## Host Flow

### 1. Quiz Creation
**Route:** `/create`

```typescript
// Step 1: Choose game type
CreateGameStep.GAMETYPE
  - Hangouts
  - Team Building
  - Degen PvP

// Step 2: Choose creation method
CreateGameStep.GAMECANVAS
  - Manual creation → Go to form
  - AI generation → Go to /generate

// Step 3: Create quiz
CreateGameStep.GAMEFORM
  - Enter quiz title
  - Add questions (min 1)
  - Add 4 answers per question
  - Mark correct answer
  - Save quiz

// Result
const quiz = await addQuiz(quizData);
const session = await createGameSession(quiz.id);

// Navigate to lobby
router.push(`/lobby?sessionId=${session.id}&gamePin=${session.gamePin}&host=true`);
```

---

### 2. Lobby (Waiting Room)
**Route:** `/lobby`
**State:** `GameState.WAITING`

#### Setup
```typescript
useEffect(() => {
  const socket = socketClient.connect();

  // Listen for players joining
  socketClient.onPlayerJoined((data) => {
    setPlayers(prev => [...prev, data]);
    toast.success(`${data.playerName} joined!`);
  });

  // Listen for players leaving
  socketClient.onPlayerLeft((data) => {
    setPlayers(prev => prev.filter(p => p.playerName !== data.playerName));
  });

  return () => {
    socketClient.off(SocketEvents.PLAYER_JOINED);
    socketClient.off(SocketEvents.PLAYER_LEFT);
  };
}, []);
```

#### UI Elements
- Large game PIN display
- QR code for mobile joining (optional)
- Real-time player list with avatars
- Player count
- "Start Game" button (enabled when ≥1 player)

#### Starting the Game
```typescript
const handleStartGame = async () => {
  try {
    // Update game state
    await startGame(sessionId, GameState.IN_PROGRESS);

    // Emit socket event
    socketClient.startGame(sessionId);

    // Navigate to game controller
    router.push(`/game?sessionId=${sessionId}&gamePin=${gamePin}`);
  } catch (error) {
    console.error('Start game error:', error);
    toast.error('Failed to start game');
  }
};
```

---

### 3. Game Controller
**Route:** `/game`
**State:** `GameState.IN_PROGRESS` → `GameState.COUNTDOWN` → ... → `GameState.COMPLETED`

#### Initialization
```typescript
useEffect(() => {
  // Load game session and quiz
  const loadGame = async () => {
    const session = await getGameSession(sessionId);
    const quiz = await getQuizById(session.quizId);

    setGameSession(session);
    setQuiz(quiz);
    setCurrentQuestionIndex(0);
  };

  loadGame();

  // Listen for player answers
  socketClient.onPlayerAnswered((data) => {
    setAnsweredPlayers(prev => [...prev, data.playerName]);
  });

  return () => {
    socketClient.off(SocketEvents.PLAYER_ANSWERED);
  };
}, []);
```

#### Question Flow
```typescript
const handleStartQuestion = async (questionIndex: number) => {
  // 1. Update state to countdown
  await updateGame(sessionId, GameState.COUNTDOWN);

  // 2. Show countdown (3, 2, 1)
  setCountdown(3);
  const countdownInterval = setInterval(() => {
    setCountdown(prev => {
      if (prev <= 1) {
        clearInterval(countdownInterval);
        startQuestion();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
};

const startQuestion = async () => {
  // 3. Update to in progress
  await updateGame(sessionId, GameState.IN_PROGRESS);

  // 4. Broadcast question to all players
  socketClient.nextQuestion(sessionId, currentQuestionIndex);

  // 5. Start question timer (e.g., 20 seconds)
  setTimeRemaining(20);
  const questionTimer = setInterval(() => {
    setTimeRemaining(prev => {
      if (prev <= 1) {
        clearInterval(questionTimer);
        handleQuestionTimeout();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
};

const handleQuestionTimeout = async () => {
  // 6. Time's up - stop accepting answers
  await updateGame(sessionId, GameState.TIMEOUT);

  // 7. Show results after brief delay
  setTimeout(() => {
    handleShowResults();
  }, 1000);
};

const handleShowResults = async () => {
  // 8. Update state and emit results
  await updateGame(sessionId, GameState.RESULTS_READY);
  socketClient.showResults(sessionId, currentQuestion.id);

  // 9. Wait for results to be viewed
  setTimeout(() => {
    handleNextQuestion();
  }, 5000);
};

const handleNextQuestion = () => {
  const nextIndex = currentQuestionIndex + 1;

  if (nextIndex < quiz.questions.length) {
    // More questions - continue
    setCurrentQuestionIndex(nextIndex);
    setAnsweredPlayers([]);
    handleStartQuestion(nextIndex);
  } else {
    // No more questions - end game
    handleEndGame();
  }
};

const handleEndGame = async () => {
  try {
    // Check if prizes should be distributed
    if (gameSession.prizePool && gameSession.prizePool > 0) {
      await updateGame(sessionId, GameState.PAYOUT);

      // Listen for payout completion
      socketClient.onPrizesDistributed((data) => {
        console.log('Prizes distributed:', data.txHash);
        completeGame();
      });

      socketClient.onPrizeDistributionFailed((data) => {
        console.error('Prize distribution failed:', data.message);
        completeGame();
      });
    } else {
      completeGame();
    }
  } catch (error) {
    console.error('End game error:', error);
  }
};

const completeGame = async () => {
  // Update final state
  await updateGame(sessionId, GameState.COMPLETED);

  // Emit end game event
  socketClient.endGame(sessionId);

  // Navigate to scores
  router.push(`/score?sessionId=${sessionId}&host=true`);
};
```

#### UI Elements
- Current question display
- Question number / total
- Countdown timer (circular or linear)
- Players who have answered
- Time remaining
- "Show Results" button (manual trigger option)
- "Next Question" button
- "End Game" button

---

### 4. Scoreboard
**Route:** `/score?host=true`
**State:** `GameState.COMPLETED`

#### Data Loading
```typescript
useEffect(() => {
  const loadResults = async () => {
    const leaderboard = await getLeaderboard(sessionId);
    setLeaderboard(leaderboard);
  };

  loadResults();

  // Listen for prize events
  socketClient.onPrizesDistributed((data) => {
    setTxHash(data.txHash);
    setWinners(data.winners);
  });
}, []);
```

#### UI Elements
- Final rankings (1st, 2nd, 3rd highlighted)
- All players with scores
- Statistics:
  - Total questions
  - Average accuracy
  - Best streak
- Prize distribution info (if applicable)
- Transaction hash link
- "Play Again" button
- "Home" button

---

## Player Flow

### 1. Join Game
**Route:** `/join`

#### Step 1: Enter Game PIN
```typescript
JoinGameStep.ENTERGAMEPIN

const handleJoinGame = async () => {
  try {
    // Validate PIN
    const session = await getGameSessionByGamePin(gamePin);

    // Check game state
    if (session.status !== GameState.WAITING && session.status !== GameState.CREATED) {
      setError('Game has already started or ended');
      return;
    }

    setGameSession(session);
    setStepper(JoinGameStep.ENTERNICKNAME);
  } catch (error) {
    setError('Invalid game PIN or game not found');
  }
};
```

#### Step 2: Enter Nickname
```typescript
JoinGameStep.ENTERNICKNAME

const handleSetNickname = async () => {
  try {
    // Validate nickname
    if (nickname.length < 2 || nickname.length > 20) {
      setError('Nickname must be 2-20 characters');
      return;
    }

    // Get wallet address
    const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');

    if (!embeddedWallet?.address) {
      setError('Wallet connection lost');
      return;
    }

    // Join via socket
    socketClient.joinGame(gameSession.id, nickname, embeddedWallet.address);

    // Wait for confirmation
    socketClient.onJoinedGame((data) => {
      if (data.success) {
        setStepper(JoinGameStep.LOBBYROOM);
      } else {
        setError(data.message || 'Failed to join game');
      }
    });
  } catch (error) {
    setError('Failed to join game');
  }
};
```

#### Step 3: Lobby Room
```typescript
JoinGameStep.LOBBYROOM

useEffect(() => {
  // Wait for game to start
  socketClient.onGameStarted((data) => {
    router.push(`/play?sessionId=${gameSession.id}&playerName=${nickname}&gamePin=${gameSession.gamePin}`);
  });

  return () => {
    socketClient.off(SocketEvents.GAME_STARTED);
  };
}, [gameSession, nickname]);
```

---

### 2. Play Game
**Route:** `/play`

#### Initialization
```typescript
useEffect(() => {
  const socket = socketClient.connect();

  // Listen for questions
  socketClient.onQuestionStarted((data) => {
    setCurrentQuestion(data.question);
    setTimeRemaining(data.timeLimit);
    setAnswerSubmitted(false);
    setSelectedAnswer(null);
  });

  // Listen for results
  socketClient.onQuestionResults((data) => {
    setIsCorrect(data.isCorrect);
    setCorrectAnswerId(data.correctAnswer.id);
    setPlayerScore(data.newScore);
    setPlayerRank(data.rank);
    setStreak(data.streak);
  });

  // Listen for game end
  socketClient.onGameEnded((data) => {
    router.push(`/score?sessionId=${sessionId}&playerName=${playerName}`);
  });

  return () => {
    socketClient.off(SocketEvents.QUESTION_STARTED);
    socketClient.off(SocketEvents.QUESTION_RESULTS);
    socketClient.off(SocketEvents.GAME_ENDED);
  };
}, []);
```

#### Answer Submission
```typescript
const handleAnswerSelect = async (answerId: string) => {
  if (answerSubmitted) return;

  const timeToAnswer = Date.now() - questionStartTime;

  try {
    // Submit via socket
    socketClient.submitAnswer({
      gameSessionId: sessionId,
      playerName,
      questionId: currentQuestion.id,
      answerId,
      timeToAnswer
    });

    // Update local state
    setAnswerSubmitted(true);
    setSelectedAnswer(answerId);

    // Wait for results
    socketClient.onAnswerSubmitted((data) => {
      console.log('Answer submitted successfully');
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    toast.error('Failed to submit answer');
  }
};
```

#### UI States
```typescript
const renderGameState = () => {
  if (!currentQuestion) {
    return <div>Waiting for next question...</div>;
  }

  return (
    <div>
      {/* Question */}
      <h2>{currentQuestion.question}</h2>

      {/* Timer */}
      <CircularTimer timeRemaining={timeRemaining} />

      {/* Answers */}
      <div className="answers-grid">
        {currentQuestion.answers.map((answer) => (
          <Button
            key={answer.id}
            onClick={() => handleAnswerSelect(answer.id)}
            disabled={answerSubmitted}
            className={clsx(
              'answer-button',
              answerSubmitted && answer.id === selectedAnswer && 'selected',
              showResults && answer.id === correctAnswerId && 'correct',
              showResults && answer.id === selectedAnswer && !isCorrect && 'incorrect'
            )}
          >
            {answer.answer}
          </Button>
        ))}
      </div>

      {/* Feedback */}
      {answerSubmitted && !showResults && (
        <div>Answer submitted! Waiting for results...</div>
      )}

      {showResults && (
        <div>
          <p>{isCorrect ? '✅ Correct!' : '❌ Incorrect'}</p>
          <p>Score: {playerScore}</p>
          <p>Rank: {playerRank}</p>
          <p>Streak: {streak}</p>
        </div>
      )}
    </div>
  );
};
```

---

### 3. Final Scores
**Route:** `/score?playerName=...`

#### Data Loading
```typescript
useEffect(() => {
  const loadStats = async () => {
    const leaderboard = await getLeaderboard(sessionId);
    const playerStats = await getPlayerStats(sessionId, playerName);

    setLeaderboard(leaderboard);
    setStats(playerStats);

    // Find player rank
    const rank = leaderboard.findIndex(p => p.playerName === playerName) + 1;
    setPlayerRank(rank);
  };

  loadStats();
}, []);
```

#### UI Elements
- Player's final rank (large display if top 3)
- Personal statistics:
  - Total score
  - Questions answered correctly
  - Questions answered incorrectly
  - Accuracy percentage
  - Best streak
- Full leaderboard
- Prize information (if applicable)
- "Play Again" button

---

## Score Calculation

### Base Points
```typescript
const BASE_POINTS = 1000;
```

### Speed Bonus
```typescript
const calculateSpeedBonus = (timeToAnswer: number, timeLimit: number): number => {
  const timeRemaining = timeLimit - timeToAnswer;
  const speedRatio = timeRemaining / timeLimit;

  // Bonus: 0-500 points based on speed
  return Math.round(speedRatio * 500);
};
```

### Streak Multiplier
```typescript
const calculateStreakMultiplier = (streak: number): number => {
  if (streak < 2) return 1.0;
  if (streak < 5) return 1.2;
  if (streak < 10) return 1.5;
  return 2.0;
};
```

### Final Score Calculation
```typescript
const calculatePoints = (
  isCorrect: boolean,
  timeToAnswer: number,
  timeLimit: number,
  streak: number
): number => {
  if (!isCorrect) return 0;

  const basePoints = BASE_POINTS;
  const speedBonus = calculateSpeedBonus(timeToAnswer, timeLimit);
  const multiplier = calculateStreakMultiplier(streak);

  return Math.round((basePoints + speedBonus) * multiplier);
};
```

---

## Socket Event Flow

### Game Start Sequence
```
Host: START_GAME (emit)
  ↓
Server: GAME_STARTED (broadcast)
  ↓
All Players: Navigate to /play
```

### Question Sequence
```
Host: NEXT_QUESTION (emit)
  ↓
Server: QUESTION_STARTED (broadcast)
  ↓
Players: Display question, start timer
  ↓
Player: SUBMIT_ANSWER (emit)
  ↓
Server: ANSWER_SUBMITTED (to player)
Server: PLAYER_ANSWERED (to host)
  ↓
Host: SHOW_RESULTS (emit)
  ↓
Server: QUESTION_RESULTS (broadcast)
  ↓
All: Display results and updated scores
```

### Game End Sequence
```
Host: END_GAME (emit)
  ↓
Server: Process final scores
  ↓
Server: prizes-distributed (if applicable)
  ↓
Server: GAME_ENDED (broadcast)
  ↓
All: Navigate to /score
```

---

## Error Handling

### Common Error Scenarios

#### Player Can't Join
```typescript
// Game already started
if (session.status !== GameState.WAITING) {
  throw new Error('Game has already started');
}

// Nickname taken
if (players.some(p => p.playerName === nickname)) {
  throw new Error('Nickname already taken');
}

// Wallet not connected
if (!walletAddress) {
  throw new Error('Please connect wallet first');
}
```

#### Connection Lost
```typescript
socket.on('disconnect', (reason) => {
  console.warn('Disconnected:', reason);
  setIsConnected(false);

  if (reason === 'io server disconnect') {
    // Server forcibly disconnected - reconnect manually
    socket.connect();
  }
  // Else: auto-reconnect enabled
});
```

#### Answer Submission Failed
```typescript
socketClient.onError((data) => {
  if (data.message.includes('answer')) {
    toast.error('Failed to submit answer');
    setAnswerSubmitted(false); // Allow retry
  }
});
```

---

## Related Documentation

- [Socket Client](../services/02-socket-client.md)
- [API Services](../services/01-api-services.md)
- [App Routes](../components/01-app-routes.md)
- [GameState Enum](../types/02-enums.md#gamestate)

---

**Last Updated:** 2025-11-05
