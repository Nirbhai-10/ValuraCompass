import { Database, EMPTY_DB } from "./types";

/**
 * Backfill missing fields on records that predate a feature. Run on every
 * read in `store.ts` so older payloads (older builds, hand-edited backups)
 * upgrade transparently.
 */
export function migrate(input: Partial<Database> | undefined): Database {
  const db: Database = { ...EMPTY_DB, ...(input ?? {}) };
  return {
    ...db,
    goals: db.goals.map((g) => ({
      ...g,
      linkedAssetIds: Array.isArray(g.linkedAssetIds) ? g.linkedAssetIds : [],
    })),
  };
}
