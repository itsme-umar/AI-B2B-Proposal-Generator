"use client";

import { useState, useCallback } from "react";
import type { ProposalInput, ProposalDocument, GenerateProposalResponse } from "@/types/proposal";
import ProposalForm from "@/components/ProposalForm";
import ProposalResult from "@/components/ProposalResult";

export default function Home() {
  const [proposal, setProposal] = useState<ProposalDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (input: ProposalInput) => {
    setError(null);
    setProposal(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data: GenerateProposalResponse = await res.json();
      if (!res.ok) {
        setError(
          data.success === false ? data.error : "Something went wrong"
        );
        return;
      }
      if (data.success && data.proposal) {
        setProposal(data.proposal);
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Network or server error"
      );
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <h1 className="text-2xl font-bold text-slate-900">
            AI B2B Proposal Generator
          </h1>
          <p className="mt-1 text-slate-600">
            Generate sustainability-focused product proposals for your B2B clients
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr,1.2fr]">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <ProposalForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </aside>

          <div>
            {error && (
              <div
                className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
                role="alert"
              >
                <strong>Error:</strong> {error}
              </div>
            )}
            {proposal && <ProposalResult proposal={proposal} />}
            {!proposal && !error && !isSubmitting && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center text-slate-500">
                <p>Submit the form to generate a proposal.</p>
                <p className="mt-1 text-sm">
                  Results will appear here and be saved to the database.
                </p>
              </div>
            )}
            {isSubmitting && (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
                <p className="mt-4 text-slate-600">Generating your proposal…</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
