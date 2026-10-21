import { GoogleGenAI } from "@google/genai";

let cachedAi: GoogleGenAI | null = null;

export function getAiClient(): GoogleGenAI {
  if (!cachedAi) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    cachedAi = new GoogleGenAI({ apiKey });
  }
  return cachedAi;
}
