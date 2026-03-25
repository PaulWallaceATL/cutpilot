"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CoachHeader,
  CoachMessageRow,
  CoachTypingIndicator,
  CoachEmptyState,
  CoachSuggestedChips,
  CoachComposer,
  type CoachMessage,
} from "@/components/shared/ai/coach-primitives";

export type { CoachMessage };

interface AiChatProps {
  messages: CoachMessage[];
  onSend: (message: string) => Promise<void>;
  placeholder?: string;
  className?: string;
  title?: string;
  subtitle?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  suggestedPrompts?: string[];
}

export function AiChat({
  messages,
  onSend,
  placeholder = "Ask your coach…",
  className,
  title = "Coach",
  subtitle = "This session",
  emptyTitle = "Ask anything",
  emptyDescription =
    "Form cues, substitutions, or pacing — your coach is here for this workout.",
  suggestedPrompts = [],
}: AiChatProps) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  async function handleSend(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;
    setInput("");
    setSending(true);
    try {
      await onSend(msg);
    } finally {
      setSending(false);
    }
  }

  return (
    <Card
      variant="glass"
      className={cn("flex min-h-0 flex-col overflow-hidden", className)}
    >
      <CoachHeader title={title} subtitle={subtitle} icon={Bot} />

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
      >
        <div className="space-y-4">
          {messages.length === 0 && !sending && (
            <CoachEmptyState
              icon={Bot}
              title={emptyTitle}
              description={emptyDescription}
            >
              {suggestedPrompts.length > 0 && (
                <CoachSuggestedChips
                  items={suggestedPrompts}
                  onSelect={(p) => void handleSend(p)}
                />
              )}
            </CoachEmptyState>
          )}

          {messages.map((msg) => (
            <CoachMessageRow key={msg.id} message={msg} />
          ))}

          {sending && <CoachTypingIndicator />}
        </div>
      </div>

      <div className="border-t border-border/50 bg-background/40 p-3 backdrop-blur-sm">
        <CoachComposer
          value={input}
          onChange={setInput}
          onSubmit={() => void handleSend()}
          placeholder={placeholder}
          sending={sending}
        />
      </div>
    </Card>
  );
}
