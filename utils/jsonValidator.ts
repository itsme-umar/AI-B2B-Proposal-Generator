import type { AIProposalResponse } from "@/types/proposal";

function isNonEmptyArray(arr: unknown): arr is unknown[] {
  return Array.isArray(arr) && arr.length >= 0;
}

function isSustainableProductItem(obj: unknown): obj is AIProposalResponse["sustainable_product_mix"][0] {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.product_name === "string" &&
    typeof o.category === "string" &&
    typeof o.reason === "string"
  );
}

function isBudgetAllocationItem(obj: unknown): obj is AIProposalResponse["budget_allocation"][0] {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.category === "string" &&
    typeof o.allocated_budget === "number" &&
    !Number.isNaN(o.allocated_budget)
  );
}

function isCostBreakdownItem(obj: unknown): obj is AIProposalResponse["estimated_cost_breakdown"][0] {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.item === "string" &&
    typeof o.estimated_cost === "number" &&
    !Number.isNaN(o.estimated_cost)
  );
}

/**
 * Parses and validates the AI response into AIProposalResponse.
 * Throws with a message if invalid.
 */
export function parseAndValidateProposalJson(raw: string): AIProposalResponse {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON from AI response");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("AI response is not an object");
  }

  const o = parsed as Record<string, unknown>;

  if (!isNonEmptyArray(o.sustainable_product_mix)) {
    throw new Error("Missing or invalid sustainable_product_mix");
  }
  if (!o.sustainable_product_mix.every(isSustainableProductItem)) {
    throw new Error("Invalid item in sustainable_product_mix");
  }

  if (!isNonEmptyArray(o.budget_allocation)) {
    throw new Error("Missing or invalid budget_allocation");
  }
  if (!o.budget_allocation.every(isBudgetAllocationItem)) {
    throw new Error("Invalid item in budget_allocation");
  }

  if (!isNonEmptyArray(o.estimated_cost_breakdown)) {
    throw new Error("Missing or invalid estimated_cost_breakdown");
  }
  if (!o.estimated_cost_breakdown.every(isCostBreakdownItem)) {
    throw new Error("Invalid item in estimated_cost_breakdown");
  }

  if (typeof o.impact_positioning_summary !== "string") {
    throw new Error("Missing or invalid impact_positioning_summary");
  }

  const totalAllocated = (o.budget_allocation as { allocated_budget: number }[]).reduce(
    (sum, row) => sum + row.allocated_budget,
    0
  );

  const totalBreakdown = (o.estimated_cost_breakdown as { estimated_cost: number }[]).reduce(
    (sum, row) => sum + row.estimated_cost,
    0
  );

  if (totalAllocated > 0 && totalBreakdown > 0 && Math.abs(totalAllocated - totalBreakdown) > 0.01) {
    throw new Error("Budget allocation and cost breakdown totals do not match");
  }

  return {
    sustainable_product_mix: o.sustainable_product_mix,
    budget_allocation: o.budget_allocation,
    estimated_cost_breakdown: o.estimated_cost_breakdown,
    impact_positioning_summary: o.impact_positioning_summary,
  };
}

/**
 * Strip markdown code fences if the model wrapped JSON in ```json ... ```
 */
export function stripJsonFences(text: string): string {
  let out = text.trim();
  const jsonBlock = /^```(?:json)?\s*([\s\S]*?)```\s*$/;
  const match = out.match(jsonBlock);
  if (match) {
    out = match[1].trim();
  }
  return out;
}
