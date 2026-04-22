"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import type { BasicState } from "./wizard";

function up(householdId: string, taskType: string, title: string, body: string, priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "MEDIUM") {
  return prisma.task.create({
    data: {
      householdId,
      title,
      body,
      type: taskType,
      ownerType: "CLIENT",
      priority,
      createdBy: "SYSTEM",
    },
  });
}

export async function applyBasicAction(
  householdId: string,
  state: BasicState,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  const m = await prisma.householdMembership.findUnique({
    where: { householdId_userId: { householdId, userId: session.userId } },
  });
  if (!m) return { ok: false, error: "FORBIDDEN" };

  const h = await prisma.household.findUnique({
    where: { id: householdId },
    include: { persons: true, incomes: true, expenses: true, assets: true, liabilities: true, policies: true, goals: true },
  });
  if (!h) return { ok: false, error: "Household not found" };

  // Upsert primary person
  let primary = h.persons.find((p) => p.isPrimary) ?? h.persons[0];
  if (!primary) {
    primary = await prisma.person.create({
      data: {
        householdId,
        fullName: state.primaryName || "Primary",
        isPrimary: true,
      },
    });
  } else {
    await prisma.person.update({
      where: { id: primary.id },
      data: {
        fullName: state.primaryName || primary.fullName,
        preferredName: state.primaryName?.split(" ")[0] ?? primary.preferredName,
        dob: state.dob ? new Date(state.dob) : primary.dob,
        maritalStatus: state.maritalStatus,
        employmentType: state.employmentType,
        isPrimary: true,
        intendedRetirementAge: state.retirementAge || primary.intendedRetirementAge,
        riskAttitudeStated: state.riskComfort || primary.riskAttitudeStated,
      },
    });
  }

  // Dependents: ensure count matches by adding generic dependent persons if missing.
  const existingDeps = h.persons.filter((p) => p.isDependent).length;
  const toAdd = Math.max(0, state.dependents - existingDeps);
  for (let i = 0; i < toAdd; i++) {
    await prisma.person.create({
      data: {
        householdId,
        fullName: `Dependent ${existingDeps + i + 1}`,
        isDependent: true,
      },
    });
  }

  // Income — if none exists and state.monthlyNetIncome > 0, create a "Basic aggregate" salary
  const totalExistingIncome = h.incomes.reduce((s, i) => s + i.amountMonthly, 0);
  if (Math.abs(totalExistingIncome - state.monthlyNetIncome) > 0.5) {
    // Simple strategy: if the aggregate differs materially, recreate a single aggregate
    if (h.incomes.length <= 1) {
      if (h.incomes[0]) {
        await prisma.income.update({
          where: { id: h.incomes[0].id },
          data: { amountMonthly: state.monthlyNetIncome, type: h.incomes[0].type, label: "Basic aggregate" },
        });
      } else if (state.monthlyNetIncome > 0) {
        await prisma.income.create({
          data: {
            householdId,
            personId: primary.id,
            label: "Basic aggregate",
            type: "SALARY",
            amountMonthly: state.monthlyNetIncome,
            currency: h.currency,
            variability: "STABLE",
          },
        });
      }
    }
    // If multiple existing incomes, don't overwrite them; trust what's in Advanced.
  }

  // Expenses — replace Basic aggregate lines
  await prisma.expense.deleteMany({ where: { householdId, label: { in: ["Basic essentials", "Basic discretionary"] } } });
  if (state.essentialMonthlyExpenses > 0) {
    await prisma.expense.create({
      data: {
        householdId,
        category: "HOUSING",
        label: "Basic essentials",
        amountMonthly: state.essentialMonthlyExpenses,
        currency: h.currency,
        essential: true,
        nonNegotiable: true,
      },
    });
  }
  if (state.discretionaryMonthlyExpenses > 0) {
    await prisma.expense.create({
      data: {
        householdId,
        category: "ENTERTAINMENT",
        label: "Basic discretionary",
        amountMonthly: state.discretionaryMonthlyExpenses,
        currency: h.currency,
        essential: false,
      },
    });
  }

  // Assets — if no assets exist, create two aggregate ones
  if (h.assets.length === 0 && state.totalAssets > 0) {
    if (state.liquidCash > 0) {
      await prisma.asset.create({
        data: {
          householdId,
          label: "Bank balance / liquid",
          assetClass: "CASH",
          instrument: "SAVINGS",
          currentValue: state.liquidCash,
          currency: h.currency,
          ownershipType: "SOLE",
          liquidityBucket: "T0",
        },
      });
    }
    const other = Math.max(0, state.totalAssets - state.liquidCash);
    if (other > 0) {
      await prisma.asset.create({
        data: {
          householdId,
          label: "Basic aggregate (non-cash)",
          assetClass: "EQUITY",
          instrument: "MF_EQUITY",
          currentValue: other,
          currency: h.currency,
          ownershipType: "SOLE",
          liquidityBucket: "D30",
        },
      });
    }
  }

  // Liabilities aggregate
  if (h.liabilities.length === 0 && (state.totalLiabilities > 0 || state.totalEMI > 0)) {
    await prisma.liability.create({
      data: {
        householdId,
        label: "Basic aggregate debt",
        type: "PERSONAL_LOAN",
        outstanding: state.totalLiabilities || 0,
        emiMonthly: state.totalEMI || 0,
        currency: h.currency,
        interestType: "FIXED",
      },
    });
  }
  if (state.creditCardRevolve) {
    const ex = await prisma.liability.findFirst({ where: { householdId, type: "CREDIT_CARD" } });
    if (!ex) {
      await prisma.liability.create({
        data: { householdId, label: "Credit card revolve", type: "CREDIT_CARD", outstanding: 1, currency: h.currency },
      });
    }
  }

  // Insurance aggregates
  if (state.termCover > 0 && !h.policies.some((p) => p.type === "TERM")) {
    await prisma.policy.create({
      data: {
        householdId,
        label: "Basic aggregate term cover",
        type: "TERM",
        sumAssured: state.termCover,
        currency: h.currency,
      },
    });
  }
  if (state.healthCover > 0 && !h.policies.some((p) => p.type === "FAMILY_FLOATER" || p.type === "INDIVIDUAL_HEALTH")) {
    await prisma.policy.create({
      data: {
        householdId,
        label: "Basic aggregate health cover",
        type: state.dependents > 0 ? "FAMILY_FLOATER" : "INDIVIDUAL_HEALTH",
        sumAssured: state.healthCover,
        currency: h.currency,
      },
    });
  }

  // Tax profile (India)
  if (h.region === "IN" && state.taxRegime) {
    await prisma.taxProfile.upsert({
      where: { householdId },
      create: { householdId, regime: state.taxRegime },
      update: { regime: state.taxRegime },
    });
  }

  // Risk profile baseline
  await prisma.riskProfile.upsert({
    where: { householdId },
    create: {
      householdId,
      stated: state.riskComfort,
      rationale: "Stated from Basic Mode short questionnaire (5-item equivalent).",
    },
    update: {
      stated: state.riskComfort,
    },
  });

  // Goals — upsert Basic goals
  async function upsertGoal(type: string, label: string, amountToday: number, year: number, inflationCategory: string) {
    if (amountToday <= 0 || year <= new Date().getFullYear()) return;
    const existing = await prisma.goal.findFirst({ where: { householdId, type } });
    if (existing) {
      await prisma.goal.update({
        where: { id: existing.id },
        data: { label, targetAmountToday: amountToday, targetYear: year, inflationCategory },
      });
    } else {
      await prisma.goal.create({
        data: {
          householdId,
          label,
          type,
          targetAmountToday: amountToday,
          targetYear: year,
          inflationCategory,
          priority: 2,
          currency: h?.currency ?? "INR",
        },
      });
    }
  }

  if (state.retirementTargetMonthly > 0) {
    const targetToday = state.retirementTargetMonthly * 12 * 20;
    await upsertGoal("RETIREMENT", "Retirement", targetToday, new Date().getFullYear() + Math.max(1, state.retirementAge - 30), "GENERAL");
  }
  await upsertGoal("CHILD_EDUCATION", "Child education", state.childEducationCost, state.childEducationYear, "EDUCATION");
  await upsertGoal("HOME_PURCHASE", "Home purchase", state.homePurchaseCost, state.homePurchaseYear, "GENERAL");

  // Auto-generated tasks based on obvious gaps
  // Dedup: only add the task if no OPEN task with the same title exists
  async function ensureTask(title: string, body: string, type: string, priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "MEDIUM") {
    const existing = await prisma.task.findFirst({
      where: { householdId, title, status: { in: ["OPEN", "IN_PROGRESS"] } },
    });
    if (existing) return;
    await up(householdId, type, title, body, priority);
  }

  if (state.essentialMonthlyExpenses > 0 && state.liquidCash < state.essentialMonthlyExpenses * 3) {
    await ensureTask(
      "Build emergency buffer",
      "Your liquid reserves cover less than 3 months of essentials. Start a monthly liquid-fund plan.",
      "GOAL_FUND",
      "HIGH",
    );
  }
  if (state.creditCardRevolve) {
    await ensureTask(
      "Clear credit card revolve",
      "Set a payoff plan for revolving credit card balance. This is usually the first thing to clear.",
      "DEBT_OPT",
      "HIGH",
    );
  }
  if (state.termCover === 0 && state.dependents > 0) {
    await ensureTask(
      "Evaluate term insurance",
      "You have dependents and no term cover captured. Compare pure term options before looking at anything savings-linked.",
      "INSURANCE_REVIEW",
      "HIGH",
    );
  }

  await audit({
    actorUserId: session.userId,
    householdId,
    kind: "FIELD_WRITE",
    objectType: "BasicMode",
    objectId: householdId,
    action: "RUN",
    after: { appliedBasicState: true },
    reason: "Basic Mode submission",
  });

  return { ok: true };
}
