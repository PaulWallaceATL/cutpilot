import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      timeout: 120000, // 2 minutes timeout
      maxRetries: 2,
    });
  }
  return client;
}

export function getTextModel(): string {
  return process.env.OPENAI_MODEL_TEXT || "gpt-4o";
}

export function getVisionModel(): string {
  return process.env.OPENAI_MODEL_VISION || "gpt-4o";
}
