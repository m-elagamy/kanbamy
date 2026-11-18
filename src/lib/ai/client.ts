import { GoogleGenAI } from "@google/genai";

export const GEMINI_MODEL = "gemini-flash-lite-latest";
const GEMINI_API_VERSION = "v1beta";

let cachedAi: GoogleGenAI | null = null;

export function getAiClient(): GoogleGenAI {
  if (!cachedAi) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    cachedAi = new GoogleGenAI({ apiKey, apiVersion: GEMINI_API_VERSION });
  }
  return cachedAi;
}
