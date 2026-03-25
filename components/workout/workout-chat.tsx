"use client";

import { useState } from "react";
import { AiChat } from "@/components/shared/ai-chat";
import { askWorkoutAssistant } from "@/actions/workouts";
import type { AiMessage } from "@/types/database";

const WORKOUT_COACH_PROMPTS = [
  "What order should I do these exercises?",
  "Suggest a weight for my next set",
  "Is this enough volume for my goal?",
  "How long should I rest between sets?",
];

interface WorkoutChatProps {
  workoutDayId: string;
  initialMessages: AiMessage[];
}

export function WorkoutChat({ workoutDayId, initialMessages }: WorkoutChatProps) {
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

    const result = await askWorkoutAssistant(workoutDayId, content);
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
      title="Workout coach"
      subtitle="This session"
      placeholder="Ask about this workout…"
      emptyTitle="Session coach"
      emptyDescription="Ask about form, load, rest, or exercise order — tailored to this workout."
      suggestedPrompts={WORKOUT_COACH_PROMPTS}
      className="h-[400px]"
    />
  );
}
