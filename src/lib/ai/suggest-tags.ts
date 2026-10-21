import { Type } from "@google/genai";
import { getAiClient } from "./client";
import {
  BOARD_TAGS,
  TASK_TAGS,
  type BoardTag,
  type TaskTag,
} from "@/lib/constants";

export async function suggestTaskTags(input: {
  title: string;
  description?: string;
}): Promise<TaskTag[]> {
  const ai = getAiClient();

  const prompt = [
    `Task Title: ${input.title.trim()}`,
    input.description?.trim()
      ? `Task Description: ${input.description.trim()}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const response = await ai.models.generateContent({
    model: "gemini-flash-lite-latest",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tags: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
              enum: [...TASK_TAGS],
            },
            description: "1 to 3 relevant tags categorizing this task.",
          },
        },
        required: ["tags"],
      },
      systemInstruction:
        "You are an assistant for a Kanban productivity app. Analyze the task title and optional description, then pick 1 to 3 appropriate tags from the allowed list: " +
        TASK_TAGS.join(", ") +
        ". Only return tags that directly match the nature of the task. If none of the tags clearly match, return an empty list.",
    },
  });

  const text = response.text;
  if (!text) return [];

  let parsed: { tags?: string[] };
  try {
    parsed = JSON.parse(text) as { tags?: string[] };
  } catch {
    return [];
  }
  if (!Array.isArray(parsed.tags)) return [];

  return parsed.tags.filter((t): t is TaskTag =>
    (TASK_TAGS as readonly string[]).includes(t),
  );
}

export async function suggestBoardTags(input: {
  title: string;
  description?: string;
  template?: string;
}): Promise<BoardTag[]> {
  const ai = getAiClient();

  const prompt = [
    `Board Name: ${input.title.trim()}`,
    input.description?.trim()
      ? `Board Description: ${input.description.trim()}`
      : "",
    input.template?.trim() ? `Board Template: ${input.template.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const response = await ai.models.generateContent({
    model: "gemini-flash-lite-latest",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tags: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
              enum: [...BOARD_TAGS],
            },
            description: "1 to 3 relevant tags categorizing this board.",
          },
        },
        required: ["tags"],
      },
      systemInstruction:
        "You are an assistant for a Kanban productivity app. Analyze the board name, optional description, and optional template, then pick 1 to 3 appropriate tags from the allowed list: " +
        BOARD_TAGS.join(", ") +
        ". Only return tags that directly match the nature of the board. If none of the tags clearly match, return an empty list.",
    },
  });

  const text = response.text;
  if (!text) return [];

  let parsed: { tags?: string[] };
  try {
    parsed = JSON.parse(text) as { tags?: string[] };
  } catch {
    return [];
  }
  if (!Array.isArray(parsed.tags)) return [];

  return Array.from(new Set(parsed.tags)).filter((t): t is BoardTag =>
    (BOARD_TAGS as readonly string[]).includes(t),
  );
}
