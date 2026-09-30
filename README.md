# Kanbamy

Personal Kanban for turning open work into a clear, manageable flow.

[Open Kanbamy](https://kanbamy.com/)

Kanbamy is a personal task management application built around boards, columns, and focused execution. It keeps the everyday workflow compact: create a board, move work through its stages, and quickly find the tasks that need attention.

A temporary demo workspace lets you explore the product without creating an account.

## Key features

- Boards with customizable columns and reusable workflow templates
- Tasks with descriptions and priority levels
- Drag-and-drop task and column reordering, including keyboard interaction
- Board and workspace task search with pagination
- Needs attention, stale, and high-priority task views
- Clerk authentication and private, user-scoped workspaces
- Temporary demo workspace for exploring the application

## Tech stack

- Next.js 16 App Router, React 19, and TypeScript
- Tailwind CSS v4, Radix UI primitives, and shadcn/ui-style components
- Prisma 7 with PostgreSQL
- Clerk authentication
- Zustand, Immer, and dnd-kit
- Zod, Motion, and Vercel Analytics / Speed Insights

## Engineering highlights

- Server-rendered dashboard and task pages with protected routes
- Server Actions validate mutations before delegating to an ownership-scoped data access layer
- Task and column reordering uses optimistic client state with rollback when persistence fails
- Cache tags are invalidated at the user and board level after relevant mutations
- Drag-and-drop includes keyboard sensors and task-specific screen-reader announcements

## Local development

```bash
git clone https://github.com/m-elagamy/kanbamy.git
cd kanbamy
pnpm install
```

Copy `.env.example` to `.env.local` and provide a PostgreSQL connection string plus the required Clerk keys. Then run the database migrations and start the development server:

```bash
pnpm db:migrate
pnpm dev
```

Useful checks:

```bash
pnpm lint
pnpm type-check
pnpm build
```

## License

MIT