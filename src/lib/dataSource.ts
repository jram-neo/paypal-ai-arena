/**
 * Single data-access boundary. Swap these implementations for a real API later.
 * Everything here is local mock data — no network calls, no real PayPal.
 */
import { eventStream } from "@/data/events";
import { reports } from "@/data/reports";
import { agents, constraints, inventory, scenarios, SIM_DAYS, STARTING_BUDGET } from "@/data/shop";
import type { AgentEvent, AgentReport } from "@/data/types";

export function getShopState() {
  return { agents, inventory, constraints, scenarios, startingBudget: STARTING_BUDGET, simDays: SIM_DAYS };
}

export function getReports(): Promise<AgentReport[]> {
  return Promise.resolve(reports);
}

/** Plays the scripted stream. Returns an unsubscribe/cancel function. */
export function subscribeToEvents(
  opts: { delayMs: () => number },
  onEvent: (e: AgentEvent) => void,
  onDone: () => void,
): () => void {
  let i = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let cancelled = false;
  const tick = () => {
    if (cancelled) return;
    if (i >= eventStream.length) return onDone();
    onEvent(eventStream[i++]);
    timer = setTimeout(tick, opts.delayMs());
  };
  timer = setTimeout(tick, opts.delayMs());
  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}
