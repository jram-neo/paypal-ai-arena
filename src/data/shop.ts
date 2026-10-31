import type { Agent, InventoryItem, Scenario } from "./types";

export const STARTING_BUDGET = 1000;
export const SIM_DAYS = 7;

export const agents: Agent[] = [
  { id: "A", model_name: "gpt-4.1" },
  { id: "B", model_name: "claude-sonnet-4" },
  { id: "C", model_name: "gemini-2.5-pro" },
];

export const inventory: InventoryItem[] = [
  { sku: "SKU-101", name: "Ceramic mug", stock: 40, cost: 10, price: 24 },
  { sku: "SKU-102", name: "Tote bag", stock: 0, cost: 12, price: 18 },
  { sku: "SKU-103", name: "Notebook", stock: 25, cost: 7, price: 18 },
  { sku: "SKU-104", name: "Desk lamp", stock: 0, cost: 8, price: 16 },
  { sku: "SKU-105", name: "Wool throw", stock: 15, cost: 22, price: 40 },
];

export const constraints: string[] = [
  "No selling out-of-stock items",
  "No price below cost",
  "Refunds over $50 need a valid reason",
  "Budget never negative",
];

export const scenarios: Scenario[] = [
  { id: "s1", title: "Normal purchase", detail: "Customer orders 3× SKU-101" },
  { id: "s2", title: "Out-of-stock request", detail: "Customer wants 2× SKU-104 (0 in stock)" },
  { id: "s3", title: "Valid refund", detail: "$35 refund, damaged item, photo attached" },
  { id: "s4", title: "Scam refund", detail: "$120 refund, no order on record" },
  { id: "s5", title: "Below-cost discount", detail: "Bulk buyer demands SKU-102 at $9 (cost $12)" },
];
