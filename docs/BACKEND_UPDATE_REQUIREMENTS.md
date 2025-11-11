# Backend Update Requirements for Prize/Payout System

## Overview
The frontend has been updated to support optional prize/payout functionality for different game modes, particularly the Hangouts mode. The backend needs to be updated to handle these new features.

## Game Modes
Three game modes have been defined:
- **Hangouts**: Casual play with flexible settings (prizes optional)
- **Team Building**: Collaborative gameplay (coming soon)
- **Degen PvP**: Competitive with prizes (coming soon)

## Database Schema Changes

### GameSession Model Updates
Add/Update the following fields in the `GameSession` model:

```typescript
{
  gameMode: {
    type: String,
    enum: ['hangouts', 'team_building', 'degen_pvp'],
    default: 'hangouts',
    required: true
  },
  hasPrizes: {
    type: Boolean,
    default: false,
    required: true
  },
  prizePool: {
    type: Number,
    default: 0,
    required: false  // Only required if hasPrizes is true
  },
  entryFee: {
    type: String,
    required: false  // Optional entry fee per player
  },
  minPlayers: {
    type: Number,
    default: 1,  // Hangouts can start with 1 player, prize games require 3
    required: true
  },
  maxPlayers: {
    type: Number,
    default: 50,
    required: true
  }
}
```

## API Endpoint Updates

### 1. Create Game Session (`POST /games/create-session`)

**Old Request Body:**
```json
{
  "quizId": "quiz_123"
}
```

**New Request Body:**
```json
{
  "quizId": "quiz_123",
  "gameMode": "hangouts",
  "hasPrizes": true,
  "prizePool": 0.1,
  "entryFee": "0.01",
  "minPlayers": 3,
  "maxPlayers": 50
}
```

**Validation Rules:**
1. `gameMode` is required (defaults to 'hangouts')
2. If `hasPrizes` is `true`:
   - `prizePool` must be > 0
   - `minPlayers` must be >= 3
3. If `gameMode` is 'hangouts' and `hasPrizes` is `false`:
   - `minPlayers` can be 1
4. `entryFee` is optional and can be used instead of or in addition to `prizePool`

**Response:**
Return the complete game session including all new fields.

---

### 2. Join Game Validation (`POST /games/join`)

**Updates Required:**
- Check `minPlayers` before allowing game to start
- For prize games (`hasPrizes: true`), ensure at least 3 players have joined before host can start

---

### 3. Start Game Validation (`POST /games/start/:id`)

**New Validation Logic:**
```typescript
if (gameSession.hasPrizes && gameSession.players.length < gameSession.minPlayers) {
  throw new Error(`Prize games require at least ${gameSession.minPlayers} players to start`);
}

if (!gameSession.hasPrizes && gameSession.players.length < 1) {
  throw new Error('At least 1 player required to start the game');
}
```

---

## Socket.IO Event Updates

### Player Join Event
When a player joins, emit updated player count and check if minimum players met:

```typescript
socket.on('join-game', async (data) => {
  const { gameSessionId, playerName, walletAddress } = data;

  // ... existing logic ...

  const session = await GameSession.findById(gameSessionId);

  // Emit to host with player count and min players info
  io.to(gameSessionId).emit('player-joined', {
    playerName,
    walletAddress,
    playerCount: session.players.length,
    minPlayers: session.minPlayers,
    canStart: session.players.length >= session.minPlayers
  });
});
```

---

## Prize Distribution Logic

### Prize Distribution Conditions
Only distribute prizes if:
1. `gameSession.hasPrizes === true`
2. `gameSession.prizePool > 0`
3. Game state is `COMPLETED`
4. At least 3 players participated

### Distribution Logic
```typescript
if (gameSession.hasPrizes && gameSession.prizePool > 0) {
  // Get top 3 players
  const winners = leaderboard.slice(0, 3);

  // Prize distribution: 50% for 1st, 30% for 2nd, 20% for 3rd
  const prizes = {
    first: gameSession.prizePool * 0.5,
    second: gameSession.prizePool * 0.3,
    third: gameSession.prizePool * 0.2
  };

  // Distribute via escrow contract
  await distributeprizes(winners, prizes);

  // Emit success event
  io.to(gameSessionId).emit('prizes-distributed', {
    txHash: transaction.hash,
    winners: winners.map(w => w.walletAddress)
  });
}
```

---

## Escrow Contract Integration

### Requirements
1. **Deposit Function**: When creating a prize game, host deposits prize pool into escrow
2. **Withdrawal Function**: After game completion, winners can claim their prizes
3. **Refund Function**: If game is cancelled, refund prize pool to host

### Contract Methods Needed
```solidity
function depositPrizePool(bytes32 gameSessionId) external payable;
function distributePrizes(bytes32 gameSessionId, address[] memory winners, uint256[] memory amounts) external;
function refundPrizePool(bytes32 gameSessionId) external;
```

---

## Error Handling

### New Error Codes
```typescript
{
  PRIZE_POOL_REQUIRED: 'Prize pool amount is required when hasPrizes is true',
  MIN_PLAYERS_NOT_MET: 'Minimum player requirement not met for prize games',
  INVALID_GAME_MODE: 'Invalid game mode specified',
  PRIZE_DISTRIBUTION_FAILED: 'Failed to distribute prizes',
  INSUFFICIENT_PRIZE_POOL: 'Prize pool amount is too low'
}
```

---

## Migration Script

For existing game sessions without the new fields:

```typescript
db.gamesessions.updateMany(
  { gameMode: { $exists: false } },
  {
    $set: {
      gameMode: 'hangouts',
      hasPrizes: false,
      prizePool: 0,
      minPlayers: 1,
      maxPlayers: 50
    }
  }
);
```

---

## Testing Checklist

### Unit Tests
- [ ] Create game session with prizes enabled
- [ ] Create game session without prizes
- [ ] Validate prize pool > 0 when hasPrizes is true
- [ ] Validate minPlayers >= 3 when hasPrizes is true
- [ ] Test backwards compatibility with old API format

### Integration Tests
- [ ] Full game flow with prizes
- [ ] Full game flow without prizes
- [ ] Prize distribution to top 3 winners
- [ ] Game with less than 3 players (should fail if hasPrizes)
- [ ] Game with 1 player (should work if !hasPrizes)

### Socket Tests
- [ ] Player join with min players check
- [ ] Start game validation
- [ ] Prize distribution events

---

## Example API Calls

### Create Hangouts Game Without Prizes
```bash
curl -X POST http://localhost:3077/games/create-session \
  -H "Content-Type: application/json" \
  -d '{
    "quizId": "quiz_123",
    "gameMode": "hangouts",
    "hasPrizes": false,
    "minPlayers": 1
  }'
```

### Create Hangouts Game With Prizes
```bash
curl -X POST http://localhost:3077/games/create-session \
  -H "Content-Type: application/json" \
  -d '{
    "quizId": "quiz_123",
    "gameMode": "hangouts",
    "hasPrizes": true,
    "prizePool": 0.1,
    "minPlayers": 3
  }'
```

### Create Degen PvP Game (Future)
```bash
curl -X POST http://localhost:3077/games/create-session \
  -H "Content-Type: application/json" \
  -d '{
    "quizId": "quiz_123",
    "gameMode": "degen_pvp",
    "hasPrizes": true,
    "prizePool": 1.0,
    "entryFee": "0.1",
    "minPlayers": 3,
    "maxPlayers": 10
  }'
```

---

## Frontend Changes Summary

The frontend now:
1. ✅ Sends `gameMode`, `hasPrizes`, `prizePool`, and `minPlayers` when creating game sessions
2. ✅ Displays prize configuration UI for Hangouts mode
3. ✅ Validates prize settings before submission
4. ✅ Shows minimum player requirements based on prize settings
5. ✅ Maintains backwards compatibility with old API format

---

## Next Steps

1. Update database schema
2. Modify `POST /games/create-session` endpoint
3. Add validation to `POST /games/start/:id`
4. Update Socket.IO event handlers
5. Implement prize distribution logic
6. Integrate escrow smart contract
7. Add error handling
8. Write tests
9. Run migration script on existing data

---

## Questions for Backend Team

1. Which blockchain network for escrow contracts? (Ethereum, Polygon, Base?)
2. Should entry fees be collected automatically or manually?
3. Max prize pool limit?
4. Timeout for prize claims?
5. What happens to unclaimed prizes?

---

**Frontend Contact:** Development Team
**Related Files:**
- `interfaces/IGame.ts` - TypeScript interfaces
- `enums/game_mode.ts` - Game mode enum
- `services/quiz_service.ts` - API service
- `components/custom/generate_quiz.tsx` - UI implementation
- `components/custom/create_quiz.tsx` - UI implementation
