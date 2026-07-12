import { useSyncExternalStore } from "react";
import { JournalEntry, SavedReading } from "@/types/tarot";

const HISTORY_KEY = "tarot-reader:history:v1";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * localStorage is an external, synchronous store. Components read it through
 * useSyncExternalStore (below) rather than useEffect+setState, so React can
 * reconcile server/client snapshots correctly and re-render whenever this
 * module — or another tab — writes to it.
 */
const storeListeners = new Set<() => void>();
let cachedHistorySnapshot: SavedReading[] | null = null;

function notifyStoreChange(): void {
  cachedHistorySnapshot = null;
  storeListeners.forEach((listener) => listener());
}

function subscribeToStore(listener: () => void): () => void {
  storeListeners.add(listener);
  if (!isBrowser()) return () => storeListeners.delete(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === HISTORY_KEY || e.key === null) notifyStoreChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    storeListeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function generateId(): string {
  if (isBrowser() && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getHistory(): SavedReading[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as SavedReading[];
  } catch {
    return [];
  }
}

function persist(history: SavedReading[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  notifyStoreChange();
}

export function saveReading(reading: SavedReading): void {
  const history = getHistory();
  history.unshift(reading);
  persist(history);
}

export function deleteReading(id: string): void {
  const history = getHistory().filter((r) => r.id !== id);
  persist(history);
}

export function clearHistory(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(HISTORY_KEY);
  notifyStoreChange();
}

export function getReadingById(id: string): SavedReading | undefined {
  return getHistory().find((r) => r.id === id);
}

function updateReading(
  id: string,
  updater: (reading: SavedReading) => SavedReading
): SavedReading | undefined {
  const history = getHistory();
  const index = history.findIndex((r) => r.id === id);
  if (index === -1) return undefined;
  const updated = updater(history[index]);
  history[index] = updated;
  persist(history);
  return updated;
}

export function addJournalEntry(readingId: string, text: string): JournalEntry | undefined {
  const entry: JournalEntry = {
    id: generateId(),
    text,
    createdAt: new Date().toISOString(),
  };
  const updated = updateReading(readingId, (reading) => ({
    ...reading,
    journal: [...reading.journal, entry],
  }));
  return updated ? entry : undefined;
}

export function deleteJournalEntry(readingId: string, entryId: string): void {
  updateReading(readingId, (reading) => ({
    ...reading,
    journal: reading.journal.filter((e) => e.id !== entryId),
  }));
}

function getHistorySnapshot(): SavedReading[] {
  if (cachedHistorySnapshot === null) cachedHistorySnapshot = getHistory();
  return cachedHistorySnapshot;
}

const EMPTY_HISTORY: SavedReading[] = [];

function getHistoryServerSnapshot(): SavedReading[] {
  return EMPTY_HISTORY;
}

/** Live-updating view of saved readings; re-renders on any local mutation or cross-tab change. */
export function useHistory(): SavedReading[] {
  return useSyncExternalStore(subscribeToStore, getHistorySnapshot, getHistoryServerSnapshot);
}

/** Live-updating single reading lookup, kept in sync with useHistory's snapshot. */
export function useReading(id: string): SavedReading | undefined {
  const history = useHistory();
  return history.find((r) => r.id === id);
}
