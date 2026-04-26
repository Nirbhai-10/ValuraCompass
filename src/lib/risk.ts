import { RiskBand } from "./types";

export interface RiskQuestion {
  id: string;
  prompt: string;
  hint?: string;
  options: { label: string; score: number }[];
}

export const RISK_QUESTIONS: RiskQuestion[] = [
  {
    id: "horizon",
    prompt: "When will you need most of this money?",
    options: [
      { label: "Within 2 years", score: 0 },
      { label: "2 to 5 years", score: 1 },
      { label: "5 to 10 years", score: 3 },
      { label: "10 to 20 years", score: 4 },
      { label: "20+ years (retirement / legacy)", score: 4 },
    ],
  },
  {
    id: "drawdown",
    prompt: "If your portfolio fell 30% in a year, you'd…",
    options: [
      { label: "Sell everything to stop the bleeding", score: 0 },
      { label: "Sell some to feel safer", score: 1 },
      { label: "Hold and wait it out", score: 3 },
      { label: "Buy more — markets are on sale", score: 4 },
    ],
  },
  {
    id: "knowledge",
    prompt: "How would you describe your investing knowledge?",
    options: [
      { label: "New to it; relying on guidance", score: 0 },
      { label: "Comfortable with basics", score: 2 },
      { label: "Familiar with most asset classes", score: 3 },
      { label: "Sophisticated — I follow markets actively", score: 4 },
    ],
  },
  {
    id: "dependents",
    prompt: "How dependent are others on this money?",
    options: [
      { label: "Many dependents, including elders", score: 0 },
      { label: "Spouse + young kids", score: 1 },
      { label: "Spouse only / older kids", score: 3 },
      { label: "Just me", score: 4 },
    ],
  },
  {
    id: "income",
    prompt: "How stable is your household income?",
    options: [
      { label: "Variable / between roles", score: 0 },
      { label: "Mostly stable, some variability", score: 2 },
      { label: "Very stable salary", score: 3 },
      { label: "Two stable incomes", score: 4 },
    ],
  },
  {
    id: "reaction",
    prompt: "Returns vs. peace of mind — which matters more right now?",
    options: [
      { label: "Peace of mind, even if returns are low", score: 0 },
      { label: "Some growth, very limited losses", score: 1 },
      { label: "Strong growth, moderate ups and downs", score: 3 },
      { label: "Maximum growth, accepting big swings", score: 4 },
    ],
  },
];

const MAX_SCORE = RISK_QUESTIONS.reduce(
  (s, q) => s + Math.max(...q.options.map((o) => o.score)),
  0,
);

export function scoreAnswers(answers: Record<string, number>): number {
  const total = RISK_QUESTIONS.reduce((s, q) => s + (answers[q.id] ?? 0), 0);
  return Math.round((total / MAX_SCORE) * 100);
}

export function bandFromScore(rps: number): RiskBand {
  if (rps < 20) return "CONSERVATIVE";
  if (rps < 40) return "MOD_CONSERVATIVE";
  if (rps < 60) return "BALANCED";
  if (rps < 80) return "GROWTH";
  return "AGGRESSIVE";
}

export function bandRationale(band: RiskBand): string {
  switch (band) {
    case "CONSERVATIVE":
      return "Capital preservation first. Heavy on cash and high-quality debt; small equity sleeve at most.";
    case "MOD_CONSERVATIVE":
      return "Stable core with a modest growth wing. Suits short to medium horizons or low risk capacity.";
    case "BALANCED":
      return "Roughly half growth, half stable. Tolerates moderate volatility for moderate growth.";
    case "GROWTH":
      return "Tilted to equity for long-horizon compounding. Expect double-digit drawdowns occasionally.";
    case "AGGRESSIVE":
      return "Equity-heavy, often with international or thematic tilts. Long horizon and steady income required.";
  }
}
