"use client";

import { useState } from "react";
import { AiChat } from "@/components/shared/ai-chat";
import { askMealAssistant } from "@/actions/meals";
import type { AiMessage } from "@/types/database";

const MEAL_COACH_PROMPTS = [
  "How can I hit my protein on this meal?",
  "Suggest a simple swap for this recipe",
  "Is this meal balanced for my goals?",
  "What should I pair this with later?",
];

interface MealChatProps {
  mealId: string;
  initialMessages: AiMessage[];
}

export function MealChatPanel({ mealId, initialMessages }: MealChatProps) {
  const [messages, setMessages] = useState(
    initialMessages.map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
    }))
  );

  async function handleSend(content: string) {
    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user" as const,
      content,
    };
    setMessages((prev) => [...prev, userMsg]);

    const result = await askMealAssistant(mealId, content);
    if (result?.data) {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: result.data.message,
        },
      ]);
    }
  }

  return (
    <AiChat
      messages={messages}
      onSend={handleSend}
      title="Meal coach"
      subtitle="This meal"
      placeholder="Ask about this meal…"
      emptyTitle="Nutrition coach"
      emptyDescription="Macros, swaps, timing, or prep tips — ask anything about this meal."
      suggestedPrompts={MEAL_COACH_PROMPTS}
      className="h-[400px]"
    />
  );
}
