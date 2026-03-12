import type { ProposalDocument } from "@/types/proposal";
import BudgetTable from "./BudgetTable";
import ProductMixCard from "./ProductMixCard";

interface ProposalResultProps {
  proposal: ProposalDocument;
}

export default function ProposalResult({ proposal }: ProposalResultProps) {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-xl font-semibold text-slate-800">
          Proposal for {proposal.client_name}
        </h2>
        <p className="text-sm text-slate-500">
          {proposal.industry} · Saved {new Date(proposal.created_at).toLocaleString()}
        </p>
      </div>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-slate-800">
          Sustainable product mix
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {proposal.product_mix.map((product, i) => (
            <ProductMixCard key={i} product={product} index={i} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-slate-800">
          Budget & cost breakdown
        </h3>
        <BudgetTable
          budgetAllocation={proposal.budget_allocation}
          estimatedCostBreakdown={proposal.estimated_cost_breakdown}
          totalBudget={proposal.total_budget}
        />
      </section>

      <section>
        <h3 className="mb-3 text-lg font-semibold text-slate-800">
          Impact positioning summary
        </h3>
        <div className="rounded-xl border border-slate-200 bg-primary-50/50 p-4 text-slate-700 leading-relaxed">
          {proposal.impact_summary}
        </div>
      </section>
    </div>
  );
}
