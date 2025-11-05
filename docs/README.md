# Flamingo Web - Developer Documentation

> Comprehensive documentation for coding agents and developers working on the Flamingo Web multiplayer quiz game platform.

## Documentation Overview

This documentation provides a complete reference for understanding and working with the Flamingo Web codebase. It is structured to help developers and AI coding agents quickly understand the architecture, components, and patterns used throughout the application.

## Quick Navigation

### Core Documentation
- [Project Overview & Architecture](./architecture/01-project-overview.md) - High-level application overview
- [Technology Stack](./architecture/02-technology-stack.md) - Frameworks and libraries
- [Application Architecture](./architecture/03-application-architecture.md) - System design and patterns
- [Game Flow & State Management](./architecture/04-game-flow.md) - Game logic and state transitions

### Component References
- [App Routes & Pages](./components/01-app-routes.md) - Next.js pages and routing
- [UI Components](./components/02-ui-components.md) - Reusable UI components (shadcn/ui)
- [Custom Game Components](./components/03-custom-components.md) - Game-specific components

### Services & Integrations
- [API Services](./services/01-api-services.md) - Backend communication layer
- [Socket.IO Real-Time Communication](./services/02-socket-client.md) - WebSocket events and handlers
- [Web3 Integration](./services/03-web3-integration.md) - Wallet providers and blockchain

### Type System
- [Interfaces](./types/01-interfaces.md) - TypeScript interfaces
- [Enumerations](./types/02-enums.md) - Constants and enums
- [Type Definitions](./types/03-types.md) - Custom types

### Development Guides
- [Coding Standards](./guides/01-coding-standards.md) - Best practices and conventions
- [Component Development](./guides/02-component-development.md) - Creating new components
- [State Management Patterns](./guides/03-state-management.md) - Managing application state
- [Testing Guidelines](./guides/04-testing-guidelines.md) - Testing strategies
- [Common Patterns](./guides/05-common-patterns.md) - Frequently used patterns

### API Reference
- [Socket Events Reference](./api/01-socket-events.md) - Complete socket event documentation
- [API Endpoints](./api/02-api-endpoints.md) - REST API reference
- [Utility Functions](./api/03-utilities.md) - Helper functions and utilities

## Project Context

**Project Name:** Flamingo Web
**Type:** Real-time multiplayer quiz game platform
**Framework:** Next.js 15 (App Router)
**Language:** TypeScript (strict mode)
**Current Branch:** `ft-escrow-events`

### Key Features
- Real-time multiplayer quiz gameplay
- Host and Player modes
- Web3 wallet integration (Privy + Reown)
- Escrow-based prize distribution
- AI-powered quiz generation
- Live leaderboards and scoring

### Project Structure
```
flamingo-web/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── ui/                # shadcn/ui components (51 components)
│   ├── custom/            # Game-specific components (9 components)
│   └── navigation/        # Navigation components
├── services/              # API service layer
├── utils/                 # Utilities (Socket client)
├── interfaces/            # TypeScript interfaces
├── enums/                 # Enumerations
├── types/                 # Type definitions
├── hooks/                 # Custom React hooks
├── provider/              # Auth providers (Privy)
├── shared/                # Shared configs (API, HTTP)
├── lib/                   # Utility functions
├── public/                # Static assets
└── docs/                  # This documentation
```

## How to Use This Documentation

### For AI Coding Agents
1. Start with [Project Overview](./architecture/01-project-overview.md) to understand the application scope
2. Review [Application Architecture](./architecture/03-application-architecture.md) for system design patterns
3. Reference specific component docs when modifying features
4. Follow [Coding Standards](./guides/01-coding-standards.md) for consistency

### For Human Developers
1. Read the [Technology Stack](./architecture/02-technology-stack.md) to understand dependencies
2. Study [Game Flow](./architecture/04-game-flow.md) to understand business logic
3. Use component references as needed during development
4. Refer to API documentation for integration work

### For New Contributors
1. Complete setup from main README.md
2. Read all architecture documents sequentially
3. Review [Common Patterns](./guides/05-common-patterns.md)
4. Study existing components before creating new ones

## Documentation Maintenance

This documentation should be updated whenever:
- New components are added
- API contracts change
- Architecture patterns evolve
- New dependencies are introduced
- Game flow logic is modified

## Getting Help

- Main Project README: `../README.md`
- Issues: Check git history for recent changes
- Code Comments: Many files include inline documentation

## Version Information

**Documentation Version:** 1.0.0
**Last Updated:** 2025-11-05
**Application Version:** 0.1.0
**Next.js Version:** 15.3.3
**React Version:** 19.0.0

---

**Note to Coding Agents:** This documentation is specifically structured to provide comprehensive context for AI-assisted development. Each document includes detailed explanations, code examples, and usage patterns to ensure accurate code generation and modification.
