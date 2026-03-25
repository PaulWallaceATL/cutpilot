"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Bot, User, Send, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type CoachMessageRole = "user" | "assistant";

export interface CoachMessage {
  id: string;
  role: CoachMessageRole;
  content: string;
  actions?: string[];
}

function MessageLines({ content }: { content: string }) {
  return (
    <>
      {content.split("\n").map((line, i, arr) => (
        <span key={i}>
          {line}
          {i < arr.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

export function CoachAvatar({
  role,
  className,
}: {
  role: CoachMessageRole;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full md:h-8 md:w-8",
        role === "assistant"
          ? "bg-primary/12 ring-1 ring-primary/15"
          : "bg-secondary text-secondary-foreground",
        className
      )}
    >
      {role === "assistant" ? (
        <Bot className="h-3.5 w-3.5 text-primary md:h-4 md:w-4" />
      ) : (
        <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
      )}
    </div>
  );
}

export function CoachMessageBubble({
  role,
  children,
  className,
}: {
  role: CoachMessageRole;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-[min(85%,28rem)] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed shadow-soft",
        role === "user"
          ? "rounded-br-md bg-primary text-primary-foreground"
          : "rounded-bl-md border border-border/45 bg-muted/75 text-foreground backdrop-blur-[2px]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CoachMessageRow({ message }: { message: CoachMessage }) {
  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          "flex gap-2.5",
          message.role === "user" ? "justify-end" : "justify-start"
        )}
      >
        {message.role === "assistant" && (
          <CoachAvatar role="assistant" className="mt-0.5" />
        )}
        <CoachMessageBubble role={message.role}>
          <MessageLines content={message.content} />
        </CoachMessageBubble>
        {message.role === "user" && (
          <CoachAvatar role="user" className="mt-0.5" />
        )}
      </div>
      {message.actions && message.actions.length > 0 && (
        <div className="ml-8 flex flex-col gap-1">
          {message.actions.map((action, i) => (
            <div
              key={i}
              className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] text-primary"
            >
              <CheckCircle className="h-3 w-3 shrink-0" />
              {action}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CoachTypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <CoachAvatar role="assistant" className="mt-0.5" />
      <div className="rounded-2xl rounded-bl-md border border-border/45 bg-muted/75 px-4 py-3 shadow-soft backdrop-blur-[2px]">
        <div className="flex gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/45 [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/45 [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/45 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

export function CoachSuggestedChips({
  items,
  onSelect,
  emphasis = "muted",
}: {
  items: string[];
  onSelect: (text: string) => void;
  emphasis?: "muted" | "primary";
}) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap justify-center gap-1.5 pt-1">
      {items.map((text) => (
        <button
          key={text}
          type="button"
          onClick={() => onSelect(text)}
          className={cn(
            "rounded-full px-3 py-1.5 text-[11px] transition-colors",
            emphasis === "primary"
              ? "border border-primary/25 bg-primary/8 text-primary hover:bg-primary/12"
              : "border border-border/50 bg-muted/40 text-muted-foreground hover:border-primary/20 hover:bg-primary/8 hover:text-primary"
          )}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

export function CoachEmptyState({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-4 py-6 text-center">
      <div className="flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/15">
          <Icon className="h-7 w-7 text-primary" />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mx-auto mt-1.5 max-w-[280px] text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}

export function CoachHeader({
  title,
  subtitle,
  status,
  icon: Icon = Bot,
  trailing,
  className,
}: {
  title: string;
  subtitle?: string;
  status?: string;
  icon?: LucideIcon;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 border-b border-border/50 bg-gradient-to-r from-primary/[0.07] via-transparent to-transparent px-4 py-3",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 ring-1 ring-primary/18">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 text-left">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="truncate text-sm font-semibold">{title}</span>
            {status ? (
              <span className="whitespace-nowrap rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                {status}
              </span>
            ) : null}
          </div>
          {subtitle ? (
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      {trailing ? (
        <div className="flex shrink-0 items-center gap-0.5">{trailing}</div>
      ) : null}
    </div>
  );
}

export function CoachComposer({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder,
  sending,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
  sending?: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex items-end gap-2"
    >
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || sending}
        rows={1}
        className="min-h-10 max-h-32 resize-none rounded-xl border-border/50 bg-muted/35 py-2.5 text-sm md:text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
      />
      <Button
        type="submit"
        size="icon"
        disabled={sending || !value.trim()}
        className="h-10 w-10 shrink-0 rounded-xl"
        aria-label="Send message"
      >
        {sending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}
