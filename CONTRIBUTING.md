# Contributing

## Setup

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm dev
```

## Quality checks

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm build
```

## Guidelines

- Prefer small PRs with a clear purpose.
- Keep components small and reusable; avoid “page-sized” components when possible.
- Avoid committing secrets. Use `.env.local` for local configuration.
