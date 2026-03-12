/**
 * User input for generating a proposal
 */
export interface ProposalInput {
  client_name: string;
  industry: string;
  sustainability_goals: string;
  total_budget: number;
  preferred_categories?: string[];
  notes?: string;
}

/**
 * Product item in the sustainable mix
 */
export interface SustainableProductItem {
  product_name: string;
  category: string;
  reason: string;
}

/**
 * Budget allocation per category
 */
export interface BudgetAllocationItem {
  category: string;
  allocated_budget: number;
}

/**
 * Cost breakdown item
 */
export interface CostBreakdownItem {
  item: string;
  estimated_cost: number;
}

/**
 * AI (Gemini) response shape – must match prompt output
 */
export interface AIProposalResponse {
  sustainable_product_mix: SustainableProductItem[];
  budget_allocation: BudgetAllocationItem[];
  estimated_cost_breakdown: CostBreakdownItem[];
  impact_positioning_summary: string;
}

/**
 * MongoDB document for a saved proposal
 */
export interface ProposalDocument {
  _id: string;
  client_name: string;
  industry: string;
  sustainability_goals: string;
  total_budget: number;
  preferred_categories: string[];
  product_mix: SustainableProductItem[];
  budget_allocation: BudgetAllocationItem[];
  estimated_cost_breakdown: CostBreakdownItem[];
  impact_summary: string;
  created_at: Date;
}

/**
 * API success response
 */
export interface GenerateProposalSuccessResponse {
  success: true;
  proposal: ProposalDocument;
}

/**
 * API error response
 */
export interface GenerateProposalErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export type GenerateProposalResponse =
  | GenerateProposalSuccessResponse
  | GenerateProposalErrorResponse;
