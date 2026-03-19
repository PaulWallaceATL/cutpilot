"use client";

import { useState } from "react";
import { AiChat } from "@/components/shared/ai-chat";
import { askWorkoutAssistant } from "@/actions/workouts";
import type { AiMessage } from "@/types/database";

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
      placeholder="Ask about this workout..."
      className="h-[400px]"
    />
  );
}
