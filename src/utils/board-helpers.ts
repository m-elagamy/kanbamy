import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import columnsTemplates from "@/app/dashboard/data/columns-templates";
import type { Templates } from "@/lib/types";
import { slugify } from "./slugify";

export const handleOnBlur = (router: AppRouterInstance, value: string) => {
  const slug = slugify(value);
  if (slug.length >= 3) {
    router.prefetch(`/dashboard/${slug}`);
  }
};

export const constructColumns = (templateId: Templates) => {
  if (templateId === "custom") return [];

  const template = columnsTemplates.find((t) => t.id === templateId);

  return (
    template?.status.map((status, index) => ({
      id: `temp-${index}`,
      status,
      boardId: "temp-board-id",
      tasks: [],
      order: index,
    })) || []
  );
};
