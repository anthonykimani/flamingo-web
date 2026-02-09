# Technology Stack

## Core Framework

### Next.js 15.3.3

**Purpose:** React framework with App Router

**Key Features Used:**

- App Router for file-based routing
- Server Components for optimal performance
- API routes (future implementation)
- Image optimization
- Automatic code splitting

**Configuration:** [next.config.ts](../../next.config.ts)

---

### React 19.0.0

**Purpose:** UI library

**Features Used:**

- Functional components with hooks
- Context API via providers
- Server and Client Components
- Suspense boundaries

---

### TypeScript 5.x

**Purpose:** Type safety and developer experience

**Configuration:** [tsconfig.json](../../tsconfig.json)

**Settings:**

- Strict mode enabled
- ES2017 target
- Path aliases (`@/*`)
- JSX preserve mode

---

## Styling

### TailwindCSS 4.x

**Purpose:** Utility-first CSS framework

**Features:**

- Responsive design utilities
- Custom theme configuration
- JIT compilation
- PostCSS processing

**Configuration:** [tailwind.config.ts](../../tailwind.config.ts)

**Plugins:**

- `@tailwindcss/postcss` - PostCSS integration
- `tailwind-text-stroke` - Text stroke utilities

---

### Radix UI 1.x

**Purpose:** Headless accessible components

**Components Used:**

- Accordion, Alert Dialog, Avatar
- Button, Card, Carousel
- Checkbox, Collapsible, Command
- Context Menu, Dialog, Drawer
- Dropdown Menu, Form, Input
- Label, Menubar, Navigation Menu
- Popover, Progress, Radio Group
- Select, Separator, Sidebar
- Skeleton, Slider, Switch
- Tabs, Toast, Tooltip

**Benefits:**

- WAI-ARIA compliant
- Keyboard navigation
- Focus management
- Screen reader support

---

### shadcn/ui

**Purpose:** Pre-styled Radix UI components

**Installation:** Via CLI
**Configuration:** [components.json](../../components.json)

**Location:** `/components/ui/`

---

## Icons

### Phosphor Icons 2.1.10

**Purpose:** Primary icon library

**Usage:**

```typescript
import { UserIcon, SparkleIcon, LegoIcon } from '@phosphor-icons/react'
```

**Variants:**

- Regular, Thin, Light, Bold, Fill, Duotone

---

### Lucide React 0.511.0

**Purpose:** Secondary icon library

**Usage:**

```typescript
import { Check, ChevronDown, X } from 'lucide-react'
```

---

## Real-Time Communication

### Socket.IO Client 4.8.1

**Purpose:** WebSocket communication

**Configuration:**

```typescript
{
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
}
```

**Implementation:** [utils/socket.client.ts](../../utils/socket.client.ts)

---

## Web3 Integration

### Privy 3.5.0

**Purpose:** Embedded wallet and authentication

**Features:**

- Embedded wallet creation
- Social login integration
- Wallet management
- Session handling

**Configuration:**

```typescript
NEXT_PUBLIC_PRIVY_APP_ID
NEXT_PUBLIC_PRIVY_CLIENT_ID
```

**Provider:** [provider/index.tsx](../../provider/index.tsx)

---

### Reown AppKit 1.8.11

**Purpose:** External wallet connection (formerly WalletConnect)

**Features:**

- Multi-wallet support
- Chain switching
- Transaction signing
- Wallet modal UI

**Packages:**

- `@reown/appkit` - Core SDK
- `@reown/appkit-adapter-wagmi` - Wagmi integration

---

### Wagmi 2.18.2

**Purpose:** React hooks for Ethereum

**Features:**

- Account management
- Network switching
- Contract interactions
- Transaction handling

**Related:**

- `wagmi` - Core hooks
- `@wagmi/core` 2.22.1 - Core functionality
- `@wagmi/connectors` 6.2.2 - Wallet connectors

---

### Viem 2.38.4

**Purpose:** TypeScript Ethereum library

**Features:**

- Type-safe contract interactions
- ABI encoding/decoding
- Transaction building
- Chain utilities

---

## State Management

### TanStack React Query 5.90.5

**Purpose:** Server state management and caching

**Features:**

- Data fetching
- Cache management
- Background refetching
- Optimistic updates

**Usage:**

```typescript
import { useQuery, useMutation } from '@tanstack/react-query'
```

---

## Form Management

### React Hook Form 7.63.0

**Purpose:** Form state and validation

**Features:**

- Performant form handling
- Built-in validation
- Field arrays support
- Error management

---

### Zod 3.25.76

**Purpose:** Schema validation

**Features:**

- Runtime type checking
- Schema composition
- Error messages
- TypeScript integration

**Usage:**

```typescript
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
```

---

## HTTP Client

### Axios 1.12.2

**Purpose:** HTTP requests

**Features:**

- Request/response interceptors
- Automatic JSON transformation
- Error handling
- Timeout configuration

**Configuration:** [shared/http.config.ts](../../shared/http.config.ts)

---

## UI Utilities

### class-variance-authority 0.7.1

**Purpose:** Component variant system

**Usage:**

```typescript
import { cva } from 'class-variance-authority'

const buttonVariants = cva('button-base', {
  variants: {
    variant: {
      default: 'bg-primary',
      secondary: 'bg-secondary',
    },
  },
})
```

---

### clsx 2.1.1

**Purpose:** Conditional className utility

**Usage:**

```typescript
import clsx from 'clsx';

className={clsx(
  'base-class',
  isActive && 'active-class',
  isDisabled && 'disabled-class'
)}
```

---

### cmdk 1.1.1

**Purpose:** Command menu component

**Features:**

- Keyboard navigation
- Search/filter
- Command palette UI

---

## UI Components

### embla-carousel-react 8.6.0

**Purpose:** Carousel/slider component

**Features:**

- Touch/swipe support
- Responsive
- Customizable

---

### input-otp 1.4.2

**Purpose:** OTP input component

**Features:**

- Numeric input
- Auto-focus
- Paste support

---

### recharts 2.15.4

**Purpose:** Charting library

**Features:**

- Responsive charts
- Various chart types
- Animation support

---

### sonner 2.0.7

**Purpose:** Toast notifications

**Usage:**

```typescript
import { toast } from 'sonner'

toast.success('Success message')
toast.error('Error message')
```

---

### vaul 1.1.2

**Purpose:** Drawer component

**Features:**

- Bottom sheet drawer
- Swipe to dismiss
- Snap points

---

## Theme Management

### next-themes 0.4.6

**Purpose:** Dark mode and theme switching

**Features:**

- System preference detection
- Theme persistence
- No flash on load

**Usage:**

```typescript
import { useTheme } from 'next-themes'

const { theme, setTheme } = useTheme()
```

---

## Development Tools

### TailwindCSS PostCSS 4.x

**Purpose:** CSS processing

**Configuration:** [postcss.config.mjs](../../postcss.config.mjs)

---

### Turbopack

**Purpose:** Fast development builds

**Enabled in:** `package.json` dev script

```json
"dev": "next dev --turbopack"
```

---

## Environment Variables

### Required Variables

**API Configuration:**

```bash
NEXT_PUBLIC_GAMESERVICE_BASE_URL=http://localhost:3077
```

**Privy Authentication:**

```bash
NEXT_PUBLIC_PRIVY_APP_ID=your_app_id
NEXT_PUBLIC_PRIVY_CLIENT_ID=your_client_id
```

**Pimlico (Account Abstraction):**

```bash
NEXT_PUBLIC_PIMLICO_API_KEY=your_api_key
```

**Configuration File:** `.env.development`

---

## Package Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

## Version Compatibility

### Node.js

**Required:** 18.x or higher
**Recommended:** 20.x LTS

### npm/yarn/pnpm

**npm:** 9.x+
**yarn:** 1.22.x+
**pnpm:** 8.x+

---

## Browser Support

### Supported Browsers

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Browsers

- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 14+

---

## Build Configuration

### Next.js Config

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Minimal configuration - uses Next.js 15 defaults
}

export default nextConfig
```

### TypeScript Config

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## Dependency Management

### Production Dependencies: 34 packages

### Dev Dependencies: 3 packages

### Update Strategy

- Minor updates: Monthly
- Security patches: Immediately
- Major updates: After thorough testing

---

## Performance Considerations

### Bundle Size Optimization

- Next.js automatic code splitting
- Dynamic imports for heavy components
- Tree-shaking enabled
- Image optimization

### Runtime Performance

- React Server Components
- Suspense boundaries
- Lazy loading
- Memoization patterns

---

## Related Documentation

- [Project Overview](./01-project-overview.md)
- [Application Architecture](./03-application-architecture.md)
- [Coding Standards](../guides/01-coding-standards.md)

---

**Last Updated:** 2025-11-05
