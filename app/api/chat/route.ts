import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "./system-prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const MAX_MESSAGES = 16;
const MAX_CHARS = 1000;
const MAX_BODY_BYTES = 24_000;

type ChatMessage = { role: "user" | "assistant"; content: string };

const FALLBACK = {
  ro: "Consilierul AI rulează în modul demonstrativ: cheia GEMINI_API_KEY nu este configurată pe server. Pe scurt, din sursele oficiale: Faza 1 (proiectare, avize, autorizații) este estimată de Fundație la 1.250.000 lei, iar investiția totală la 100.000.000 lei. O donație nu cumpără un loc sau o cameră în cămin. Pentru informații și donații reale: https://fundatia.upb.ro/proiecte-si-evenimente/un-loc-in-camin-poate-schimba-un-destin/",
  en: "The AI advisor is running in demo mode: GEMINI_API_KEY is not configured on the server. In short, from official sources: Phase 1 (design, approvals, permits) is estimated by the Foundation at 1.250.000 lei, and the total investment at 100.000.000 lei. A donation does not buy a place or a room in the dormitory. For real information and donations: https://fundatia.upb.ro/proiecte-si-evenimente/un-loc-in-camin-poate-schimba-un-destin/",
};

/* Minimal in-memory rate limit (best effort per server instance). */
const hits = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + WINDOW_MS });
    if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

function parseBody(raw: unknown): { messages: ChatMessage[]; uiLang: "ro" | "en" } | null {
  if (!raw || typeof raw !== "object") return null;
  const { messages, uiLang } = raw as { messages?: unknown; uiLang?: unknown };
  if (!Array.isArray(messages) || messages.length === 0) return null;
  const clean: ChatMessage[] = [];
  for (const m of messages.slice(-MAX_MESSAGES)) {
    if (!m || typeof m !== "object") return null;
    const { role, content } = m as { role?: unknown; content?: unknown };
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim();
    if (!text) continue;
    if (text.length > MAX_CHARS * (role === "assistant" ? 4 : 1)) return null;
    clean.push({ role, content: text });
  }
  if (clean.length === 0 || clean[clean.length - 1].role !== "user") return null;
  return { messages: clean, uiLang: uiLang === "en" ? "en" : "ro" };
}

export async function POST(req: Request) {
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > MAX_BODY_BYTES) return NextResponse.json({ error: "payload_too_large" }, { status: 413 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = parseBody(body);
  if (!parsed) return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  // Prefer the platform-set header (Vercel) over the client-controllable X-Forwarded-For chain.
  const ip =
    req.headers.get("x-real-ip")?.trim() ||
    (req.headers.get("x-forwarded-for") ?? "").split(",").pop()?.trim() ||
    "local";
  if (rateLimited(ip)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ reply: FALLBACK[parsed.uiLang], fallback: true });
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: parsed.messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 700,
          thinkingConfig: { thinkingBudget: 0 },
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ],
      }),
      signal: AbortSignal.timeout(25_000),
      cache: "no-store",
    });

    if (!res.ok) {
      // Log status only – never the key or the full upstream payload.
      console.error(`[api/chat] Gemini upstream error: ${res.status}`);
      return NextResponse.json({ error: "upstream_error" }, { status: 502 });
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
    };
    const reply = data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .join("")
      .trim();
    if (!reply) return NextResponse.json({ error: "empty_reply" }, { status: 502 });

    return NextResponse.json({ reply: reply.slice(0, 6000) });
  } catch (err) {
    console.error("[api/chat] request failed:", err instanceof Error ? err.name : "unknown");
    return NextResponse.json({ error: "upstream_unavailable" }, { status: 504 });
  }
}

export function GET() {
  return NextResponse.json({ error: "method_not_allowed" }, { status: 405, headers: { Allow: "POST" } });
}
