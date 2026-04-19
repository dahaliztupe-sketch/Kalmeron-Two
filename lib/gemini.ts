import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  console.error("Missing NEXT_PUBLIC_GEMINI_API_KEY");
}

export const ai = new GoogleGenAI({ apiKey: apiKey || "" });
