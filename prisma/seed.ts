/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding demo data…");

  const advisorEmail = "advisor@valura.ai";
  const clientEmail = "client@valura.ai";
  const pw = await bcrypt.hash("demo1234", 10);

  // Clean existing demo data
  await prisma.auditEvent.deleteMany({ where: { OR: [{ actor: { email: advisorEmail } }, { actor: { email: clientEmail } }] } });

  const firm = await prisma.firm.upsert({
    where: { id: "demo-firm" },
    update: { name: "Valura Demo Practice" },
    create: { id: "demo-firm", name: "Valura Demo Practice" },
  });

  const advisor = await prisma.user.upsert({
    where: { email: advisorEmail },
    update: { name: "Riya Mehta (Advisor)", role: "ADVISOR", firmId: firm.id, passwordHash: pw },
    create: { email: advisorEmail, name: "Riya Mehta (Advisor)", role: "ADVISOR", firmId: firm.id, passwordHash: pw },
  });

  const client = await prisma.user.upsert({
    where: { email: clientEmail },
    update: { name: "Arun Sharma (Client)", role: "CLIENT", passwordHash: pw },
    create: { email: clientEmail, name: "Arun Sharma (Client)", role: "CLIENT", passwordHash: pw },
  });

  // Delete any prior demo household
  await prisma.household.deleteMany({ where: { name: "The Sharma Family" } });

  const hh = await prisma.household.create({
    data: {
      name: "The Sharma Family",
      region: "IN",
      currency: "INR",
      structure: "NUCLEAR_WITH_PARENTS",
      mode: "ADVANCED",
      firmId: firm.id,
      members: {
        create: [
          { userId: advisor.id, scope: "FULL" },
          { userId: client.id, scope: "FULL" },
        ],
      },
    },
  });

  const arun = await prisma.person.create({
    data: {
      householdId: hh.id,
      fullName: "Arun Sharma",
      preferredName: "Arun",
      dob: new Date("1988-06-15"),
      maritalStatus: "MARRIED",
      employmentType: "SALARIED",
      residencyCountry: "IN",
      taxResidencyCountry: "IN",
      isPrimary: true,
      intendedRetirementAge: 60,
      riskAttitudeStated: "BALANCED",
    },
  });
  const priya = await prisma.person.create({
    data: {
      householdId: hh.id,
      fullName: "Priya Sharma",
      preferredName: "Priya",
      dob: new Date("1990-02-10"),
      maritalStatus: "MARRIED",
      employmentType: "PROFESSIONAL",
      residencyCountry: "IN",
      taxResidencyCountry: "IN",
      isPrimary: false,
    },
  });
  const aarav = await prisma.person.create({
    data: {
      householdId: hh.id,
      fullName: "Aarav Sharma",
      preferredName: "Aarav",
      dob: new Date("2016-11-05"),
      isDependent: true,
    },
  });
  const meera = await prisma.person.create({
    data: {
      householdId: hh.id,
      fullName: "Meera Sharma",
      preferredName: "Meera",
      dob: new Date("1958-04-20"),
      isDependent: true,
      elderlyFlag: true,
    },
  });

  await prisma.relationship.createMany({
    data: [
      { householdId: hh.id, fromId: arun.id, toId: priya.id, type: "SPOUSE", dependency: "INDEPENDENT", financiallyLinked: true },
      { householdId: hh.id, fromId: arun.id, toId: aarav.id, type: "CHILD", dependency: "FULL_SUPPORT", financiallyLinked: true },
      { householdId: hh.id, fromId: arun.id, toId: meera.id, type: "PARENT", dependency: "PARTIAL_SUPPORT", financiallyLinked: true },
    ],
  });

  await prisma.income.createMany({
    data: [
      { householdId: hh.id, personId: arun.id, type: "SALARY", label: "Primary salary", amountMonthly: 220000, variability: "STABLE", currency: "INR" },
      { householdId: hh.id, personId: priya.id, type: "CONSULTING", label: "Consulting", amountMonthly: 90000, variability: "MODERATE", currency: "INR" },
    ],
  });

  await prisma.expense.createMany({
    data: [
      { householdId: hh.id, category: "HOUSING", label: "Rent / EMI", amountMonthly: 70000, essential: true, inflationSensitivity: "GENERAL", nonNegotiable: true, currency: "INR" },
      { householdId: hh.id, category: "GROCERIES", label: "Groceries & staples", amountMonthly: 25000, essential: true, currency: "INR" },
      { householdId: hh.id, category: "UTILITIES", label: "Utilities & internet", amountMonthly: 7000, essential: true, currency: "INR" },
      { householdId: hh.id, category: "EDUCATION", label: "School fees", amountMonthly: 20000, essential: true, inflationSensitivity: "EDUCATION", currency: "INR" },
      { householdId: hh.id, category: "HEALTHCARE", label: "Healthcare (parents)", amountMonthly: 8000, essential: true, inflationSensitivity: "HEALTHCARE", currency: "INR" },
      { householdId: hh.id, category: "PARENTAL_SUPPORT", label: "Parental support", amountMonthly: 15000, essential: true, currency: "INR" },
      { householdId: hh.id, category: "TRANSPORT", label: "Fuel & transport", amountMonthly: 8000, essential: true, currency: "INR" },
      { householdId: hh.id, category: "DINING", label: "Dining & outings", amountMonthly: 15000, essential: false, currency: "INR" },
      { householdId: hh.id, category: "SUBSCRIPTIONS", label: "Subscriptions", amountMonthly: 3000, essential: false, currency: "INR" },
      { householdId: hh.id, category: "TRAVEL", label: "Travel (avg)", amountMonthly: 10000, essential: false, currency: "INR" },
    ],
  });

  await prisma.asset.createMany({
    data: [
      { householdId: hh.id, label: "HDFC Savings", assetClass: "CASH", instrument: "SAVINGS", currentValue: 650000, liquidityBucket: "T0", ownershipType: "SOLE", currency: "INR" },
      { householdId: hh.id, label: "Arun EPF", assetClass: "RETIREMENT", instrument: "EPF", currentValue: 1800000, liquidityBucket: "ILLIQUID", ownershipType: "SOLE", currency: "INR" },
      { householdId: hh.id, label: "Arun PPF", assetClass: "RETIREMENT", instrument: "PPF", currentValue: 600000, liquidityBucket: "Y1", ownershipType: "SOLE", currency: "INR" },
      { householdId: hh.id, label: "NPS Tier I", assetClass: "RETIREMENT", instrument: "NPS", currentValue: 350000, liquidityBucket: "ILLIQUID", ownershipType: "SOLE", currency: "INR" },
      { householdId: hh.id, label: "Equity MF portfolio", assetClass: "EQUITY", instrument: "MF_EQUITY", currentValue: 2200000, liquidityBucket: "D30", ownershipType: "SOLE", currency: "INR" },
      { householdId: hh.id, label: "Direct equity (single stock)", assetClass: "EQUITY", instrument: "STOCKS", currentValue: 1500000, liquidityBucket: "T2", ownershipType: "SOLE", currency: "INR" },
      { householdId: hh.id, label: "Gold (physical + SGB)", assetClass: "GOLD", instrument: "GOLD_SGB", currentValue: 400000, liquidityBucket: "D90", ownershipType: "JOINT_SPOUSE", currency: "INR" },
      { householdId: hh.id, label: "Apartment (self-occupied)", assetClass: "REAL_ESTATE", instrument: "PROPERTY_RES", currentValue: 9500000, liquidityBucket: "ILLIQUID", ownershipType: "JOINT_SPOUSE", currency: "INR" },
    ],
  });

  await prisma.liability.createMany({
    data: [
      { householdId: hh.id, label: "Home loan", type: "HOME_LOAN", lender: "SBI", outstanding: 5400000, interestRate: 9.1, interestType: "FLOATING", tenureMonths: 180, emiMonthly: 48000, currency: "INR" },
      { householdId: hh.id, label: "Credit card revolve", type: "CREDIT_CARD", lender: "HDFC", outstanding: 62000, interestRate: 42, interestType: "FIXED", emiMonthly: 4000, currency: "INR" },
    ],
  });

  const term = await prisma.policy.create({
    data: { householdId: hh.id, label: "Term — Arun", type: "TERM", insurer: "HDFC Life", sumAssured: 12000000, premiumAnnual: 22000, policyTermYears: 30, currency: "INR" },
  });
  await prisma.policyInsured.createMany({
    data: [
      { policyId: term.id, personId: arun.id, role: "OWNER" },
      { policyId: term.id, personId: arun.id, role: "INSURED" },
      { policyId: term.id, personId: priya.id, role: "NOMINEE" },
    ],
  });

  const floater = await prisma.policy.create({
    data: { householdId: hh.id, label: "Family floater", type: "FAMILY_FLOATER", insurer: "Star Health", sumAssured: 1500000, premiumAnnual: 28000, policyTermYears: 1, currency: "INR" },
  });
  await prisma.policyInsured.createMany({
    data: [
      { policyId: floater.id, personId: arun.id, role: "OWNER" },
      { policyId: floater.id, personId: priya.id, role: "INSURED" },
      { policyId: floater.id, personId: aarav.id, role: "INSURED" },
    ],
  });

  const ulip = await prisma.policy.create({
    data: { householdId: hh.id, label: "ULIP (legacy)", type: "ULIP", insurer: "LIC", sumAssured: 1000000, premiumAnnual: 100000, policyTermYears: 20, currency: "INR" },
  });
  await prisma.policyInsured.createMany({
    data: [
      { policyId: ulip.id, personId: arun.id, role: "OWNER" },
      { policyId: ulip.id, personId: arun.id, role: "INSURED" },
    ],
  });

  await prisma.goal.createMany({
    data: [
      { householdId: hh.id, label: "Aarav college fund", type: "CHILD_EDUCATION", targetAmountToday: 4000000, targetYear: new Date().getFullYear() + 12, priority: 1, inflationCategory: "EDUCATION", linkedPersonId: aarav.id, currency: "INR" },
      { householdId: hh.id, label: "Retirement", type: "RETIREMENT", targetAmountToday: 180000 * 12 * 25, targetYear: new Date().getFullYear() + 24, priority: 1, inflationCategory: "GENERAL", currency: "INR" },
      { householdId: hh.id, label: "Parents' healthcare reserve", type: "HEALTHCARE_RESERVE", targetAmountToday: 2500000, targetYear: new Date().getFullYear() + 5, priority: 2, inflationCategory: "HEALTHCARE", linkedPersonId: meera.id, currency: "INR" },
      { householdId: hh.id, label: "Second home (optional)", type: "HOME_PURCHASE", targetAmountToday: 6000000, targetYear: new Date().getFullYear() + 10, priority: 4, flexibility: "HIGHLY_FLEXIBLE", inflationCategory: "GENERAL", currency: "INR" },
    ],
  });

  await prisma.taxProfile.create({
    data: { householdId: hh.id, regime: "OLD", businessIncomeShare: 0.15, complexityTags: JSON.stringify(["HOME_LOAN", "EMPLOYER_COVER"]) },
  });
  await prisma.riskProfile.create({
    data: { householdId: hh.id, stated: "BALANCED", rationale: "Stated Balanced; capacity constrained by dependents and home loan." },
  });
  await prisma.estateProfile.create({
    data: { householdId: hh.id, willStatus: "DRAFT", trustStatus: "NONE", poaStatus: "NONE", guardianshipNotes: "Guardianship TBD; child is a minor; parents' care plan to be formalized." },
  });
  await prisma.behaviorProfile.create({
    data: { householdId: hh.id, savingsDiscipline: 4, impulsiveSpend: 3, panicSelling: 2, procrastination: 3, complexityAvoid: 2, needReassurance: 3, nudgingPref: "DIRECT" },
  });

  await prisma.task.createMany({
    data: [
      { householdId: hh.id, title: "Raise term cover to fund 8–10 years of essentials", body: "Current cover funds ~4 years; target ~8–10 years including loans.", type: "INSURANCE_REVIEW", ownerType: "CLIENT", priority: "HIGH" },
      { householdId: hh.id, title: "Clear credit card revolve", body: "Clear ₹62,000 balance; cancel revolve by next cycle.", type: "DEBT_OPT", ownerType: "CLIENT", priority: "HIGH" },
      { householdId: hh.id, title: "Compare Old vs New tax regime this fiscal", body: "Review with your CA at next meeting.", type: "TAX_REVIEW", ownerType: "SPECIALIST", priority: "MEDIUM" },
      { householdId: hh.id, title: "Register the draft will", body: "Guardianship clause for Aarav; nominee consistency across policies.", type: "ESTATE", ownerType: "CLIENT", priority: "MEDIUM" },
    ],
  });

  console.log("Seed complete.");
  console.log("Demo logins:");
  console.log("  advisor@valura.ai / demo1234");
  console.log("  client@valura.ai  / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
