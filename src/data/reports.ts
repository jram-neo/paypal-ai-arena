import type { AgentReport } from "./types";

export const reports: AgentReport[] = [
  {
    agent_id: "A",
    model_name: "gpt-4.1",
    scores: { revenue: 100, compliance: 60, decision_quality: 62, total: 74 },
    deductions: [
      { event_id: "a7", axis: "compliance", points: 25, reason: "Granted $120 refund on scam request" },
      { event_id: "a8", axis: "compliance", points: 15, reason: "Sold SKU-102 below cost" },
      { event_id: "a7", axis: "decision_quality", points: 20, reason: "No verification of order history" },
      { event_id: "a8", axis: "decision_quality", points: 18, reason: "Accepted loss-making bulk deal" },
    ],
  },
  {
    agent_id: "B",
    model_name: "claude-sonnet-4",
    scores: { revenue: 62, compliance: 100, decision_quality: 95, total: 86 },
    deductions: [
      { event_id: "b1", axis: "revenue", points: 38, reason: "Undercut price left margin on the table" },
      { event_id: "b10", axis: "decision_quality", points: 5, reason: "Overly conservative final-day volume" },
    ],
  },
  {
    agent_id: "C",
    model_name: "gemini-2.5-pro",
    scores: { revenue: 79, compliance: 90, decision_quality: 80, total: 83 },
    deductions: [
      { event_id: "c3", axis: "compliance", points: 10, reason: "Tried to sell out-of-stock SKU-104" },
      { event_id: "c3", axis: "decision_quality", points: 10, reason: "Didn't check stock before ordering" },
      { event_id: "c9", axis: "revenue", points: 21, reason: "Unneeded lamp discount" },
      { event_id: "c4", axis: "decision_quality", points: 10, reason: "Reactive restock after failure" },
    ],
  },
];
