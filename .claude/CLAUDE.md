# Kanbamy — Claude Rules

## Commands
- `pnpm dev` — start dev server
- `pnpm build` — production build (runs `prisma generate && prisma migrate deploy && next build`)
- `pnpm lint` — ESLint
- `pnpm type-check` — type check (runs `next typegen` first)
- `pnpm postinstall` — runs `prisma generate`

## Tech Stack
Next.js 16 (App Router), React 19, TypeScript, Prisma 7 (pg adapter), Clerk, Zustand + Immer, dnd-kit, Zod 4, Tailwind CSS v4, Shadcn UI, Sonner.

## Project Structure
```
src/
  actions/      # Server Actions ("use server") — one file per domain
  app/          # Next.js App Router pages
    (auth)/     # Clerk sign-in/sign-up routes
    dashboard/
      [board]/  # Dynamic board page
      components/ # Board/column/task UI
      data/     # Static constants (templates, priorities)
      utils/    # Form and data processing helpers
    welcome/
  components/
    ui/         # shadcn/ui components (do not modify)
    layout/     # Header, sidebar, footer
    landing/    # Marketing page components
  hooks/        # Custom React hooks (client-side only)
  lib/
    db/         # Prisma singleton (server-only)
    dal/        # Data Access Layer — all DB queries live here
    auth/       # Authentication, wrappers, and workspace access (server-only)
    cache/      # Cache tags and revalidation helpers (server-only)
    server/     # Prisma error handler and server timing (server-only)
    types/      # Shared types: ServerActionResult, FormErrors, store types
    constants.ts
  providers/    # React context providers (dnd, theme)
  schemas/      # Zod schemas — one file per domain
  stores/       # Zustand stores — one file per domain
  utils/        # Pure client-safe utility functions
    forms/      # Reusable form validation and state helpers
```

## Code Style
- Functional components, named exports
- `kebab-case` for files and directories
- `isLoading`, `hasError` for booleans; `handle` prefix for event handlers
- Prefer `interface` over `type`; no enums — use `const` maps
- Use `satisfies` for type validation
- Early returns over nested conditionals

## TypeScript
- Strict mode always on
- Never use Prisma model types directly on the client — map to plain objects
- Shared result type: `ServerActionResult<T>` from `src/lib/types/index.ts`
- Form error type: `FormErrors<T>` from the same file

## Server Actions (`src/actions/`)
- Always add `"use server"` at top
- Validate input with Zod schema from `src/schemas/` before anything else
- Verify workspace authorization with `requireWorkspaceAccess` from `src/lib/auth/workspace-access.ts`
- Call DAL functions — never call `db` directly from actions
- Return `ServerActionResult<T>` (from `src/lib/types/`)
- Invalidate cache with `revalidateTag()` / `updateTag()` after mutations
- Never expose internal errors to the client — map to user-friendly messages

## Data Access Layer (`src/lib/dal/`)
- All DB queries live here — never query Prisma outside of `dal/`
- Import `db` from `src/lib/db/` (server-only singleton)
- Add `import "server-only"` to all DAL modules
- Wrap functions with auth wrappers from `src/lib/auth/wrappers.ts`:
  - `withUserId`: auto-injects Clerk `userId`, use for user-scoped queries
  - `withOwnerId`: accepts workspace `ownerId` (authenticated user or demo session)
  - `ensureAuthenticated`: verifies authentication without injecting `userId`

## Database / Prisma
- Prisma singleton: `src/lib/db/index.ts` — import `db` from here
- Add `import "server-only"` to any file that imports `db`
- Never import `PrismaClient` directly — always use the singleton
- Handle Prisma errors with `src/lib/server/prisma-error-handler.ts`
- Models: `User`, `Board` (has `slug`), `Column`, `Task`; `Priority` enum (low/medium/high)

## Authentication & Authorization
- Import from `@clerk/nextjs/server` in server code
- Get userId: `const { userId } = await auth()`
- Unauthorized redirect: `unauthorized()` from `next/navigation`
- Workspace access: `requireWorkspaceAccess` in `src/lib/auth/workspace-access.ts` resolves workspace ownership and enforces demo user policy
- Demo users are restricted from creating, updating, or deleting boards, while allowing column and task interactions

## State Management
- **Zustand** (`src/stores/`) for client UI state — use Immer middleware for updates
- **Server state** comes from Server Components via DAL, initialized into Zustand in `use-initialize-board.ts`
- **URL state** uses Next.js searchParams
- Prevent unnecessary re-renders: compare with `fast-deep-equal` before updating store
- Stores track `previousState` / optimistic operations for rollbacks
- Store types live in `src/lib/types/stores/`

## Zustand Store Conventions
- One store per domain (`board`, `column`, `task`, `loading`)
- Export hooks: `useBoardStore`, `useColumnStore`, `useTaskStore`, `useLoadingStore`
- Always type state and actions with interfaces from `src/lib/types/stores/`

## Zod Schemas (`src/schemas/`)
- One file per domain, matching actions and DAL domains
- Reuse schemas in both server actions (validation) and client forms

## Component Conventions
- Server Components by default — only add `"use client"` when needed
- Use Suspense boundaries for async Server Components
- Toasts: use `sonner` (`toast.success`, `toast.error`) in client event handlers only
- Drag-and-drop: use `dnd-kit` with `src/providers/dnd-provider.tsx`
- Animations: use `motion` (Framer Motion)

## Plans
- Make plans extremely concise — sacrifice grammar for brevity
- End every plan with a list of unresolved questions, if any

