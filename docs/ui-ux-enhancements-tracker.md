# Kanbamy — UI/UX & Architecture Enhancements Tracker

A concise, single-source-of-truth document tracking all architectural refactors, UI/UX iterations, design system standards, and the roadmap for **Dashboard Overview**, **Demo Workspace**, **Tasks Page**, and **Board View**.

---

## 📑 Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [What Was Completed](#2-what-was-completed)
   - [Architecture & DX Refactoring](#a-architecture--dx-refactoring)
   - [Needs Attention Section Overhaul](#b-needs-attention-section-overhaul)
   - [Visual Hierarchy & Search Bar Cleanup](#c-visual-hierarchy--search-bar-cleanup)
   - [Design System & shadcn/ui Standardization](#d-design-system--shadcnui-standardization)
   - [Demo Workspace Integration & Synchronization](#e-demo-workspace-integration--synchronization)
3. [Design System Tokens & Sizing Matrix](#3-design-system-tokens--sizing-matrix)
4. [Prioritized Roadmap & Backlog](#4-prioritized-roadmap--backlog)
   - [Dashboard Overview](#a-dashboard-overview)
   - [Demo Workspace Experience](#b-demo-workspace-experience)
   - [Tasks Page (`/dashboard/tasks`)](#c-tasks-page-dashboardtasks)
   - [Interactive Board View (`/dashboard/[board]`)](#d-interactive-board-view-dashboardboard)

---

## 1. Executive Summary

This initiative started by resolving an architectural debt issue where the dashboard overview view and components were misleadingly bundled inside `src/components/workspace/board/boards-grid.tsx`. 

Through iterative senior-level product design reviews, we:
- Separated domain concerns into a dedicated `overview/` module.
- Tested and refined the visual rhythm (from heavy cards to minimal pills, ultimately landing on a clean, uncluttered layout).
- Harmonized all border radii, background surfaces, and spacing using standard `shadcn/ui` tokens.
- Synchronized authenticated (`/dashboard`) and guest demo (`/demo`) runtimes.

---

## 2. What Was Completed

### A. Architecture & DX Refactoring
- [x] **Created dedicated overview module:** Moved all overview-specific components out of `src/components/workspace/board/` into `src/components/workspace/overview/`.
- [x] **Corrected misleading component naming:** Replaced `BoardsGrid` (which incorrectly suggested just a card grid) with `WorkspaceOverview` as the clear top-level container.
- [x] **Component Decomposition:**
  - `workspace-overview.tsx`: Orchestrates the overview page layout.
  - `overview-header.tsx`: Greeting, workspace subtitle, live clock, and board creation trigger.
  - `overview-boards-grid.tsx`: Dedicated solely to rendering the recent boards section and grid.
  - `needs-attention-section.tsx`: Stale work and high-priority items preview.
  - `overview-clock.tsx` & `overview-clock-loader.tsx`: Client-side live clock with SSR-safe hydration.
  - `overview-empty-state.tsx`: Zero-boards onboarding illustration and CTA.
  - `overview-skeleton.tsx`: Pixel-perfect skeleton matching the real UI to eliminate layout shift.
- [x] **Cleaned legacy dead files:** Safely removed 8 misplaced files from `src/components/workspace/board/`.

### B. Needs Attention Section Overhaul
- [x] **Modern Card Anatomy:** Replaced the plain bordered list with individual interactive cards featuring priority badges (`PriorityIndicator`), task age in column (`In column Xd`), and board/column path.
- [x] **Micro-Interactions:** Added subtle hover lift (`hover:-translate-y-0.5`), surface glow (`top glow line`), and chevron nudge.
- [x] **Calm 11px Counter Badge:** Added a compact, dark-mode-friendly badge next to the title (`Needs attention [X]`) styled with `bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400`.
- [x] **Header Alignment for `View all`:** Moved the `View all` link from the bottom footer to the header alongside the section title, establishing 1:1 symmetry with the Boards section.

### C. Visual Hierarchy & Search Bar Cleanup
- [x] **Removed Cluttered Metric Pills:** Eliminated bulky stat boxes and pills under the search bar to remove cognitive overload and avoid pushing actual work below the fold.
- [x] **Pristine Standalone Search Bar:** Search bar now stands independently with standard `⌘K` / `Ctrl+K` command palette shortcut.
- [x] **Neutral Boards Counter Badge:** Added a calm gray badge (`[X]`) beside `Recent boards` (`bg-muted/50 border-border/60 text-muted-foreground`) matching the attention counter size.

### D. Design System & shadcn/ui Standardization
- [x] **Unified Surface Tokens:** Replaced raw `bg-background` with `bg-card` for task links and cards to ensure consistent dark-mode surface elevation.
- [x] **Search Bar Dimensions:** Tuned height from non-standard `h-11` (44px) to standard shadcn `h-10` (40px) with `rounded-xl` and `bg-card/60 border-border/80`.
- [x] **shadcn `<Button>` Integration:** Replaced raw HTML `<button>` in the header with official shadcn `<Button>` component (`rounded-lg shadow-xs`).
- [x] **Skeleton Synchronization:** Synchronized `overview-skeleton.tsx` to `h-10 rounded-xl` for search and matching badge headers.

### E. Demo Workspace Integration & Synchronization
- [x] **Demo Overview Updated:** Migrated `src/app/demo/(runtime)/overview/page.tsx` and its `loading.tsx` to use the unified `WorkspaceOverview` and `OverviewSkeleton`.
- [x] **Permission & Lock States Preserved:**
  - Board creation shows locked tooltip + `LockKeyhole` icon for guest demo sessions.
  - Tasks focus links route to `/demo?focus=${task.id}`.
  - Workspace search restricted to `workspaceTabs="boards"`.
  - Non-navigable task states show graceful account-creation prompts.

---

## 3. Design System Tokens & Sizing Matrix

| UI Element | Tailwind Tokens | Design Purpose |
| :--- | :--- | :--- |
| **Cards & Search Bar** | `rounded-xl` + `bg-card` + `border-border/80` + `shadow-sm` | Establishes a uniform outer curvature (16px) for all content surfaces. |
| **Search Bar Input** | `h-10` + `rounded-xl` + `bg-card/60` + `border-border/80` | Replaces awkward `h-11 rounded-md` with standard 40px height matching card corners. |
| **Buttons & Controls** | `rounded-lg` + `h-9` or `h-10` (`buttonVariants`) | Standard shadcn control radius (12px = `var(--radius)`). |
| **Section Count Badges**| `rounded-full` + `text-[11px]` + `h-5 min-w-5 px-1.5` | Delicately sized counter pill that does not compete with the `text-lg` heading. |
| **Status Badges** | `rounded-full` + `text-xs px-2 py-0.5 border` | Priority pills (`rose-500/10`) and stale pills (`amber-500/10`). |
| **Hover Animation** | `hover:-translate-y-0.5` + `via-primary/50 top glow line` | Consistent visual feedback across all interactive cards. |

---

## 4. Prioritized Roadmap & Backlog

### A. Dashboard Overview
1. **"Jump Back In" (Last Active Board Highlight):**
   - Provide a subtle visual highlight or a top "Resume where you left off" badge on the most recently visited board (`isLastActive`), enabling 1-click continuation.
2. **Time-Aware Dynamic Greeting:**
   - Enhance `overview-greeting.tsx` using the existing client clock to display contextual greetings (*"Good morning / Good afternoon / Good evening, [Name]"*) with situational micro-copy.
3. **Board Completion Progress Bar:**
   - Display a sleek progress bar on each `BoardCard` showing completed tasks ratio vs. total tasks.
4. **Starter Templates in Empty State:**
   - Leverage `src/components/workspace/data/columns-templates.ts` to offer 1-click starter boards (e.g. *Agile Sprint*, *Personal To-Do*, *Product Roadmap*) in `overview-empty-state.tsx`.

---

### B. Demo Workspace Experience
1. **Demo Tour & Feature Checklist:**
   - Add a lightweight, dismissible "Explore Kanbamy" checklist in `/demo` (e.g. *Drag a task*, *Add a column*, *Try ⌘K search*).
2. **"Save Your Work" Conversion CTA:**
   - A non-intrusive floating pill or header banner inviting demo users to sign up and persist their temporary demo board into a permanent account.
3. **Reset Demo State Action:**
   - A simple "Reset board to default" option in the demo board menu to let evaluators restart cleanly.
4. **Demo Feature Tooltips:**
   - Informative tooltips on locked buttons explaining what unlocked capabilities come with a full account.

---

### C. Tasks Page (`/dashboard/tasks`)
1. **Segmented Quick-Filter Chips:**
   - Convert the current attention dropdown into sleek inline tabs/chips with live counts: `All [24]`, `Open [15]`, `Needs Attention [3]`, `Stale [2]`.
2. **Inline Quick Actions:**
   - Allow changing task status, priority, or marking complete directly from the task list row without navigating away.
3. **Advanced Sorting Controls:**
   - Sort by: Most Recent, Longest in Column (Stale age), or Priority.
4. **Compact vs. Comfortable View Toggle:**
   - Provide a density switcher (Compact Table View vs. Card View) for power users managing high task volumes.

---

### D. Interactive Board View (`/dashboard/[board]`)
1. **Inline Quick Task Creation (Keyboard-First):**
   - Press `N` or click `+ Add task` at the bottom of a column for instant inline title entry + Enter, bypassing heavy modal dialogs for quick captures.
2. **Collapsible Columns:**
   - Allow collapsing completed/inactive columns (e.g. *Done* or *Archive*) into a vertical strip to maximize horizontal canvas space.
3. **WIP Limits (Work-In-Progress):**
   - Support setting a soft maximum task count per column (e.g., *In Progress: max 3*), showing a tasteful warning badge when exceeded.
4. **Board Header Quick Filters:**
   - 1-click filters in the board toolbar: *High Priority only*, *My tasks*, and filter-by-tag chips.
