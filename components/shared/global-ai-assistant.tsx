"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Bot,
  User,
  Loader2,
  X,
  Sparkles,
  Trash2,
  Minimize2,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  askGlobalAssistant,
  getGlobalChatHistory,
  clearGlobalChat,
} from "@/actions/assistant";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: string[];
}

const QUICK_PROMPTS = [
  "Hey! Help me set up my profile",
  "What should I eat post-workout?",
  "I need a new workout plan",
  "Help me hit my protein target today",
];

export function GlobalAiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    if (open && !loaded) {
      getGlobalChatHistory().then((result) => {
        if (result?.data) {
          setMessages(
            result.data.map((m: { id: string; role: string; content: string }) => ({
              id: m.id,
              role: m.role as "user" | "assistant",
              content: m.content,
            }))
          );
        }
        setLoaded(true);
      });
    }
  }, [open, loaded]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  async function handleSend(content?: string) {
    const msg = (content || input).trim();
    if (!msg || sending) return;
    setInput("");
    setSuggestions([]);

    const userMsg: Message = {
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
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed z-50 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95",
          "bottom-24 right-4 md:bottom-6 md:right-6",
          "h-14 w-14 bg-gradient-to-br from-primary to-primary/80",
          open && "pointer-events-none scale-0 opacity-0"
        )}
        aria-label="Open AI Assistant"
      >
        <Sparkles className="h-6 w-6 text-primary-foreground" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40 opacity-75" />
          <span className="relative inline-flex h-4 w-4 rounded-full bg-primary border-2 border-background" />
        </span>
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          "fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl transition-all duration-300",
          "bottom-24 right-4 md:bottom-6 md:right-6",
          open
            ? "h-[min(600px,calc(100vh-7rem))] w-[min(420px,calc(100vw-2rem))] opacity-100 translate-y-0"
            : "h-0 w-0 opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <span className="text-sm font-semibold">CutPilot AI</span>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                Your personal fitness companion
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={handleClear}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={() => setOpen(false)}
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={() => setOpen(false)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef}>
          <div className="space-y-4">
            {!loaded && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {loaded && messages.length === 0 && (
              <div className="py-6 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
                    <Sparkles className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">
                    Hey! I&apos;m CutPilot
                  </h3>
                  <p className="mt-1.5 text-xs text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
                    I&apos;m your personal fitness companion. I can set up your profile, plan your workouts, track your nutrition, and coach you through everything. Just chat with me like a friend.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSend(prompt)}
                      className="rounded-full border border-border/50 bg-muted/50 px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary/20"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className="space-y-1.5">
                <div
                  className={cn(
                    "flex gap-2.5",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mt-0.5">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted/80 rounded-bl-md"
                    )}
                  >
                    {msg.content.split("\n").map((line, i, arr) => (
                      <span key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary mt-0.5">
                      <User className="h-3 w-3" />
                    </div>
                  )}
                </div>

                {/* Action confirmations */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="ml-8 flex flex-col gap-1">
                    {msg.actions.map((action, i) => (
                      <div
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-green-500/10 border border-green-500/20 px-2.5 py-1 text-[11px] text-green-700 dark:text-green-400 w-fit"
                      >
                        <CheckCircle className="h-3 w-3 shrink-0" />
                        {action}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {sending && (
              <div className="flex gap-2.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mt-0.5">
                  <Bot className="h-3 w-3 text-primary" />
                </div>
                <div className="rounded-2xl rounded-bl-md bg-muted/80 px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            {suggestions.length > 0 && !sending && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] text-primary transition-colors hover:bg-primary/10"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border/50 bg-background/50 p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell me about yourself..."
              disabled={sending}
              className="flex-1 text-sm rounded-xl bg-muted/50 border-border/50"
            />
            <Button
              type="submit"
              size="icon"
              disabled={sending || !input.trim()}
              className="shrink-0 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
