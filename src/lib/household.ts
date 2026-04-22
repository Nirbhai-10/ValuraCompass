import { prisma } from "./prisma";
import { getSession } from "./auth";

export async function listHouseholdsForUser(userId: string) {
  const memberships = await prisma.householdMembership.findMany({
    where: { userId },
    include: { household: true },
    orderBy: { createdAt: "desc" },
  });
  return memberships.map((m) => m.household);
}

export async function getHouseholdForUser(userId: string, householdId: string) {
  const m = await prisma.householdMembership.findUnique({
    where: { householdId_userId: { householdId, userId } },
  });
  if (!m) return null;
  const h = await prisma.household.findUnique({
    where: { id: householdId },
    include: {
      persons: { orderBy: { createdAt: "asc" } },
      incomes: true,
      expenses: true,
      assets: { include: { nominees: true } },
      liabilities: true,
      policies: { include: { insured: true } },
      goals: true,
      tasks: true,
      documents: true,
      scenarios: true,
      taxProfile: true,
      riskProfile: true,
      estateProfile: true,
      behaviorProfile: true,
      assumptionOverride: true,
    },
  });
  return h;
}

export async function requireHousehold(householdId: string) {
  const s = await getSession();
  if (!s) throw new Error("UNAUTHORIZED");
  const h = await getHouseholdForUser(s.userId, householdId);
  if (!h) throw new Error("FORBIDDEN");
  return { session: s, household: h };
}
