import type { BudgetAllocationItem, CostBreakdownItem } from "@/types/proposal";

interface BudgetTableProps {
  budgetAllocation: BudgetAllocationItem[];
  estimatedCostBreakdown: CostBreakdownItem[];
  totalBudget: number;
}

export default function BudgetTable({
  budgetAllocation,
  estimatedCostBreakdown,
  totalBudget,
}: BudgetTableProps) {
  const allocationTotal = budgetAllocation.reduce(
    (sum, row) => sum + row.allocated_budget,
    0
  );
  const breakdownTotal = estimatedCostBreakdown.reduce(
    (sum, row) => sum + row.estimated_cost,
    0
  );

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h3 className="font-semibold text-slate-800">Budget allocation</h3>
          <p className="text-sm text-slate-500">
            Total budget: {formatCurrency(totalBudget)}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                  Category
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">
                  Allocated
                </th>
              </tr>
            </thead>
            <tbody>
              {budgetAllocation.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-100 hover:bg-slate-50/50"
                >
                  <td className="px-4 py-3 text-slate-800">{row.category}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-800">
                    {formatCurrency(row.allocated_budget)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-medium">
                <td className="px-4 py-3 text-slate-800">Total</td>
                <td className="px-4 py-3 text-right text-slate-800">
                  {formatCurrency(allocationTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h3 className="font-semibold text-slate-800">
            Estimated cost breakdown
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                  Item
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">
                  Estimated cost
                </th>
              </tr>
            </thead>
            <tbody>
              {estimatedCostBreakdown.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-100 hover:bg-slate-50/50"
                >
                  <td className="px-4 py-3 text-slate-800">{row.item}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-800">
                    {formatCurrency(row.estimated_cost)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-medium">
                <td className="px-4 py-3 text-slate-800">Total</td>
                <td className="px-4 py-3 text-right text-slate-800">
                  {formatCurrency(breakdownTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
