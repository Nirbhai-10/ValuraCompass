"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { Database, EMPTY_DB } from "./types";

const STORAGE_KEY = "compass-data-v1";

type Listener = () => void;
const listeners = new Set<Listener>();

let cache: Database | null = null;

function read(): Database {
  if (typeof window === "undefined") return EMPTY_DB;
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cache = { ...EMPTY_DB };
      return cache;
    }
    const parsed = JSON.parse(raw) as Partial<Database>;
    cache = { ...EMPTY_DB, ...parsed };
    return cache;
  } catch {
    cache = { ...EMPTY_DB };
    return cache;
  }
}

function write(next: Database): void {
  cache = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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

export function useUpdate(): (mutator: (db: Database) => Database) => void {
  return useCallback((mutator) => {
    const next = mutator(read());
    write(next);
  }, []);
}

export function useHydrated(): boolean {
  // Returns true after the first client render so server-only renders skip data-dependent UI.
  const value = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return value;
}

export function uid(prefix = "id"): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}_${time}${rand}`;
}

export function nowISO(): string {
  return new Date().toISOString();
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

// React hook to listen for hydration completion (used to avoid hydration mismatches).
export function useClientEffect(fn: () => void, deps: ReadonlyArray<unknown>): void {
  useEffect(() => {
    fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
