import "server-only";

import { updateTag } from "next/cache";
import {
  userBoardIdTag,
  userBoardsTag,
  userOnboardingTag,
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
