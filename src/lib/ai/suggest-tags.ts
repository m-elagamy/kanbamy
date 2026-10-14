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
    model: "gemini-2.0-flash",
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

  const parsed = JSON.parse(text) as { tags?: string[] };
  if (!Array.isArray(parsed.tags)) return [];

  return parsed.tags.filter((t): t is TaskTag =>
    (TASK_TAGS as readonly string[]).includes(t),
  );
}
