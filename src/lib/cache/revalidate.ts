import "server-only";

import { revalidateTag, updateTag } from "next/cache";
import {
  userBoardIdTag,
  userBoardsTag,
  userOnboardingTag,
  userRecentBoardsTag,
} from "./tags";

export function revalidateUserBoards(ownerId: string) {
  updateTag(userBoardsTag(ownerId));
}

export function revalidateUserOnboarding(ownerId: string) {
  updateTag(userOnboardingTag(ownerId));
}

export function revalidateUserBoard(ownerId: string, boardId: string) {
  updateTag(userBoardIdTag(ownerId, boardId));
}

export function revalidateRecentBoards(userId: string) {
  revalidateTag(userRecentBoardsTag(userId), "max");
}
