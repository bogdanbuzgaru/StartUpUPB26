"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n";
import { CloseIcon, SendIcon, SparkIcon } from "@/components/ui/icons";

type Msg = { role: "user" | "assistant"; content: string; error?: boolean };
const MAX_CHARS = 1000;

export function ChatDrawer() {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    // Lock background scroll on small screens where the drawer is full-height.
    const mq = window.matchMedia("(max-width: 639px)");
    const prev = document.body.style.overflow;
    if (mq.matches) document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content) return setInputError(t.chat.empty);
    if (content.length > MAX_CHARS) return setInputError(t.chat.tooLong);
    setInputError(null);
    const next: Msg[] = [...messages.filter((m) => !m.error), { role: "user", content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uiLang: lang, messages: next.slice(-12).map(({ role, content }) => ({ role, content })) }),
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string };
      if (!res.ok || !data.reply) throw new Error("bad");
      setMessages((m) => [...m, { role: "assistant", content: data.reply as string }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: t.chat.error, error: true }]);
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!busy) void send(input);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`fixed bottom-4 right-4 z-40 inline-flex min-h-12 items-center gap-2.5 bg-ink pl-4 pr-5 text-[14px] font-medium text-paper shadow-[0_10px_30px_-12px_rgba(21,20,15,0.6)] transition-all duration-200 hover:bg-accent sm:bottom-6 sm:right-6 ${
          open ? "pointer-events-none translate-y-2 opacity-0" : "opacity-100"
        }`}
      >
        <SparkIcon className="size-4" />
        {t.chat.open}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end sm:inset-auto sm:bottom-6 sm:right-6">
          <div className="absolute inset-0 bg-ink/30 sm:hidden" onClick={() => setOpen(false)} aria-hidden />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-title"
            className="relative flex h-[min(88dvh,44rem)] w-full flex-col border border-ink bg-card shadow-[6px_6px_0_0_var(--color-ink)] animate-rise sm:h-[min(78dvh,40rem)] sm:w-[25rem]"
          >
            <header className="flex items-start justify-between gap-3 border-b border-ink bg-ink px-4 py-3 text-paper">
              <div>
                <h2 id="chat-title" className="text-[15px] font-medium">{t.chat.title}</h2>
                <p className="mt-0.5 font-mono text-[11px] text-paper/70">{t.chat.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                aria-label={t.chat.close}
                className="-mr-1 p-1.5 text-paper/80 hover:text-paper"
              >
                <CloseIcon className="size-4" />
              </button>
            </header>

            <p className="border-b border-dashed border-line-strong bg-paper px-4 py-2 font-mono text-[10.5px] leading-snug text-ink-2">
              {t.chat.disclaimer}
            </p>

            <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
              <div className="max-w-[90%] text-[14px] leading-relaxed text-ink">{t.chat.welcome}</div>
              {messages.length === 0 && (
                <div className="flex flex-col items-start gap-2">
                  {t.chat.suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void send(s)}
                      className="border border-line-strong bg-paper px-3 py-2 text-left text-[13px] text-ink-2 transition-colors hover:border-ink hover:text-ink"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="ml-auto max-w-[85%] bg-accent px-3.5 py-2.5 text-[14px] leading-relaxed text-paper whitespace-pre-wrap break-words">
                    {m.content}
                  </div>
                ) : (
                  <div
                    key={i}
                    className={`max-w-[92%] border-l-2 pl-3 text-[14px] leading-relaxed whitespace-pre-wrap break-words ${
                      m.error ? "border-danger text-danger" : "border-ink text-ink"
                    }`}
                  >
                    {m.content}
                  </div>
                ),
              )}
              {busy && (
                <div className="flex items-center gap-2 font-mono text-[12px] text-ink-3" role="status">
                  <span className="inline-flex gap-1" aria-hidden>
                    <span className="size-1.5 animate-pulse bg-ink-3" />
                    <span className="size-1.5 animate-pulse bg-ink-3 [animation-delay:150ms]" />
                    <span className="size-1.5 animate-pulse bg-ink-3 [animation-delay:300ms]" />
                  </span>
                  {t.chat.thinking}
                </div>
              )}
            </div>

            <form onSubmit={onSubmit} className="border-t border-ink p-3">
              <div className="flex items-end gap-2">
                <label htmlFor="chat-input" className="sr-only">{t.chat.placeholder}</label>
                <textarea
                  id="chat-input"
                  ref={inputRef}
                  rows={1}
                  value={input}
                  maxLength={MAX_CHARS + 200}
                  onChange={(e) => {
                    setInput(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      if (!busy) void send(input);
                    }
                  }}
                  placeholder={t.chat.placeholder}
                  aria-invalid={Boolean(inputError)}
                  aria-describedby={inputError ? "chat-err" : undefined}
                  className="field max-h-32 min-h-11 resize-none py-2.5"
                />
                <button
                  type="submit"
                  disabled={busy}
                  aria-label={t.chat.send}
                  className="inline-flex size-11 shrink-0 items-center justify-center bg-ink text-paper transition-colors hover:bg-accent disabled:opacity-50"
                >
                  <SendIcon className="size-4" />
                </button>
              </div>
              <div className="mt-1.5 flex justify-between gap-3 font-mono text-[10.5px]">
                <span id="chat-err" role={inputError ? "alert" : undefined} className="text-danger">{inputError}</span>
                <span className={input.length > MAX_CHARS ? "text-danger" : "text-ink-3"}>
                  {input.length}/{MAX_CHARS}
                </span>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
