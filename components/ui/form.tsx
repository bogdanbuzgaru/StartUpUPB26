"use client";

import { useId, useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { AlertIcon, CheckIcon, CopyIcon } from "./icons";

/* ------------------------------ Copy ------------------------------ */

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function CopyButton({
  text,
  label,
  variant = "ghost",
  className = "",
}: {
  text: string;
  label?: string;
  variant?: "ghost" | "solid";
  className?: string;
}) {
  const { t } = useI18n();
  const [state, setState] = useState<"idle" | "ok" | "fail">("idle");
  const onClick = async () => {
    const ok = await copyText(text);
    setState(ok ? "ok" : "fail");
    window.setTimeout(() => setState("idle"), 2200);
  };
  const styles =
    variant === "solid"
      ? "bg-ink text-paper hover:bg-ink-2"
      : "border border-ink text-ink hover:bg-ink hover:text-paper";
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex min-h-10 items-center gap-2 px-3.5 font-mono text-[12px] uppercase tracking-[0.08em] transition-colors duration-150 ${styles} ${className}`}
      >
        {state === "ok" ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
        <span aria-live="polite">{state === "ok" ? t.common.copied : (label ?? t.common.copy)}</span>
      </button>
      {state === "fail" && <span className="text-[12px] text-danger">{t.common.copyFailed}</span>}
    </span>
  );
}

/* ------------------------------ Fields ------------------------------ */

export function Field({
  label,
  error,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
  htmlFor?: string;
}) {
  const autoId = useId();
  const id = htmlFor ?? autoId;
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-ink">
        {label}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error && (
        <p id={hintId} className="text-[12px] text-ink-3">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} role="alert" className="flex items-start gap-1.5 text-[12.5px] leading-snug text-danger animate-rise">
          <AlertIcon className="mt-px size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/** Preset chips + free input for an amount. Value is kept as a raw string so malformed input can be validated. */
export function AmountPicker({
  presets,
  value,
  onChange,
  currency,
  label,
  error,
  otherLabel,
  name,
}: {
  presets: number[];
  value: string;
  onChange: (v: string) => void;
  currency: "RON" | "EUR";
  label: string;
  error?: string;
  otherLabel: string;
  name: string;
}) {
  const id = useId();
  const unit = currency === "EUR" ? "EUR" : "lei";
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-[13px] font-medium text-ink">{label}</legend>
      <div className={`grid gap-2 ${presets.length === 4 ? "grid-cols-2 sm:grid-cols-4 md:grid-cols-2 xl:grid-cols-4" : "grid-cols-3"}`}>
        {presets.map((p) => {
          const active = value.trim() === String(p);
          return (
            <button
              key={p}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(String(p))}
              className={`min-h-11 border font-mono text-[14px] tabular transition-colors duration-150 ${
                active ? "border-ink bg-ink text-paper" : "border-line-strong bg-card text-ink hover:border-ink"
              }`}
            >
              {p} {currency === "EUR" ? "EUR" : "RON"}
            </button>
          );
        })}
      </div>
      <div className="relative">
        <label htmlFor={id} className="sr-only">
          {otherLabel}
        </label>
        <input
          id={id}
          name={name}
          inputMode="decimal"
          autoComplete="off"
          placeholder={otherLabel}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-err` : undefined}
          className="field pr-14 font-mono tabular"
        />
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[12px] text-ink-3">
          {unit}
        </span>
      </div>
      {error && (
        <p id={`${id}-err`} role="alert" className="flex items-start gap-1.5 text-[12.5px] leading-snug text-danger animate-rise">
          <AlertIcon className="mt-px size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function SubmitButton({ children, busy, busyLabel }: { children: ReactNode; busy?: boolean; busyLabel: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="group inline-flex min-h-12 w-full items-center justify-between gap-3 bg-accent px-5 text-left text-[15px] font-medium text-paper transition-colors duration-150 hover:bg-accent-ink disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:min-w-72"
    >
      <span>{busy ? busyLabel : children}</span>
      <span aria-hidden className="font-mono transition-transform duration-200 group-hover:translate-x-1">
        →
      </span>
    </button>
  );
}

export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="flex items-start gap-2 border-l-2 border-danger bg-danger-wash px-3 py-2 text-[13px] text-danger animate-rise">
      <AlertIcon className="mt-0.5 size-4 shrink-0" />
      {children}
    </p>
  );
}

export function DemoStamp({ children }: { children: ReactNode }) {
  return <span className="demo-stamp">{children}</span>;
}
