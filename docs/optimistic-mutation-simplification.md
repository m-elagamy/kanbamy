# Simplify Optimistic Mutations

## Status

Planned. Do not start this work until the dashboard reload-performance investigation is concluded.

## Goal

Remove optimistic UI updates from ordinary board, task, and column CRUD flows.
The UI should wait for the Server Action to succeed, then commit the returned
canonical data to the client stores. This preserves immediate visual freshness
without needing a route refresh after every mutation.

Drag-and-drop and column reordering are explicitly out of scope. They must keep
their immediate client-side movement and operation-specific rollback behavior.

## Why

The app now has materially better server latency, data-cache invalidation, and
navigation behavior. For normal CRUD, the extra optimistic-operation snapshots
and rollback branches add more complexity than they return:

- overlapping-operation bookkeeping;
- temporary IDs and ID replacement;
- restoring UI state after failed writes;
- closing dialogs before the write is confirmed.

Server-first CRUD is simpler: show pending state, await the mutation, apply the
confirmed result locally, and keep the form/dialog open if the mutation fails.

## Current classification

### True optimistic flows to replace

| Flow | Current location | Intended behavior |
| --- | --- | --- |
| Task edit | `src/hooks/use-task-update-action.ts` | Await `updateTaskAction`; update the store and close only on success. |
| Column status update | `src/app/dashboard/components/column/column-actions.tsx` | Await `updateColumnAction`; commit the returned status only on success. |
| Quick-add task | `src/app/dashboard/components/task/quick-add-task.tsx` | Await creation; insert the returned task only on success. |
| Board edit | `src/hooks/use-board-form-action.ts` | Await the action; update board state only from the successful response. |

### Already server-first; simplify, do not regress

These flows call the Server Action first and update the local store only after
success. Keep that UX, but remove snapshot/operation bookkeeping that is created
and cleared immediately.

| Flow | Current location |
| --- | --- |
| Task creation from the task modal | `src/hooks/use-task-create-action.ts` |
| Task deletion | `src/app/dashboard/components/task/task-actions.tsx` |
| Task move from the actions menu | `src/app/dashboard/components/task/task-actions.tsx` |
| Column creation | `src/app/dashboard/components/column/column-form.tsx` |
| Column deletion | `src/app/dashboard/components/column/column-actions.tsx` |

## Architecture after the change

### Ordinary CRUD

1. Validate client input.
2. Set the existing per-entity loading state.
3. Call the Server Action.
4. On success, commit the returned canonical fields into the Zustand store.
5. Close the dialog or form only after that commit.
6. On failure, show the error and leave the current UI state intact.

The server remains the source of truth. `updateTag` invalidation in Server
Actions remains unchanged so reloads and later navigations see fresh data.

### DnD and reorder

Keep `operationId`, optimistic snapshots, and rollback only where the UI must
move an item before a network response:

- `src/hooks/use-dnd-handlers.ts`
- `src/hooks/use-column-dnd-handlers.ts`
- the DnD-specific reducers in `src/stores/task.ts` and `src/stores/column.ts`

## Implementation sequence

1. Add plain confirmed-state reducers where needed, with no snapshot creation.
2. Convert the four true optimistic flows one at a time.
3. Replace post-success calls that create then immediately clear an operation
   with the confirmed-state reducers.
4. Narrow `optimisticOperations` types and store code to DnD/reorder-only uses.
5. Remove dead `operationId`, rollback, and clear-operation plumbing from
   ordinary CRUD components and hooks.
6. Do not add `router.refresh()` as a substitute for local confirmed commits.

## Regression checklist

Run this manually after implementation, on desktop and one mobile viewport:

- Create, edit, and delete a task; verify success state, error state, and a
  hard reload afterward.
- Quick-add a task; verify no temporary/duplicate task or stale ordering.
- Create, rename/status-update, and delete a column; verify its tasks and a
  hard reload afterward.
- Create, rename, and delete a board; verify dashboard grid, sidebar, and board
  search reflect the mutation.
- Move a task from the actions menu; verify ordering and server-confirmed state.
- Drag tasks across and within columns; force or simulate a failing action and
  verify rollback still works.
- Reorder columns; verify rollback still works on failure.
- Check that dashboard counts and board search stay fresh after mutations.

## Required verification

Before merging:

```powershell
pnpm exec eslint src/stores/task.ts src/stores/column.ts src/hooks/use-task-update-action.ts src/hooks/use-task-create-action.ts src/hooks/use-board-form-action.ts src/app/dashboard/components/task src/app/dashboard/components/column
pnpm type-check
git diff --check
```

Static checks do not validate drag feel, rollback, or visual flicker. The manual
checklist is required, especially for DnD.
