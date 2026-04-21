import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { useEffect, useRef, useState } from "react";
import { Send, MessageCircle, Sparkles, RotateCcw, AlertTriangle, HelpCircle, GraduationCap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { sendChat, type ChatMessage } from "@/lib/chat-server";

export const Route = createFileRoute("/help/chat")({
  head: () => ({
    meta: [
      { title: "AI Assistant — QE Automation Hub" },
      { name: "description", content: "Ask the AI assistant anything about your projects, scripts, runs, RPA flows, or integrations." },
    ],
  }),
  component: ChatPage,
});

const SUGGESTIONS = [
  "How do I create my first test automation project?",
  "What's the difference between Test Automation and RPA?",
  "Show me how to schedule a nightly suite",
  "How do I link a test case to an API endpoint?",
];

interface UiMessage extends ChatMessage {
  id: string;
  pending?: boolean;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function ChatPage() {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setError(null);
    setInput("");

    const userMsg: UiMessage = { id: uid(), role: "user", content: trimmed };
    const history: ChatMessage[] = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));
    setMessages((prev) => [...prev, userMsg, { id: uid(), role: "assistant", content: "", pending: true }]);
    setSending(true);

    try {
      const res = await sendChat({ data: { messages: history } });
      setMessages((prev) => {
        const next = [...prev];
        // replace the trailing pending assistant
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].pending) {
            next[i] = { ...next[i], content: res.reply, pending: false };
            break;
          }
        }
        return next;
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setMessages((prev) => prev.filter((m) => !m.pending));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  function reset() {
    setMessages([]);
    setError(null);
    inputRef.current?.focus();
  }

  return (
    <Shell>
      {/* Hero */}
      <div className="rounded-3xl glass-strong p-6 mb-4 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-violet-300 to-sky-400 opacity-25 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-[image:var(--gradient-primary)] grid place-items-center text-white shadow-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                AI Assistant
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-success/15 text-success font-semibold">
                  Live
                </span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground max-w-xl">
                Ask anything about projects, scripts, RPA flows, runs, or integrations. Powered by Lovable AI.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to="/help/faq"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-sm font-medium"
            >
              <HelpCircle className="h-4 w-4" /> FAQ
            </Link>
            <Link
              to="/help/tutorial"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-sm font-medium"
            >
              <GraduationCap className="h-4 w-4" /> Tutorial
            </Link>
            <button
              onClick={reset}
              disabled={messages.length === 0 || sending}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium disabled:opacity-40 disabled:pointer-events-none"
            >
              <RotateCcw className="h-4 w-4" /> New chat
            </button>
          </div>
        </div>
      </div>

      {/* Chat panel */}
      <div className="rounded-3xl glass flex flex-col h-[calc(100vh-15rem)] min-h-[480px] overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <EmptyState onPick={(s) => send(s)} />
          ) : (
            messages.map((m) => <Bubble key={m.id} message={m} />)
          )}
        </div>

        {error && (
          <div className="mx-6 mb-3 flex items-start gap-2 rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="border-t border-white/40 bg-white/40 backdrop-blur-md p-3"
        >
          <div className="flex items-end gap-2 rounded-2xl bg-white/70 border border-white/70 p-2 focus-within:border-primary transition">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              placeholder="Ask about projects, runs, RPA flows, CI/CD..."
              disabled={sending}
              className="flex-1 resize-none bg-transparent outline-none text-sm py-1.5 px-2 max-h-32"
              style={{ minHeight: 36 }}
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[image:var(--gradient-primary)] text-white text-sm font-medium shadow-lg disabled:opacity-40 disabled:pointer-events-none"
            >
              <Send className="h-4 w-4" /> Send
            </button>
          </div>
          <div className="mt-2 px-2 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Press Enter to send · Shift + Enter for new line</span>
            <span>Conversation is not persisted</span>
          </div>
        </form>
      </div>
    </Shell>
  );
}

function EmptyState({ onPick }: { onPick: (s: string) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-10">
      <div className="h-16 w-16 rounded-3xl bg-[image:var(--gradient-primary)] grid place-items-center shadow-lg">
        <MessageCircle className="h-7 w-7 text-white" />
      </div>
      <h2 className="mt-4 text-xl font-semibold">How can I help with QE today?</h2>
      <p className="mt-1 text-sm text-muted-foreground max-w-md">
        I know the QE Hub workspace inside out — projects, scripts, RPA flows, scheduling, integrations, and best practices.
      </p>
      <div className="mt-6 grid sm:grid-cols-2 gap-2 max-w-2xl w-full">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="text-left rounded-2xl bg-white/60 border border-white/70 hover:border-primary/40 hover:bg-white px-4 py-3 text-sm transition"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function Bubble({ message }: { message: UiMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={[
          "h-9 w-9 rounded-2xl grid place-items-center shrink-0 text-sm font-semibold shadow-sm",
          isUser
            ? "bg-foreground text-background"
            : "bg-[image:var(--gradient-primary)] text-white",
        ].join(" ")}
      >
        {isUser ? "QE" : <Sparkles className="h-4 w-4" />}
      </div>
      <div
        className={[
          "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm",
          isUser
            ? "bg-foreground text-background rounded-tr-sm"
            : "bg-white/70 border border-white/70 rounded-tl-sm",
        ].join(" ")}
      >
        {message.pending ? (
          <TypingIndicator />
        ) : isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-strong:text-foreground prose-code:text-foreground prose-code:bg-white/80 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-foreground prose-pre:text-background">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1">
      <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "120ms" }} />
      <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "240ms" }} />
    </div>
  );
}
