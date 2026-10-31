import { useEffect, useMemo, useRef, useState } from "react";
import { DollarSign, MessageSquare, Package, Play, RotateCcw, ShoppingCart, Tag, Undo2 } from "lucide-react";
import { getReports, getShopState, subscribeToEvents } from "@/lib/dataSource";
import type { AgentEvent, AgentId, AgentReport, Tool } from "@/data/types";
import { cn } from "@/lib/utils";

const shop = getShopState();
type Status = "Idle" | "Running" | "Finished";

const toolIcon: Record<Tool, typeof Tag> = {
  set_price: Tag,
  restock: Package,
  reply_to_customer: MessageSquare,
  create_order: ShoppingCart,
  refund: Undo2,
};

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

function useTicker(target: number) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / 400);
      const val = a + (target - a) * (1 - Math.pow(1 - p, 3));
      setV(val);
      from.current = val;
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}

function Num({ value, prefix = "$", className }: { value: number; prefix?: string; className?: string }) {
  const v = useTicker(value);
  return <span className={cn("font-mono tabular-nums", className)}>{prefix}{Math.round(v).toLocaleString("en-US")}</span>;
}

export function Arena() {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [status, setStatus] = useState<Status>("Idle");
  const [speed, setSpeed] = useState(1);
  const [reports, setReports] = useState<AgentReport[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const cancel = useRef<(() => void) | null>(null);
  const hasRun = useRef(false);

  useEffect(() => () => cancel.current?.(), []);

  const run = () => {
    cancel.current?.();
    setEvents([]);
    setReports(null);
    setExpanded(null);
    setStatus("Running");
    hasRun.current = true;
    cancel.current = subscribeToEvents(
      { delayMs: () => 700 / speedRef.current },
      (e) => setEvents((prev) => [...prev, e]),
      () => {
        setStatus("Finished");
        getReports().then(setReports);
      },
    );
  };

  const day = events.length ? events[events.length - 1]!.sim_day : 1;
  const handled = new Set(events.map((e) => e.scenario_id).filter(Boolean));
  const latest = (id: AgentId) => [...events].reverse().find((e) => e.agent_id === id);
  const totals = {
    budget: shop.agents.reduce((s, a) => s + (latest(a.id)?.budget_after ?? shop.startingBudget), 0),
    revenue: shop.agents.reduce((s, a) => s + (latest(a.id)?.revenue_after ?? 0), 0),
  };

  const jumpTo = (id: string) => {
    const el = document.getElementById(`ev-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus({ preventScroll: true });
    setFlash(null);
    requestAnimationFrame(() => setFlash(id));
  };

  return (
    <div className="flex h-screen min-w-[1280px] flex-col bg-background text-foreground">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border px-5">
        <h1 className="text-lg font-bold tracking-tight">
          Agent<span className="text-primary">Arena</span>
        </h1>
        <span className="rounded border border-warn/40 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-warn">Demo data</span>
        <div className="ml-6 flex items-center gap-2">
          <span className="label-caps">Sim day</span>
          <span className="font-mono text-base font-semibold">{day}/{shop.simDays}</span>
        </div>
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-xs font-medium",
            status === "Running" && "border-primary/50 text-primary",
            status === "Finished" && "border-ok/50 text-ok",
            status === "Idle" && "border-border text-muted-foreground",
          )}
        >
          {status === "Running" && <span className="mr-1.5 inline-block size-1.5 animate-pulse rounded-full bg-primary align-middle" />}
          {status}
        </span>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex rounded-md border border-border p-0.5" role="group" aria-label="Playback speed">
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                aria-pressed={speed === s}
                className={cn(
                  "rounded px-2.5 py-1 font-mono text-xs focus-visible:outline-2 focus-visible:outline-ring",
                  speed === s ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s}x
              </button>
            ))}
          </div>
          <button
            onClick={run}
            disabled={!hasRun.current || status === "Running"}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-accent disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <RotateCcw className="size-4" /> Replay
          </button>
          <button
            onClick={run}
            disabled={status === "Running"}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Play className="size-4" /> Run week
          </button>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[22fr_50fr_28fr] divide-x divide-border">
        {/* LEFT: shared shop */}
        <section className="min-h-0 space-y-5 overflow-y-auto p-4" aria-label="Shared shop">
          <div className="label-caps">Shared shop</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md border border-border bg-card p-3">
              <div className="label-caps">Budget</div>
              <Num value={totals.budget} className="mt-1 block text-2xl font-bold" />
              <div className="mt-0.5 text-[11px] text-muted-foreground">all agents</div>
            </div>
            <div className="rounded-md border border-border bg-card p-3">
              <div className="label-caps">Revenue</div>
              <Num value={totals.revenue} className="mt-1 block text-2xl font-bold" />
              <div className="mt-0.5 text-[11px] text-muted-foreground">all agents</div>
            </div>
          </div>

          <div>
            <div className="label-caps mb-2">Inventory</div>
            <table className="w-full text-xs">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-1.5 text-left font-medium">SKU</th>
                  <th className="text-right font-medium">Stock</th>
                  <th className="text-right font-medium">Cost</th>
                  <th className="text-right font-medium">Price</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {shop.inventory.map((i) => (
                  <tr key={i.sku} className="border-b border-border/60">
                    <td className="py-1.5" title={i.name}>{i.sku}</td>
                    <td className={cn("text-right", i.stock === 0 && "text-warn")}>{i.stock}</td>
                    <td className="text-right">{money(i.cost)}</td>
                    <td className="text-right">{money(i.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <div className="label-caps mb-2">Constraint rules</div>
            <ol className="space-y-1.5 text-xs">
              {shop.constraints.map((c, i) => (
                <li key={c} className="flex gap-2">
                  <span className="font-mono text-muted-foreground">R{i + 1}</span>
                  {c}
                </li>
              ))}
            </ol>
          </div>

          <div>
            <div className="label-caps mb-2">Customer scenarios</div>
            <div className="space-y-2">
              {shop.scenarios.map((s) => {
                const done = handled.has(s.id);
                return (
                  <div key={s.id} className="rounded-md border border-border bg-card p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{s.title}</span>
                      <span className={cn("font-mono text-[10px] uppercase", done ? "text-ok" : "text-muted-foreground")}>
                        {done ? "Handled" : "Pending"}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{s.detail}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CENTER: timeline */}
        <section className="flex min-h-0 flex-col" aria-label="Event timeline">
          <div className="label-caps px-4 pt-4 pb-2">Event timeline</div>
          <div className="grid min-h-0 flex-1 grid-cols-3 divide-x divide-border border-t border-border">
            {shop.agents.map((a) => {
              const lane = events.filter((e) => e.agent_id === a.id);
              const last = lane[lane.length - 1];
              const violations = lane.reduce((n, e) => n + e.constraint_violations.length, 0);
              return (
                <div key={a.id} className="flex min-h-0 flex-col">
                  <div className="border-b border-border bg-card/50 p-3">
                    <div className="flex items-baseline justify-between">
                      <span className="font-semibold">Agent {a.id}</span>
                      <span className="font-mono text-[11px] text-muted-foreground">{a.model_name}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
                      <div><div className="label-caps !text-[10px]">Budget</div><Num value={last?.budget_after ?? shop.startingBudget} className="text-sm font-semibold" /></div>
                      <div><div className="label-caps !text-[10px]">Revenue</div><Num value={last?.revenue_after ?? 0} className="text-sm font-semibold" /></div>
                      <div><div className="label-caps !text-[10px]">Violations</div><span className={cn("font-mono text-sm font-semibold", violations && "text-destructive")}>{violations}</span></div>
                    </div>
                  </div>
                  <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
                    {lane.length === 0 && (
                      <p className="pt-10 text-center text-xs text-muted-foreground">No events yet. Run the week.</p>
                    )}
                    {lane.map((e) => (
                      <EventCard
                        key={e.id}
                        e={e}
                        open={expanded === e.id}
                        flash={flash === e.id}
                        onToggle={() => setExpanded(expanded === e.id ? null : e.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RIGHT: scoreboard */}
        <section className="min-h-0 overflow-y-auto p-4" aria-label="Scoreboard">
          <div className="label-caps mb-3">Scoreboard</div>
          {!reports ? (
            <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              {status === "Running" ? "Scoring when the week ends…" : "No scores yet. Run the week to rank agents."}
            </div>
          ) : (
            <Scoreboard reports={reports} onJump={jumpTo} />
          )}
        </section>
      </main>
    </div>
  );
}

function EventCard({ e, open, flash, onToggle }: { e: AgentEvent; open: boolean; flash: boolean; onToggle: () => void }) {
  const Icon = toolIcon[e.tool];
  const bad = e.constraint_violations.length > 0;
  const args = Object.entries(e.arguments).map(([k, v]) => `${k}=${v}`).join(" ");
  return (
    <div
      id={`ev-${e.id}`}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onClick={onToggle}
      onKeyDown={(k) => (k.key === "Enter" || k.key === " ") && (k.preventDefault(), onToggle())}
      className={cn(
        "cursor-pointer rounded-md border bg-card p-2.5 text-xs animate-in fade-in slide-in-from-top-2 duration-300 hover:bg-accent/60 focus-visible:outline-2 focus-visible:outline-ring",
        bad ? "border-destructive" : "border-border",
        flash && "event-flash",
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[10px] text-muted-foreground">D{e.sim_day}</span>
        <Icon className="size-3.5 text-primary" />
        <span className="font-mono font-medium">{e.tool}</span>
        <span
          className={cn(
            "ml-auto rounded px-1.5 py-px font-mono text-[10px] uppercase",
            e.result.status === "ok" && "bg-ok/15 text-ok",
            e.result.status === "rejected" && "bg-destructive/15 text-destructive",
            e.result.status === "error" && "bg-warn/15 text-warn",
          )}
        >
          {e.result.status}
        </span>
      </div>
      <div className="mt-1 truncate font-mono text-[11px] text-muted-foreground" title={args}>{args}</div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="text-muted-foreground">{e.result.message}</span>
        {e.paypal_ref && (
          <span className="inline-flex items-center gap-0.5 rounded border border-border px-1 font-mono text-[10px]">
            <DollarSign className="size-2.5" />{e.paypal_ref}
          </span>
        )}
      </div>
      {bad && e.constraint_violations.map((v) => (
        <div key={v} className="mt-1.5 font-medium text-destructive">⚠ {v}</div>
      ))}
      {open && (
        <div className="mt-2 border-t border-border pt-2 animate-in fade-in">
          <div className="label-caps !text-[10px]">Reasoning</div>
          <p className="mt-0.5 leading-relaxed">{e.agent_reasoning}</p>
        </div>
      )}
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-[92px_1fr_32px] items-center gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-[width] duration-700" style={{ width: `${value}%` }} />
      </div>
      <span className="text-right font-mono">{value}</span>
    </div>
  );
}

const axisLabel = { revenue: "Revenue", compliance: "Compliance", decision_quality: "Decision" } as const;

function Scoreboard({ reports, onJump }: { reports: AgentReport[]; onJump: (id: string) => void }) {
  const ranked = useMemo(() => [...reports].sort((a, b) => b.scores.total - a.scores.total), [reports]);
  const topRev = [...reports].sort((a, b) => b.scores.revenue - a.scores.revenue)[0]!;
  const rank = ranked.findIndex((r) => r.agent_id === topRev.agent_id) + 1;
  const violations = topRev.deductions.filter((d) => d.axis === "compliance").length;

  return (
    <div className="space-y-4">
      {rank !== 1 && (
        <div className="rounded-md border border-warn/40 bg-warn/10 p-3 text-sm">
          Agent {topRev.agent_id} earned the most but ranked #{rank} due to {violations} violation{violations === 1 ? "" : "s"}.
        </div>
      )}
      {ranked.map((r, i) => (
        <div key={r.agent_id} className="rounded-md border border-border bg-card p-3 animate-in fade-in slide-in-from-right-2" style={{ animationDelay: `${i * 120}ms`, animationFillMode: "both" }}>
          <div className="flex items-center gap-3">
            <span className={cn("font-mono text-2xl font-bold", i === 0 ? "text-primary" : "text-muted-foreground")}>#{i + 1}</span>
            <div>
              <div className="font-semibold">Agent {r.agent_id}</div>
              <div className="font-mono text-[11px] text-muted-foreground">{r.model_name}</div>
            </div>
            <div className="ml-auto text-right">
              <Num value={r.scores.total} prefix="" className="text-3xl font-bold" />
              <div className="label-caps !text-[10px]">Total</div>
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            <Bar label="Revenue" value={r.scores.revenue} />
            <Bar label="Compliance" value={r.scores.compliance} />
            <Bar label="Decision quality" value={r.scores.decision_quality} />
          </div>
          {r.deductions.length > 0 && (
            <ul className="mt-3 space-y-1 border-t border-border pt-2">
              {r.deductions.map((d, k) => (
                <li key={k}>
                  <button
                    onClick={() => onJump(d.event_id)}
                    className="grid w-full grid-cols-[34px_72px_1fr_auto] items-baseline gap-1.5 rounded px-1 py-0.5 text-left text-xs hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <span className="font-mono text-destructive">−{d.points}</span>
                    <span className="text-muted-foreground">{axisLabel[d.axis]}</span>
                    <span>{d.reason}</span>
                    <span className="font-mono text-[10px] text-primary">{d.event_id}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
