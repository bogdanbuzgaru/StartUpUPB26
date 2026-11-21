"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { CONTEST, OFFICIAL } from "@/lib/facts";
import { formatInt, formatLei, formatPercent, parseAmount } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

type Inputs = { sponsors: number; avgSponsor: number; donors: number; avgDonation: number; budget: number };
type Key = keyof Inputs;
type Scenario = "baseline" | "stressDonation" | "stressSponsors";

/** Competition baseline: 20 × 10.000 + 500 × 100 = 250.000 lei gross, 15.000 lei budget. */
const BASELINE: Inputs = {
  sponsors: CONTEST.corporateSponsors,
  avgSponsor: CONTEST.corporateTicketRon,
  donors: 500,
  avgDonation: 100,
  budget: CONTEST.maxCampaignBudgetRon,
};

const SCENARIOS: Record<Scenario, Inputs> = {
  baseline: BASELINE,
  stressDonation: { ...BASELINE, avgDonation: Math.round(BASELINE.avgDonation * 0.7) },
  stressSponsors: { ...BASELINE, sponsors: Math.round(BASELINE.sponsors * 0.5) },
};

const RANGES: Record<Key, { min: number; max: number; step: number; unit?: "lei" }> = {
  sponsors: { min: 0, max: 50, step: 1 },
  avgSponsor: { min: 2_500, max: 50_000, step: 500, unit: "lei" },
  donors: { min: 0, max: 2_000, step: 10 },
  avgDonation: { min: 20, max: 500, step: 5, unit: "lei" },
  budget: { min: 0, max: CONTEST.maxCampaignBudgetRon, step: 500, unit: "lei" },
};

const ORDER: Key[] = ["sponsors", "avgSponsor", "donors", "avgDonation", "budget"];

function compute(i: Inputs) {
  const corporate = i.sponsors * i.avgSponsor;
  const individual = i.donors * i.avgDonation;
  const gross = corporate + individual;
  const net = gross - i.budget;
  const contributors = i.sponsors + i.donors;
  const costPer = contributors > 0 ? i.budget / contributors : null;
  const phase1 = (gross / OFFICIAL.phase1Ron) * 100;
  return { corporate, individual, gross, net, costPer, phase1 };
}

const clamp = (k: Key, v: number) => {
  const r = RANGES[k];
  return Math.min(r.max, Math.max(r.min, Math.round(v)));
};

const same = (a: Inputs, b: Inputs) => ORDER.every((k) => a[k] === b[k]);

function SliderField({
  k,
  label,
  value,
  onChange,
  note,
}: {
  k: Key;
  label: string;
  value: number;
  onChange: (v: number) => void;
  note?: string;
}) {
  const id = useId();
  const r = RANGES[k];
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);

  const commit = () => {
    const n = parseAmount(draft);
    if (Number.isFinite(n)) {
      const c = clamp(k, n);
      onChange(c);
      setDraft(String(c));
    } else setDraft(String(value));
  };
  const fmt = (n: number) => (r.unit ? formatLei(n, 0) : formatInt(n));

  return (
    <div className="border-b border-line py-5 first:pt-0">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={`${id}-n`} className="text-[13.5px] font-medium text-ink">
          {label}
        </label>
        <div className="relative w-36 shrink-0">
          <input
            id={`${id}-n`}
            inputMode="numeric"
            autoComplete="off"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && commit()}
            className="field !py-2 pr-10 text-right font-mono tabular"
          />
          {r.unit && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-ink-3">lei</span>
          )}
        </div>
      </div>
      <input
        type="range"
        aria-label={label}
        min={r.min}
        max={r.max}
        step={r.step}
        value={value}
        onChange={(e) => onChange(clamp(k, Number(e.target.value)))}
        className="range mt-4 w-full"
      />
      <div className="mt-1 flex justify-between font-mono text-[11px] text-ink-3 tabular">
        <span>{fmt(r.min)}</span>
        <span>{fmt(r.max)}</span>
      </div>
      {note && <p className="mt-2 text-[12px] text-ink-3">{note}</p>}
    </div>
  );
}

export function CampaignSimulator() {
  const { t } = useI18n();
  const s = t.simulator;
  const [inputs, setInputs] = useState<Inputs>(BASELINE);

  const out = compute(inputs);
  const base = compute(BASELINE);
  const active = (Object.keys(SCENARIOS) as Scenario[]).find((sc) => same(SCENARIOS[sc], inputs));
  const isStress = active === "stressDonation" || active === "stressSponsors";
  const netDelta = out.net - base.net;
  const grossDelta = out.gross - base.gross;

  const set = (k: Key) => (v: number) => setInputs((p) => ({ ...p, [k]: v }));

  const delta = (d: number) =>
    d === 0 ? null : (
      <p className={`mt-1 font-mono text-[12px] tabular ${d < 0 ? "text-danger" : "text-ok"}`}>
        {d > 0 ? "+" : "−"}
        {formatLei(Math.abs(d), 0)} {s.deltaVsBaseline}
      </p>
    );

  const cards: { key: keyof typeof s.outputs; value: string; extra?: ReactNode; strong?: boolean; alert?: boolean }[] = [
    { key: "corporate", value: formatLei(out.corporate, 0) },
    { key: "individual", value: formatLei(out.individual, 0) },
    { key: "gross", value: formatLei(out.gross, 0), extra: delta(grossDelta) },
    { key: "net", value: formatLei(out.net, 0), extra: delta(netDelta), strong: true, alert: isStress || out.net < 0 },
    { key: "costPer", value: out.costPer === null ? "—" : formatLei(out.costPer), extra: out.costPer === null ? <p className="mt-1 font-mono text-[12px] text-ink-3">{s.noContributors}</p> : null },
    { key: "phase1", value: formatPercent(out.phase1) },
  ];

  return (
    <section id="simulator" aria-labelledby="sim-title" className="pt-20 lg:pt-28">
      <div className="grid gap-6 border-t border-ink pt-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <p className="eyebrow">{s.kicker}</p>
          <h2 id="sim-title" className="mt-4 font-serif text-[clamp(1.85rem,3.8vw,2.6rem)] leading-[1.02] tracking-[-0.01em] text-balance">
            {s.title}
          </h2>
        </div>
        <div className="flex flex-col gap-4 lg:col-span-5 lg:pt-8">
          <span className="demo-stamp self-start !whitespace-normal">{s.badge}</span>
          <p className="text-[14.5px] leading-relaxed text-ink-2">{s.intro}</p>
        </div>
      </div>

      {/* One-click scenarios */}
      <div className="mt-8" role="group" aria-label={s.scenariosLabel}>
        <p className="eyebrow">{s.scenariosLabel}</p>
        <div className="mt-3 grid gap-px border border-ink bg-ink sm:grid-cols-3">
          {(Object.keys(SCENARIOS) as Scenario[]).map((sc, i) => (
            <button
              key={sc}
              type="button"
              aria-pressed={active === sc}
              onClick={() => setInputs(SCENARIOS[sc])}
              className={`flex min-h-14 items-center gap-3 px-4 py-3 text-left text-[14px] transition-colors ${
                active === sc
                  ? sc === "baseline"
                    ? "bg-ink text-paper"
                    : "bg-danger text-paper"
                  : "bg-card text-ink hover:bg-paper-2"
              }`}
            >
              <span className={`font-mono text-[11px] ${active === sc ? "text-paper/70" : "text-ink-3"}`}>{String(i).padStart(2, "0")}</span>
              {s.scenarios[sc]}
            </button>
          ))}
        </div>
        <p className="mt-2 font-mono text-[11.5px] text-ink-3">
          {s.activeScenario}: {active ? s.scenarios[active] : s.custom}
        </p>
      </div>

      <div className="mt-8 grid gap-px border border-ink bg-ink lg:grid-cols-12">
        <div className="bg-card p-5 sm:p-7 lg:col-span-5">
          {ORDER.map((k) => (
            <SliderField
              key={k}
              k={k}
              label={s.inputs[k]}
              value={inputs[k]}
              onChange={set(k)}
              note={k === "budget" ? s.budgetCap : undefined}
            />
          ))}
        </div>

        <div className="grid gap-px bg-ink sm:grid-cols-2 lg:col-span-7" aria-live="polite">
          {cards.map((c) => (
            <article
              key={c.key}
              className={`flex flex-col justify-between gap-6 p-5 sm:p-6 ${
                c.alert ? "bg-danger-wash shadow-[inset_3px_0_0_0_var(--color-danger)]" : c.strong ? "bg-accent-wash/60" : "bg-card"
              }`}
            >
              <div>
                <h3 className="eyebrow !text-ink-2">{s.outputs[c.key]}</h3>
                <p className="mt-1 font-mono text-[11px] text-ink-3">{s.formulas[c.key]}</p>
              </div>
              <div>
                <p
                  className={`break-words font-mono text-[clamp(1.6rem,3.4vw,2.25rem)] leading-none tracking-[-0.03em] tabular ${
                    c.alert && out.net < 0 && c.key === "net" ? "text-danger" : c.strong ? "text-accent" : "text-ink"
                  }`}
                >
                  {c.value}
                </p>
                {c.extra}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
