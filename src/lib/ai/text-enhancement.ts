import { Type } from "@google/genai";
import { getAiClient } from "./client";

export interface TextEnhancementOptions {
  prompt: string;
  systemInstruction: string;
  maxLength: number;
  label: string;
}

export async function executeTextEnhancement({
  prompt,
  systemInstruction,
  maxLength,
  label,
}: TextEnhancementOptions): Promise<string> {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: "gemini-flash-lite-latest",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          result: {
            type: Type.STRING,
            description: `The improved ${label}.`,
          },
        },
        required: ["result"],
      },
      systemInstruction,
    },
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error("AI returned an empty response.");
  }

  let result = "";
  try {
    const parsed = JSON.parse(text) as { result?: string };
    result = parsed.result ?? text;
  } catch {
    result = text;
  }

  result = result.replace(/^["']|["']$/g, "").trim();

  if (!result) {
    throw new Error(`AI returned empty text for ${label}.`);
  }

  return result.length > maxLength ? result.slice(0, maxLength).trim() : result;
}

