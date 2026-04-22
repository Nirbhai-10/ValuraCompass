export type RegionId = "IN" | "GCC" | "GLOBAL";

export interface RegionPack {
  id: RegionId;
  displayName: string;
  currencyDefault: string;
  locale: string;
  numericFormat: "LAKH_CRORE" | "INTERNATIONAL";
  assumptions: {
    retirementAge: number;
    longevity: number;
    inflationGeneral: number;
    inflationHealthcare: number;
    inflationEducation: number;
    equityNominalReturn: number;
    debtNominalReturn: number;
    goldNominalReturn: number;
    realEstateAppreciation: number;
    wageGrowth: number;
  };
  disclosures: {
    taxObservation: string;
    general: string;
  };
  instruments: {
    retirement: string[];
    savingsLinkedInsurance: string[];
  };
}

export const REGION_PACKS: Record<RegionId, RegionPack> = {
  IN: {
    id: "IN",
    displayName: "India",
    currencyDefault: "INR",
    locale: "en-IN",
    numericFormat: "LAKH_CRORE",
    assumptions: {
      retirementAge: 60,
      longevity: 85,
      inflationGeneral: 0.06,
      inflationHealthcare: 0.10,
      inflationEducation: 0.08,
      equityNominalReturn: 0.11,
      debtNominalReturn: 0.065,
      goldNominalReturn: 0.07,
      realEstateAppreciation: 0.05,
      wageGrowth: 0.07,
    },
    disclosures: {
      taxObservation:
        "Planning observation only. Not tax, legal, or investment advice. Review specific facts with your CA.",
      general:
        "Compass is a planning intelligence tool. Outputs are observations based on the data you provide and the active assumption set.",
    },
    instruments: {
      retirement: ["EPF", "PPF", "NPS", "SSY", "SCSS"],
      savingsLinkedInsurance: ["ULIP", "ENDOWMENT"],
    },
  },
  GCC: {
    id: "GCC",
    displayName: "GCC",
    currencyDefault: "AED",
    locale: "en-AE",
    numericFormat: "INTERNATIONAL",
    assumptions: {
      retirementAge: 60,
      longevity: 85,
      inflationGeneral: 0.025,
      inflationHealthcare: 0.06,
      inflationEducation: 0.06,
      equityNominalReturn: 0.07,
      debtNominalReturn: 0.03,
      goldNominalReturn: 0.05,
      realEstateAppreciation: 0.03,
      wageGrowth: 0.04,
    },
    disclosures: {
      taxObservation:
        "Planning observation only. Cross-border and local tax rules require a qualified specialist.",
      general: "Compass is a planning intelligence tool. Outputs are observations only.",
    },
    instruments: {
      retirement: ["EOSB", "PENSION"],
      savingsLinkedInsurance: ["WHOLE_LIFE", "ENDOWMENT"],
    },
  },
  GLOBAL: {
    id: "GLOBAL",
    displayName: "Global",
    currencyDefault: "USD",
    locale: "en-US",
    numericFormat: "INTERNATIONAL",
    assumptions: {
      retirementAge: 65,
      longevity: 90,
      inflationGeneral: 0.03,
      inflationHealthcare: 0.06,
      inflationEducation: 0.06,
      equityNominalReturn: 0.07,
      debtNominalReturn: 0.03,
      goldNominalReturn: 0.05,
      realEstateAppreciation: 0.03,
      wageGrowth: 0.03,
    },
    disclosures: {
      taxObservation:
        "Planning observation only. Please consult a qualified local tax professional.",
      general: "Compass is a planning intelligence tool. Outputs are observations only.",
    },
    instruments: {
      retirement: ["PENSION", "RETIREMENT_ACCOUNT"],
      savingsLinkedInsurance: ["WHOLE_LIFE"],
    },
  },
};

export function getRegion(id: string | undefined | null): RegionPack {
  const r = (id ?? "IN") as RegionId;
  return REGION_PACKS[r] ?? REGION_PACKS.IN;
}
