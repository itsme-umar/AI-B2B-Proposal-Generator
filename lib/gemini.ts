import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ProposalInput } from "@/types/proposal";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set. AI generation will fail.");
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

/** Stable model ID — 1.5 Flash was retired from the API; see https://ai.google.dev/gemini-api/docs/models/gemini */
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

function getGeminiModelId(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

const PROMPT_TEMPLATE = `You are a sustainability consultant creating B2B proposals.

Generate a sustainable product proposal based on the client's requirements.

Your proposal must include:
- Sustainable product mix
- Budget allocation within the provided budget
- Estimated cost breakdown
- Impact positioning summary explaining the sustainability benefits

Rules:
- Do not exceed the provided total budget
- Prioritize eco-friendly and sustainable products
- Return ONLY valid JSON.

Client details:
- Client Name: {{client_name}}
- Industry: {{industry}}
- Sustainability Goals: {{sustainability_goals}}
- Total Budget: {{total_budget}}
- Preferred Categories: {{preferred_categories}}
- Additional Notes: {{notes}}

Return ONLY a single JSON object with this exact structure (no markdown, no code fences, no explanation):
{
  "sustainable_product_mix": [
    { "product_name": "string", "category": "string", "reason": "string" }
  ],
  "budget_allocation": [
    { "category": "string", "allocated_budget": number }
  ],
  "estimated_cost_breakdown": [
    { "item": "string", "estimated_cost": number }
  ],
  "impact_positioning_summary": "string"
}`;

function buildPrompt(input: ProposalInput): string {
  return PROMPT_TEMPLATE.replace("{{client_name}}", input.client_name)
    .replace("{{industry}}", input.industry)
    .replace("{{sustainability_goals}}", input.sustainability_goals)
    .replace("{{total_budget}}", String(input.total_budget))
    .replace(
      "{{preferred_categories}}",
      (input.preferred_categories ?? []).length
        ? input.preferred_categories!.join(", ")
        : "Any (suggest based on goals)"
    )
    .replace("{{notes}}", input.notes ?? "None");
}

export async function generateProposalWithGemini(
  input: ProposalInput
): Promise<string> {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const model = genAI.getGenerativeModel({ model: getGeminiModelId() });
  const prompt = buildPrompt(input);

  const result = await model.generateContent(prompt);
  const response = result.response;

  if (!response || !response.text) {
    throw new Error("Gemini returned an empty response");
  }

  return response.text().trim();
}
