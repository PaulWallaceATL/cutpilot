"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Trash2, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  askGlobalAssistant,
  getGlobalChatHistory,
  clearGlobalChat,
} from "@/actions/assistant";
import {
  CoachHeader,
  CoachMessageRow,
  CoachTypingIndicator,
  CoachEmptyState,
  CoachSuggestedChips,
  CoachComposer,
  type CoachMessage,
} from "@/components/shared/ai/coach-primitives";

const QUICK_PROMPTS = [
  "Hey! Help me set up my profile",
  "What should I eat post-workout?",
  "I need a new workout plan",
  "Help me hit my protein target today",
];

export function GlobalAiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    if (open && !loaded) {
      getGlobalChatHistory().then((result) => {
        if (result?.data) {
          setMessages(
            result.data.map(
              (m: { id: string; role: string; content: string }) => ({
                id: m.id,
                role: m.role as "user" | "assistant",
                content: m.content,
              })
            )
          );
        }
        setLoaded(true);
      });
    }
  }, [open, loaded]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending, scrollToBottom]);

  async function handleSend(content?: string) {
    const msg = (content || input).trim();
    if (!msg || sending) return;
    setInput("");
    setSuggestions([]);

    const userMsg: CoachMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: msg,
    };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      const result = await askGlobalAssistant(msg);
      if (result?.data) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: result.data.message,
            actions: result.data.actions,
          },
        ]);
        if (result.data.suggestions?.length) {
          setSuggestions(result.data.suggestions);
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  async function handleClear() {
    await clearGlobalChat();
    setMessages([]);
    setSuggestions([]);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-elevated transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]",
          "bottom-24 right-4 md:bottom-6 md:right-6",
          "bg-gradient-to-br from-primary to-primary/85",
          open && "pointer-events-none scale-0 opacity-0"
        )}
        aria-label="Open coach"
      >
        <Sparkles className="h-6 w-6 text-primary-foreground" />
        <span className="absolute -right-1 -top-1 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/35 opacity-75" />
          <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-background bg-primary" />
        </span>
      </button>

      <div
        className={cn(
          "fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-background/95 shadow-elevated backdrop-blur-xl transition-all duration-300",
          "bottom-24 right-4 md:bottom-6 md:right-6",
          open
            ? "h-[min(600px,calc(100vh-7rem))] w-[min(420px,calc(100vw-2rem))] translate-y-0 opacity-100"
            : "pointer-events-none h-0 w-0 translate-y-4 opacity-0"
        )}
      >
        <CoachHeader
          title="CutPilot"
          subtitle="Your fitness copilot"
          status="Active"
          icon={Sparkles}
          trailing={
            <>
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={handleClear}
                  aria-label="Clear chat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={() => setOpen(false)}
                aria-label="Close coach"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          }
        />

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
          <div className="space-y-4">
            {!loaded && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {loaded && messages.length === 0 && !sending && (
              <CoachEmptyState
                icon={Sparkles}
                title="Hey! I'm CutPilot"
                description="I can set up your profile, plan workouts, track nutrition, and coach you day to day. Chat like you would with a friend."
              >
                <CoachSuggestedChips
                  items={QUICK_PROMPTS}
                  onSelect={(p) => void handleSend(p)}
                />
              </CoachEmptyState>
            )}

            {messages.map((msg) => (
              <CoachMessageRow key={msg.id} message={msg} />
            ))}

            {sending && <CoachTypingIndicator />}

            {suggestions.length > 0 && !sending && (
              <CoachSuggestedChips
                items={suggestions}
                onSelect={(s) => void handleSend(s)}
                emphasis="primary"
              />
            )}
            <div ref={endRef} />
          </div>
        </div>

        <div className="border-t border-border/50 bg-background/50 p-3 backdrop-blur-sm">
          <CoachComposer
            value={input}
            onChange={setInput}
            onSubmit={() => void handleSend()}
            placeholder="Tell me about yourself…"
            sending={sending}
          />
        </div>
      </div>
    </>
  );
}
