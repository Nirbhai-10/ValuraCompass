"use client";

import { useCallback, useSyncExternalStore } from "react";
import { migrate } from "./migrations";
import { Database, EMPTY_DB } from "./types";

const STORAGE_KEY = "compass-data-v1";
const SCHEMA_VERSION = 1;

type Listener = () => void;
const listeners = new Set<Listener>();

let cache: Database | null = null;

interface Envelope {
  version: number;
  data: Database;
}

function read(): Database {
  if (typeof window === "undefined") return EMPTY_DB;
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cache = migrate(undefined);
      return cache;
    }
    const parsed = JSON.parse(raw) as Partial<Envelope> | Partial<Database>;
    const data: Partial<Database> | undefined =
      typeof parsed === "object" && parsed !== null && "data" in parsed
        ? ((parsed as Envelope).data ?? {})
        : (parsed as Partial<Database>);
    cache = migrate(data);
    return cache;
  } catch {
    cache = migrate(undefined);
    return cache;
  }
}

function write(next: Database): void {
  cache = next;
  if (typeof window !== "undefined") {
    try {
      const envelope: Envelope = { version: SCHEMA_VERSION, data: next };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    } catch {
      // ignore quota / private mode errors
    }
  }
  listeners.forEach((fn) => fn());
}

function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

const SERVER_SNAPSHOT: Database = EMPTY_DB;

export function useDatabase(): Database {
  return useSyncExternalStore(subscribe, read, () => SERVER_SNAPSHOT);
}

export type Mutator = (db: Database) => Database;

export function useUpdate(): (mutator: Mutator) => void {
  return useCallback((mutator) => {
    const next = mutator(read());
    write(next);
  }, []);
}

export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function uid(prefix = "id"): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}_${time}${rand}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function exportAll(): string {
  const data = read();
  const envelope: Envelope = { version: SCHEMA_VERSION, data };
  return JSON.stringify(envelope, null, 2);
}

export function importAll(text: string): { ok: true } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(text);
    const data: Partial<Database> | undefined =
      typeof parsed === "object" && parsed !== null && "data" in parsed
        ? (parsed as Envelope).data
        : (parsed as Partial<Database>);
    if (!data || typeof data !== "object") {
      return { ok: false, error: "Invalid file: not a Compass export." };
    }
    write(migrate(data));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message || "Could not parse JSON." };
  }
}

export function resetAll(): void {
  write(migrate(undefined));
}

// Cross-tab sync
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      listeners.forEach((fn) => fn());
    }
  });
}
