import mongoose, { Schema, model, models } from "mongoose";
import type { SustainableProductItem, BudgetAllocationItem, CostBreakdownItem } from "@/types/proposal";

const SustainableProductItemSchema = new Schema<SustainableProductItem>(
  {
    product_name: { type: String, required: true },
    category: { type: String, required: true },
    reason: { type: String, required: true },
  },
  { _id: false }
);

const BudgetAllocationItemSchema = new Schema<BudgetAllocationItem>(
  {
    category: { type: String, required: true },
    allocated_budget: { type: Number, required: true },
  },
  { _id: false }
);

const CostBreakdownItemSchema = new Schema<CostBreakdownItem>(
  {
    item: { type: String, required: true },
    estimated_cost: { type: Number, required: true },
  },
  { _id: false }
);

const ProposalSchema = new Schema(
  {
    client_name: { type: String, required: true },
    industry: { type: String, required: true },
    sustainability_goals: { type: String, required: true },
    total_budget: { type: Number, required: true },
    preferred_categories: { type: [String], default: [] },
    product_mix: { type: [SustainableProductItemSchema], required: true },
    budget_allocation: { type: [BudgetAllocationItemSchema], required: true },
    estimated_cost_breakdown: { type: [CostBreakdownItemSchema], required: true },
    impact_summary: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

const Proposal = models.Proposal ?? model("Proposal", ProposalSchema);

export default Proposal;
