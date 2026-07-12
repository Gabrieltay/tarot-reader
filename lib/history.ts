import { useSyncExternalStore } from "react";
import {
  AppSettings,
  ConversationTurn,
  JournalEntry,
  SavedReading,
} from "@/types/tarot";

const HISTORY_KEY = "tarot-reader:history:v1";
const SETTINGS_KEY = "tarot-reader:settings:v1";

const DEFAULT_SETTINGS: AppSettings = {
  contextualEnabled: true,
};

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
let cachedSettingsSnapshot: AppSettings | null = null;

function notifyStoreChange(): void {
  cachedHistorySnapshot = null;
  cachedSettingsSnapshot = null;
  storeListeners.forEach((listener) => listener());
}

function subscribeToStore(listener: () => void): () => void {
  storeListeners.add(listener);
  if (!isBrowser()) return () => storeListeners.delete(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === HISTORY_KEY || e.key === SETTINGS_KEY || e.key === null) {
      notifyStoreChange();
    }
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

export function addConversationTurn(
  readingId: string,
  turn: Omit<ConversationTurn, "id" | "createdAt">
): ConversationTurn | undefined {
  const fullTurn: ConversationTurn = {
    ...turn,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  const updated = updateReading(readingId, (reading) => ({
    ...reading,
    conversation: [...reading.conversation, fullTurn],
  }));
  return updated ? fullTurn : undefined;
}

export function getSettings(): AppSettings {
  if (!isBrowser()) return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function updateSettings(partial: Partial<AppSettings>): AppSettings {
  const next = { ...getSettings(), ...partial };
  if (isBrowser()) {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    notifyStoreChange();
  }
  return next;
}

function getHistorySnapshot(): SavedReading[] {
  if (cachedHistorySnapshot === null) cachedHistorySnapshot = getHistory();
  return cachedHistorySnapshot;
}

const EMPTY_HISTORY: SavedReading[] = [];

function getHistoryServerSnapshot(): SavedReading[] {
  return EMPTY_HISTORY;
}

function getSettingsSnapshot(): AppSettings {
  if (cachedSettingsSnapshot === null) cachedSettingsSnapshot = getSettings();
  return cachedSettingsSnapshot;
}

function getSettingsServerSnapshot(): AppSettings {
  return DEFAULT_SETTINGS;
}

/** Live-updating view of saved readings; re-renders on any local mutation or cross-tab change. */
export function useHistory(): SavedReading[] {
  return useSyncExternalStore(subscribeToStore, getHistorySnapshot, getHistoryServerSnapshot);
}

/** Live-updating view of app settings (e.g. contextualEnabled). */
export function useSettings(): AppSettings {
  return useSyncExternalStore(subscribeToStore, getSettingsSnapshot, getSettingsServerSnapshot);
}

/** Live-updating single reading lookup, kept in sync with useHistory's snapshot. */
export function useReading(id: string): SavedReading | undefined {
  const history = useHistory();
  return history.find((r) => r.id === id);
}
