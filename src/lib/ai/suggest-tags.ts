import { GoogleGenAI, Type } from "@google/genai";
import { TASK_TAGS, type TaskTag } from "@/lib/constants";

let cachedAi: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!cachedAi) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    cachedAi = new GoogleGenAI({ apiKey });
  }
  return cachedAi;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

  const config = {
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
  };

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents: prompt,
        config,
      });

      const text = response.text;
      if (!text) return [];

      const parsed = JSON.parse(text) as { tags?: string[] };
      if (!Array.isArray(parsed.tags)) return [];

      return parsed.tags.filter((t): t is TaskTag =>
        (TASK_TAGS as readonly string[]).includes(t),
      );
    } catch (error) {
      lastError = error;
      if (attempt === 0) {
        await sleep(1000);
      }
    }
  }

  throw lastError;
}
