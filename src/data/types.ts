export type Tool = "set_price" | "restock" | "reply_to_customer" | "create_order" | "refund";
export type AgentId = "A" | "B" | "C";

export interface AgentEvent {
  id: string;
  timestamp: string;
  sim_day: number;
  agent_id: AgentId;
  tool: Tool;
  arguments: Record<string, string | number>;
  result: { status: "ok" | "rejected" | "error"; message: string };
  constraint_violations: string[];
  paypal_ref: string | null;
  agent_reasoning: string;
  budget_after: number;
  revenue_after: number;
  scenario_id?: string | undefined;
}

export interface Deduction {
  event_id: string;
  axis: "revenue" | "compliance" | "decision_quality";
  points: number;
  reason: string;
}

export interface AgentReport {
  agent_id: AgentId;
  model_name: string;
  scores: { revenue: number; compliance: number; decision_quality: number; total: number };
  deductions: Deduction[];
}

export interface InventoryItem { sku: string; name: string; stock: number; cost: number; price: number }
export interface Scenario { id: string; title: string; detail: string }
export interface Agent { id: AgentId; model_name: string }
