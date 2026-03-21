import { NextRequest, NextResponse } from "next/server";
import type { ProposalInput } from "@/types/proposal";
import type { GenerateProposalErrorResponse } from "@/types/proposal";
import connectDB from "@/lib/mongodb";
import { generateProposalWithGemini } from "@/lib/gemini";
import { parseAndValidateProposalJson, stripJsonFences } from "@/utils/jsonValidator";
import Proposal from "@/models/Proposal";

function parseBody(body: unknown): ProposalInput | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  if (
    typeof o.client_name !== "string" ||
    typeof o.industry !== "string" ||
    typeof o.sustainability_goals !== "string" ||
    typeof o.total_budget !== "number" ||
    Number.isNaN(o.total_budget) ||
    o.total_budget <= 0
  ) {
    return null;
  }
  const preferred_categories = Array.isArray(o.preferred_categories)
    ? (o.preferred_categories as string[]).filter((c) => typeof c === "string")
    : [];
  const notes = typeof o.notes === "string" ? o.notes : undefined;
  return {
    client_name: o.client_name,
    industry: o.industry,
    sustainability_goals: o.sustainability_goals,
    total_budget: o.total_budget,
    preferred_categories: preferred_categories.length ? preferred_categories : undefined,
    notes: notes || undefined,
  };
}

function errorResponse(
  message: string,
  status: number,
  code?: string
): NextResponse<GenerateProposalErrorResponse> {
  return NextResponse.json(
    { success: false, error: message, code },
    { status }
  );
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request body", 400, "INVALID_JSON");
  }

  const input = parseBody(body);
  if (!input) {
    return errorResponse(
      "Missing or invalid fields: client_name, industry, sustainability_goals, total_budget (positive number) required",
      400,
      "VALIDATION_ERROR"
    );
  }

  let rawAiResponse: string;
  try {
    rawAiResponse = await generateProposalWithGemini(input);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Gemini API error";
    return errorResponse(`AI generation failed: ${message}`, 502, "GEMINI_ERROR");
  }

  const cleaned = stripJsonFences(rawAiResponse);
  let parsed;
  try {
    parsed = parseAndValidateProposalJson(cleaned);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid AI response structure";
    return errorResponse(`Invalid proposal JSON: ${message}`, 502, "INVALID_AI_JSON");
  }

  const totalAllocated = parsed.budget_allocation.reduce(
    (sum, row) => sum + row.allocated_budget,
    0
  );
  if (totalAllocated > input.total_budget + 0.01) {
    return errorResponse(
      "Budget allocation exceeds total budget",
      400,
      "BUDGET_EXCEEDED"
    );
  }

  try {
    await connectDB();
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Database connection failed";
    return errorResponse(
      `MongoDB error: ${message}`,
      503,
      "MONGODB_ERROR"
    );
  }

  const doc = await Proposal.create({
    client_name: input.client_name,
    industry: input.industry,
    sustainability_goals: input.sustainability_goals,
    total_budget: input.total_budget,
    preferred_categories: input.preferred_categories ?? [],
    product_mix: parsed.sustainable_product_mix,
    budget_allocation: parsed.budget_allocation,
    estimated_cost_breakdown: parsed.estimated_cost_breakdown,
    impact_summary: parsed.impact_positioning_summary,
  });

  const proposal = {
    _id: doc._id.toString(),
    client_name: doc.client_name,
    industry: doc.industry,
    sustainability_goals: doc.sustainability_goals,
    total_budget: doc.total_budget,
    preferred_categories: doc.preferred_categories,
    product_mix: doc.product_mix,
    budget_allocation: doc.budget_allocation,
    estimated_cost_breakdown: doc.estimated_cost_breakdown,
    impact_summary: doc.impact_summary,
    created_at: doc.created_at,
  };

  return NextResponse.json({ success: true, proposal });
}
