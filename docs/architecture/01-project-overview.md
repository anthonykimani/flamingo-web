# Project Overview

## Application Summary

**Flamingo Web** is a real-time multiplayer quiz game platform similar to Kahoot, built with modern web technologies and Web3 integration. It enables hosts to create and run interactive quiz sessions while players join using a game PIN and compete in real-time.

## Project Metadata

| Property | Value |
|----------|-------|
| **Project Name** | Flamingo Web |
| **Repository Path** | `/home/priest/flamingo/flamingo-web` |
| **Version** | 0.1.0 |
| **Framework** | Next.js 15.3.3 |
| **Language** | TypeScript 5.x |
| **Runtime** | Node.js 18+ |
| **Current Branch** | `ft-escrow-events` |

## Core Purpose

Flamingo Web provides an interactive quiz gaming experience with these key capabilities:

1. **Quiz Creation**: Hosts can create custom quizzes or generate them using AI
2. **Real-Time Gameplay**: Socket.IO-powered real-time synchronization between host and players
3. **Multiplayer Support**: Multiple players can join the same game session using a PIN
4. **Web3 Integration**: Wallet-based authentication and escrow prize distribution
5. **Live Scoring**: Real-time leaderboards and player statistics
6. **Mobile-First Design**: Responsive UI that works on all devices

## User Roles

### Host (Quiz Master)
- Creates quizzes manually or via AI generation
- Starts and controls game sessions
- Monitors player participation in real-time
- Controls question timing and progression
- Views live leaderboards
- Manages prize distribution

### Player (Participant)
- Joins games using a 6-digit PIN
- Answers questions in real-time
- Sees immediate feedback on answers
- Tracks personal score and ranking
- Competes for prizes

## Key Features

### Game Management
- **Quiz Creation**: Multi-question quiz builder with multiple-choice answers
- **AI Generation**: Prompt-based quiz generation using AI agents
- **Game Sessions**: Create isolated game instances with unique PINs
- **Player Management**: Track players, scores, and statistics

### Real-Time Features
- **Live Updates**: Instant synchronization across all connected clients
- **Player Tracking**: See who joins, leaves, or disconnects
- **Answer Submission**: Real-time answer processing
- **Leaderboard Updates**: Live ranking updates after each question
- **State Synchronization**: Game state broadcast to all participants

### Web3 Integration
- **Wallet Authentication**: Privy embedded wallets + external wallet support
- **Escrow System**: Prize pools managed via smart contracts
- **Prize Distribution**: Automated payouts to winners
- **Transaction Tracking**: On-chain verification of prize distribution

### User Experience
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Visual Feedback**: Color-coded answer feedback (correct/incorrect)
- **Countdown Timers**: Visual timers for answering questions
- **Streaks**: Track consecutive correct answers
- **Animations**: Smooth transitions between game states

## Technology Highlights

### Frontend Stack
- **Next.js 15**: App Router with React Server Components
- **React 19**: Latest React features and improvements
- **TypeScript**: Full type safety with strict mode
- **TailwindCSS 4**: Utility-first CSS framework
- **Radix UI**: Accessible headless component primitives

### Real-Time Communication
- **Socket.IO 4.8.1**: WebSocket-based bidirectional communication
- **Event-Driven Architecture**: Pub/sub pattern for game events
- **Singleton Pattern**: Single socket connection per client

### Web3 Stack
- **Privy 3.5.0**: Embedded wallet management and authentication
- **Reown (AppKit)**: External wallet connection support
- **Wagmi 2.18.2**: React hooks for Ethereum interactions
- **Viem 2.38.4**: TypeScript-first Ethereum library

### Data Management
- **React Query 5.90.5**: Server state management and caching
- **React Hook Form 7.63.0**: Form state management
- **Zod 3.25.76**: Runtime type validation

## Application Scope

### In Scope
- Creating and managing quizzes
- Hosting game sessions
- Player participation and scoring
- Real-time multiplayer synchronization
- Web3 wallet integration
- Prize pool management
- Leaderboards and statistics

### Out of Scope (Current Version)
- Quiz marketplace or sharing
- User accounts and profiles (beyond wallet addresses)
- Quiz templates or categories
- Social features (chat, friend lists)
- Mobile native applications
- Recorded gameplay or replays

## Architecture Patterns

### Design Patterns Used
1. **Singleton Pattern**: Socket client instance
2. **Service Layer Pattern**: API abstraction via services
3. **Compound Component Pattern**: Complex UI components
4. **Provider Pattern**: Authentication and theme providers
5. **Custom Hook Pattern**: Reusable stateful logic

### Code Organization
- **Feature-Based Structure**: Components organized by functionality
- **Separation of Concerns**: Clear boundaries between UI, logic, and data
- **Type Safety**: TypeScript interfaces and enums throughout
- **Modular Services**: Independent service modules for API calls

## Development Philosophy

### Principles
1. **Type Safety First**: Leverage TypeScript for compile-time safety
2. **Component Reusability**: Build once, use everywhere
3. **Performance**: Optimize for fast load times and smooth interactions
4. **Accessibility**: Follow ARIA standards via Radix UI
5. **Mobile-First**: Design for mobile, enhance for desktop

### Best Practices
- Use Next.js App Router for optimal performance
- Implement proper error boundaries
- Handle loading and error states explicitly
- Use React Server Components where possible
- Minimize client-side JavaScript

## Project Goals

### Short-Term Goals
- Stable escrow prize distribution
- Enhanced mobile experience
- Improved AI quiz generation
- Better error handling
- Performance optimization

### Long-Term Vision
- Quiz marketplace
- Tournament mode
- Team-based gameplay
- Advanced analytics
- Cross-platform mobile apps

## File Location Reference

| Concern | Location |
|---------|----------|
| Pages | `/app/**/*.tsx` |
| UI Components | `/components/ui/*.tsx` |
| Game Components | `/components/custom/*.tsx` |
| API Services | `/services/*.ts` |
| Socket Client | `/utils/socket.client.ts` |
| Type Definitions | `/interfaces/*.ts`, `/types/*.ts` |
| Enums | `/enums/*.ts` |
| Custom Hooks | `/hooks/*.ts` |
| Utilities | `/lib/*.ts` |
| Configuration | `/*.config.ts` |

## Related Documentation

- [Technology Stack](./02-technology-stack.md) - Detailed dependency overview
- [Application Architecture](./03-application-architecture.md) - System design
- [Game Flow](./04-game-flow.md) - Game logic and state management

---

**Last Updated:** 2025-11-05
**Maintained By:** Development Team
