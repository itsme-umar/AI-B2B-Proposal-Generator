"use client";

import { useState, FormEvent } from "react";
import type { ProposalInput } from "@/types/proposal";

const DEFAULT_CATEGORIES = [
  "Office Supplies",
  "Drinkware",
  "Apparel",
  "Bags",
  "Tech",
  "Food & Beverage",
  "Home & Living",
];

interface ProposalFormProps {
  onSubmit: (input: ProposalInput) => Promise<void>;
  isSubmitting: boolean;
}

export default function ProposalForm({ onSubmit, isSubmitting }: ProposalFormProps) {
  const [clientName, setClientName] = useState("");
  const [industry, setIndustry] = useState("");
  const [sustainabilityGoals, setSustainabilityGoals] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [categoryInput, setCategoryInput] = useState("");

  const toggleCategory = (cat: string) => {
    setPreferredCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const addCustomCategory = () => {
    const trimmed = categoryInput.trim();
    if (trimmed && !preferredCategories.includes(trimmed)) {
      setPreferredCategories((prev) => [...prev, trimmed]);
      setCategoryInput("");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const budget = parseFloat(totalBudget);
    if (Number.isNaN(budget) || budget <= 0) {
      return;
    }
    await onSubmit({
      client_name: clientName.trim(),
      industry: industry.trim(),
      sustainability_goals: sustainabilityGoals.trim(),
      total_budget: budget,
      preferred_categories:
        preferredCategories.length > 0 ? preferredCategories : undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="mb-6 text-xl font-semibold text-slate-800">
        Client & requirements
      </h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="client_name"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Client Name
          </label>
          <input
            id="client_name"
            type="text"
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="e.g. GreenTech Corp"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <label
            htmlFor="industry"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Industry
          </label>
          <input
            id="industry"
            type="text"
            required
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. Corporate Offices"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <label
            htmlFor="sustainability_goals"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Sustainability Goals
          </label>
          <textarea
            id="sustainability_goals"
            required
            rows={3}
            value={sustainabilityGoals}
            onChange={(e) => setSustainabilityGoals(e.target.value)}
            placeholder="e.g. Reduce plastic waste and improve eco-friendly branding"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <label
            htmlFor="total_budget"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Total Budget
          </label>
          <input
            id="total_budget"
            type="number"
            required
            min={1}
            step={1}
            value={totalBudget}
            onChange={(e) => setTotalBudget(e.target.value)}
            placeholder="e.g. 10000"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Preferred Product Categories (optional)
          </span>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  preferredCategories.includes(cat)
                    ? "bg-primary-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomCategory())}
              placeholder="Add custom category"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={addCustomCategory}
              className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
            >
              Add
            </button>
          </div>
          {preferredCategories.length > 0 && (
            <p className="mt-1 text-xs text-slate-500">
              Selected: {preferredCategories.join(", ")}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="notes"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Additional Notes
          </label>
          <textarea
            id="notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any other requirements or context"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-primary-600 px-4 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Generating proposal…" : "Generate proposal"}
        </button>
      </div>
    </form>
  );
}
