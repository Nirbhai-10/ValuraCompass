import type { ScoreSet } from "./types";
import type { HouseholdBundle } from "./engine";

export type SuitabilityDecision = "ALLOWED" | "FLAGGED" | "RESTRICTED";

export interface SuitabilityRow {
  category: string;
  label: string;
  decision: SuitabilityDecision;
  reason: string;
}

const RPS_RANK: Record<string, number> = {
  Conservative: 1,
  "Moderately Conservative": 2,
  Balanced: 3,
  Growth: 4,
  Aggressive: 5,
};

export function categorySuitability(h: HouseholdBundle, scores: ScoreSet): SuitabilityRow[] {
  const rps = scores.RPS.band;
  const rpsRank = RPS_RANK[rps] ?? 3;
  const liquidityOK = scores.LAS.value >= 50;
  const dependencyOK = scores.FDRS.value >= 60;

  const rows: SuitabilityRow[] = [];

  const push = (category: string, label: string, decision: SuitabilityDecision, reason: string) =>
    rows.push({ category, label, decision, reason });

  push("LIQUID", "Liquid / Arbitrage / Short debt", "ALLOWED", "Suits all profiles with appropriate cash floor maintained.");
  push(
    "LARGE_CAP_EQUITY",
    "Large-cap / Flexi-cap equity MF",
    rpsRank >= 3 ? "ALLOWED" : rpsRank === 2 ? "FLAGGED" : "RESTRICTED",
    rpsRank >= 3 ? "Fit for Balanced and above." : rpsRank === 2 ? "Cap suitable allocation given Mod. Conservative profile." : "Restricted for Conservative profile.",
  );
  push(
    "MID_SMALL_EQUITY",
    "Mid / Small-cap equity MF",
    rpsRank >= 4 ? "ALLOWED" : "FLAGGED",
    rpsRank >= 4 ? "Fit for Growth and above." : "Capacity and horizon caps apply; restrict single-scheme exposure.",
  );
  push(
    "THEMATIC",
    "Thematic / Sectoral",
    rpsRank >= 4 && dependencyOK ? "ALLOWED" : "FLAGGED",
    rpsRank >= 4 && dependencyOK ? "Allowed with dependency capacity." : "Dependency or RPS constraint.",
  );
  push(
    "INTL_FUNDS",
    "International equity funds",
    rpsRank >= 3 ? "ALLOWED" : "FLAGGED",
    "Currency-horizon fit required; allowed for Balanced and above.",
  );
  push("GOLD", "Gold (physical / SGB / ETF)", "ALLOWED", "Allowed with upper cap on share of total.");
  push(
    "DIRECT_EQUITY",
    "Direct equity",
    rpsRank >= 4 ? "ALLOWED" : "FLAGGED",
    "Concentration caps and complexity tolerance required.",
  );
  push(
    "PMS_AIF12",
    "PMS / AIF Cat I-II",
    rpsRank >= 4 && liquidityOK ? "ALLOWED" : "RESTRICTED",
    "Net-worth and liquidity thresholds apply.",
  );
  push(
    "AIF3",
    "AIF Cat III",
    rpsRank >= 5 && liquidityOK ? "ALLOWED" : "RESTRICTED",
    "Aggressive profiles only with strict thresholds.",
  );
  push(
    "REIT_INVIT",
    "REIT / InvIT",
    rpsRank >= 3 && liquidityOK ? "ALLOWED" : "FLAGGED",
    "Liquidity fit required.",
  );
  push(
    "UNLISTED",
    "Unlisted equity",
    rpsRank >= 5 && liquidityOK ? "ALLOWED" : "RESTRICTED",
    "Strict thresholds and override note required.",
  );
  push("ULIP", "ULIP (new)", "FLAGGED", "Allowed only if protection already adequate. Evaluate product economics first.");
  push("ENDOWMENT", "Endowment / traditional savings", "FLAGGED", "Typically low protection-per-rupee; use with explicit savings preference acknowledgment.");
  push("TERM_INSURANCE", "Term insurance", "ALLOWED", "Protection category; suitability not restricted subject to underwriting.");
  return rows;
}
