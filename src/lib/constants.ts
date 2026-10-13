export const SITE_URL = "https://kanbamy.com";

export const BOARDS_LIST_LIMIT = 12;

export const DASHBOARD_BOARDS_LIMIT = 6;

export const BOARDS_PAGE_SIZE = 12;

export const TASKS_PAGE_SIZE = 20;

export const DASHBOARD_FOCUS_PREVIEW_SIZE = 3;

export const STALE_TASK_DAYS = 2;

export const TERMINAL_COLUMN_STATUSES = ["Done", "Deployed", "Cancelled"];

export const BOARD_TEMPLATE_STATUSES = {
  personal: ["To Do", "Today", "In Progress", "Done"],
  agile: ["Backlog", "In Progress", "Under Review", "Done"],
  "bug-tracking": ["Reported", "Testing", "Under Review", "Done"],
  custom: [],
} as const satisfies Record<string, readonly string[]>;

export const RESERVED_BOARD_SLUGS = ["boards", "tasks"];

export const AUTH_ROUTES = {
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
} as const;

export const CTA_CONFIG = {
  PRIMARY: {
    href: AUTH_ROUTES.SIGN_UP,
    label: "Get Started",
    description: "Start organizing your tasks today",
  },
  SECONDARY: {
    href: AUTH_ROUTES.SIGN_IN,
    label: "Sign In",
    description: "Welcome back",
  },
  CTA_SECTION: {
    href: AUTH_ROUTES.SIGN_UP,
    label: "Start for free",
    description: "Experience the power of Kanbamy",
  },
} as const;

export const TASK_TAGS = [
  "bug",
  "feature",
  "enhancement",
  "design",
  "docs",
  "urgent",
  "refactor",
] as const;

export type TaskTag = (typeof TASK_TAGS)[number];

