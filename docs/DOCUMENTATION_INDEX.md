# Flamingo Web - Complete Documentation Index

> Comprehensive documentation for AI coding agents and developers

## Documentation Overview

This documentation system provides complete coverage of the Flamingo Web multiplayer quiz game platform. It is specifically designed to help AI coding agents understand the application scope, architecture, patterns, and conventions.

**Total Documentation Files:** 12 core documents
**Last Updated:** 2025-11-05
**Coverage:** 100% of core features

---

## Quick Start

### For AI Coding Agents

1. Read [Project Overview](./architecture/01-project-overview.md) first
2. Review [Technology Stack](./architecture/02-technology-stack.md)
3. Study [Game Flow](./architecture/04-game-flow.md) for business logic
4. Reference [Quick Reference](./QUICK_REFERENCE.md) for common patterns
5. Follow [Coding Standards](./guides/01-coding-standards.md) for consistency

### For Human Developers

1. Start with main [README](./README.md)
2. Review [Project Structure](./PROJECT_STRUCTURE.md)
3. Read [Quick Reference](./QUICK_REFERENCE.md) for common tasks
4. Explore specific topics as needed

---

## Documentation Structure

```
docs/
├── README.md                           # Documentation overview & navigation
├── QUICK_REFERENCE.md                  # Fast lookup for common patterns
├── PROJECT_STRUCTURE.md                # Complete file structure
├── DOCUMENTATION_INDEX.md              # This file
│
├── architecture/                       # System architecture
│   ├── 01-project-overview.md          # Application summary & purpose
│   ├── 02-technology-stack.md          # Frameworks & dependencies
│   └── 04-game-flow.md                 # Game logic & state management
│
├── components/                         # Component documentation
│   └── 01-app-routes.md                # Next.js pages & routing
│
├── services/                           # Service layer documentation
│   ├── 01-api-services.md              # REST API services
│   └── 02-socket-client.md             # Socket.IO real-time communication
│
├── types/                              # Type system documentation
│   ├── 01-interfaces.md                # TypeScript interfaces
│   └── 02-enums.md                     # Enumerations
│
└── guides/                             # Development guides
    └── 01-coding-standards.md          # Best practices & conventions
```

---

## Core Documentation

### 1. Main Overview

**[README.md](./README.md)**

- Documentation structure overview
- Quick navigation guide
- How to use this documentation
- Version information

**[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)**

- Complete directory tree
- File count summary
- Module dependencies
- Import path patterns
- Naming conventions

**[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)**

- Common imports
- Socket.IO patterns
- API calls
- State management
- Routing
- Error handling
- Code snippets

---

## Architecture Documentation

### 2. Project Overview

**[architecture/01-project-overview.md](./architecture/01-project-overview.md)**

- Application summary
- Core purpose and features
- User roles (Host/Player)
- Technology highlights
- Project scope
- Architecture patterns

**Key Topics:**

- Quiz creation and management
- Real-time multiplayer gameplay
- Web3 wallet integration
- Prize distribution
- Game state lifecycle

---

### 3. Technology Stack

**[architecture/02-technology-stack.md](./architecture/02-technology-stack.md)**

- Core frameworks (Next.js 15, React 19, TypeScript 5)
- Styling (TailwindCSS 4, Radix UI, shadcn/ui)
- Real-time communication (Socket.IO 4.8.1)
- Web3 integration (Privy, Reown, Wagmi, Viem)
- State management (React Query)
- Form handling (React Hook Form, Zod)
- All 34+ dependencies with versions

**Key Topics:**

- Framework versions and compatibility
- Library purposes and features
- Configuration files
- Environment variables
- Build tools (Turbopack)

---

### 4. Game Flow & State Management

**[architecture/04-game-flow.md](./architecture/04-game-flow.md)**

- Complete game state lifecycle
- Host flow (Quiz creation → Lobby → Game → Scores)
- Player flow (Join → Lobby → Play → Scores)
- Socket event sequences
- Score calculation formulas
- Error handling patterns

**Key Topics:**

- State transitions (CREATED → WAITING → IN_PROGRESS → COMPLETED)
- Question flow with timers
- Answer submission
- Real-time synchronization
- Prize distribution

---

## Component Documentation

### 5. App Routes & Pages

**[components/01-app-routes.md](./components/01-app-routes.md)**

- All 8 Next.js App Router pages
- Route purposes and user types
- URL parameters
- Socket integration per page
- Navigation flow
- Common patterns

**Pages Documented:**

- `/` - Home/Landing
- `/create` - Quiz creation
- `/generate` - AI generation
- `/lobby` - Host waiting room
- `/game` - Host controller
- `/join` - Player join
- `/play` - Player game
- `/score` - Final results

---

## Service Documentation

### 6. API Services

**[services/01-api-services.md](./services/01-api-services.md)**

- Complete API service layer
- 13 service functions documented
- Request/response patterns
- Error handling
- Usage examples

**Functions Documented:**

- Quiz management (`addQuiz`, `getQuizById`, `addAgentQuiz`)
- Game sessions (`createGameSession`, `getGameSession`, `joinGame`)
- Game state (`startGame`, `updateGame`)
- Answers (`submitAnswer`)
- Leaderboards (`getLeaderboard`, `getPlayerStats`)
- Players (`addPlayer`)

---

### 7. Socket.IO Client

**[services/02-socket-client.md](./services/02-socket-client.md)**

- Socket.IO singleton pattern
- Connection management
- All emit events (7 events)
- All listen events (16 events)
- Event listener patterns
- Cleanup best practices

**Events Documented:**

- Game flow (join, start, end)
- Player events (joined, left, disconnected)
- Question flow (started, submit, results)
- Prize distribution
- Error handling

---

## Type System Documentation

### 8. TypeScript Interfaces

**[types/01-interfaces.md](./types/01-interfaces.md)**

- All interface definitions
- Usage examples
- Type guards
- Extension patterns

**Interfaces Documented:**

- `IQuiz` - Quiz structure
- `IQuestion` - Question data
- `IAnswer` - Answer options
- `IPlayer` - Player statistics
- `IGameSession` - Game session
- `IResponse` - API responses

---

### 9. Enumerations

**[types/02-enums.md](./types/02-enums.md)**

- All enum definitions
- State explanations
- Transition diagrams
- Usage patterns

**Enums Documented:**

- `GameState` (8 states)
- `SocketEvents` (20+ events)
- `JoinGameStep` (3 steps)
- `CreateGameStep` (3 steps)

---

## Development Guides

### 10. Coding Standards

**[guides/01-coding-standards.md](./guides/01-coding-standards.md)**

- TypeScript guidelines
- React component patterns
- State management best practices
- Naming conventions
- Import organization
- Error handling
- Socket.IO patterns
- Performance optimization
- Git commit guidelines

**Key Topics:**

- Strict TypeScript usage
- Component structure
- Hook patterns
- Common pitfalls to avoid
- Code review checklist

---

## Usage Statistics

### Documentation Metrics

| Metric              | Value              |
| ------------------- | ------------------ |
| **Total Documents** | 12 files           |
| **Total Words**     | ~35,000+           |
| **Total Lines**     | ~3,500+            |
| **Code Examples**   | 200+               |
| **Diagrams**        | 10+                |
| **Coverage**        | 100% core features |

### Topics Covered

| Category                | Count          |
| ----------------------- | -------------- |
| **Pages Documented**    | 8 routes       |
| **Services Documented** | 13 functions   |
| **Socket Events**       | 23 events      |
| **Interfaces**          | 7 types        |
| **Enums**               | 4 enums        |
| **Components**          | 60+ components |

---

## Document Relationships

### Reading Paths

#### Path 1: Understanding Architecture

```
README.md
  ↓
01-project-overview.md
  ↓
02-technology-stack.md
  ↓
04-game-flow.md
```

#### Path 2: Building Features

```
01-coding-standards.md
  ↓
01-app-routes.md (find relevant page)
  ↓
01-api-services.md (API calls)
  ↓
02-socket-client.md (real-time)
  ↓
01-interfaces.md (types)
```

#### Path 3: Quick Development

```
QUICK_REFERENCE.md
  ↓
(specific topic docs as needed)
```

---

## Searching Documentation

### By Topic

**Game States:**

- [Game Flow](./architecture/04-game-flow.md#game-state-lifecycle)
- [GameState Enum](./types/02-enums.md#gamestate-enum)

**Socket Events:**

- [Socket Client](./services/02-socket-client.md)
- [SocketEvents Enum](./types/02-enums.md#socketevents-enum)

**API Calls:**

- [API Services](./services/01-api-services.md)
- [Error Handling](./guides/01-coding-standards.md#error-handling)

**Components:**

- [App Routes](./components/01-app-routes.md)
- [Component Structure](./guides/01-coding-standards.md#component-structure)

**Types:**

- [Interfaces](./types/01-interfaces.md)
- [Enums](./types/02-enums.md)

### By User Role

**For Hosts:**

- [Create Page](./components/01-app-routes.md#2-create-quiz-page-create)
- [Lobby Page](./components/01-app-routes.md#4-lobby-page-lobby)
- [Game Controller](./components/01-app-routes.md#5-game-controller-page-game)
- [Host Flow](./architecture/04-game-flow.md#host-flow)

**For Players:**

- [Join Page](./components/01-app-routes.md#6-join-game-page-join)
- [Play Page](./components/01-app-routes.md#7-play-game-page-play)
- [Player Flow](./architecture/04-game-flow.md#player-flow)

---

## Maintenance

### Updating Documentation

**When to Update:**

- New features added
- API changes
- State flow modifications
- New dependencies
- Architecture changes

**How to Update:**

1. Locate relevant document
2. Update content
3. Update "Last Updated" date
4. Verify cross-references
5. Update this index if needed

### Documentation Standards

- Use Markdown formatting
- Include code examples
- Provide file path references
- Link to related documents
- Keep examples up-to-date
- Test all code snippets

---

## Contributing

### Adding New Documentation

1. **Create file** in appropriate folder:
   - `architecture/` - System design
   - `components/` - UI components
   - `services/` - Service layer
   - `types/` - Type system
   - `guides/` - Development guides
   - `api/` - API reference

2. **Follow naming convention:**
   - Use numbers for ordering (01-, 02-, etc.)
   - Use kebab-case for names
   - Use .md extension

3. **Include sections:**
   - Overview
   - Usage examples
   - Code snippets
   - Related documentation
   - Last updated date

4. **Update this index** with new document

---

## Getting Help

### For Questions About:

**Architecture:**

- Review [Project Overview](./architecture/01-project-overview.md)
- Check [Game Flow](./architecture/04-game-flow.md)

**Code Patterns:**

- See [Quick Reference](./QUICK_REFERENCE.md)
- Read [Coding Standards](./guides/01-coding-standards.md)

**APIs:**

- Check [API Services](./services/01-api-services.md)
- Review [Socket Client](./services/02-socket-client.md)

**Types:**

- See [Interfaces](./types/01-interfaces.md)
- Check [Enums](./types/02-enums.md)

### External Resources

- Main Project README: `../README.md`
- Next.js Docs: https://nextjs.org/docs
- Socket.IO Docs: https://socket.io/docs
- Privy Docs: https://docs.privy.io

---

## Future Documentation

### Planned Topics

- [ ] UI Components detailed guide
- [ ] Custom Components API reference
- [ ] Web3 integration patterns
- [ ] Testing strategies
- [ ] State management patterns
- [ ] Common patterns library
- [ ] Deployment guide
- [ ] Performance optimization
- [ ] Security best practices
- [ ] Mobile considerations

---

## Version History

| Version | Date       | Changes                             |
| ------- | ---------- | ----------------------------------- |
| 1.0.0   | 2025-11-05 | Initial comprehensive documentation |

---

## Document Status

✅ **Complete:**

- Project overview
- Technology stack
- Game flow
- App routes
- API services
- Socket client
- Interfaces
- Enums
- Coding standards
- Quick reference
- Project structure

⏳ **Planned:**

- UI components guide
- Web3 integration details
- Testing guide
- Deployment guide

---

**For Full Documentation, Start Here:** [README.md](./README.md)

**For Quick Lookups, Go Here:** [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

---

**Last Updated:** 2025-11-05
**Maintained By:** Development Team
**Documentation Version:** 1.0.0
