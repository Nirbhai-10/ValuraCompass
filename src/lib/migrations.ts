import { defaultScenarioIdsForRegion } from "./scenarios";
import { Database, EMPTY_DB, HouseholdMode, Region } from "./types";

/**
 * Backfill missing fields on records that predate a feature. Run on every
 * read in `store.ts` so older payloads (older builds, hand-edited backups)
 * upgrade transparently.
 */
export function migrate(input: Partial<Database> | undefined): Database {
  const db: Database = { ...EMPTY_DB, ...(input ?? {}) };
  return {
    ...db,
    households: db.households.map((h) => ({
      ...h,
      mode: (h.mode ?? "BASIC") as HouseholdMode,
      scenarioIds: Array.isArray(h.scenarioIds)
        ? h.scenarioIds
        : defaultScenarioIdsForRegion((h.region ?? "IN") as Region),
    })),
    goals: db.goals.map((g) => ({
      ...g,
      linkedAssetIds: Array.isArray(g.linkedAssetIds) ? g.linkedAssetIds : [],
    })),
    riskProfiles: db.riskProfiles ?? [],
    taxProfiles: db.taxProfiles ?? [],
    estateProfiles: db.estateProfiles ?? [],
    assumptions: db.assumptions ?? [],
    tasks: db.tasks ?? [],
  };
}
