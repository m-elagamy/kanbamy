"use client";

import { useState } from "react";

const BOARDS_GROUP_COOKIE_NAME = "sidebar_boards_open";
const BOARDS_GROUP_COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

export function useBoardsFolder(defaultOpen = true) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    window.cookieStore?.set({
      name: BOARDS_GROUP_COOKIE_NAME,
      value: String(nextOpen),
      path: "/",
      expires: Date.now() + BOARDS_GROUP_COOKIE_MAX_AGE_MS,
      sameSite: "lax",
    });
  };

  return { isOpen, toggle };
}
