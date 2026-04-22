import { getRegion, type RegionPack } from "./region";
import { prisma } from "./prisma";
import { safeJSONParse } from "./utils";

export interface Assumptions {
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
}

export async function getAssumptions(householdId: string, region: string): Promise<{ base: Assumptions; overrides: Partial<Assumptions>; effective: Assumptions; regionPack: RegionPack }> {
  const regionPack = getRegion(region);
  const base: Assumptions = { ...regionPack.assumptions };
  const row = await prisma.assumptionOverride.findUnique({ where: { householdId } });
  const overrides = safeJSONParse<Partial<Assumptions>>(row?.data, {});
  const effective: Assumptions = { ...base, ...overrides };
  return { base, overrides, effective, regionPack };
}

export async function saveAssumptionOverrides(householdId: string, overrides: Partial<Assumptions>): Promise<void> {
  await prisma.assumptionOverride.upsert({
    where: { householdId },
    create: { householdId, data: JSON.stringify(overrides) },
    update: { data: JSON.stringify(overrides) },
  });
}
