import { get, set, del, keys } from "idb-keyval";

export interface HistoryOutput {
  name: string;
  type: string;
  size: number;
  blob: Blob;
}

export interface HistoryEntry {
  id: string;
  createdAt: number;
  direction: "img2pdf" | "pdf2img";
  sourceName: string;
  sourceSize: number;
  sourceType: string;
  sourceBlob: Blob;         // for "before" preview
  thumbBlob?: Blob;         // small preview for source (e.g. first PDF page)
  outputs: HistoryOutput[];
  combined?: boolean;       // grouped (merged PDF) entry
}

const INDEX_KEY = "bhk_history_index_v1";
const ENTRY_PREFIX = "bhk_history_entry_v1:";
const MAX_ENTRIES = 30;

interface IndexRow {
  id: string;
  createdAt: number;
  direction: HistoryEntry["direction"];
  sourceName: string;
  outputsCount: number;
}

const getIndex = async (): Promise<IndexRow[]> =>
  (await get<IndexRow[]>(INDEX_KEY)) ?? [];

export const listHistory = async (): Promise<IndexRow[]> => {
  const idx = await getIndex();
  return [...idx].sort((a, b) => b.createdAt - a.createdAt);
};

export const loadHistoryEntry = async (id: string): Promise<HistoryEntry | undefined> =>
  get<HistoryEntry>(ENTRY_PREFIX + id);

export const saveHistoryEntry = async (
  entry: Omit<HistoryEntry, "id" | "createdAt"> & { id?: string; createdAt?: number },
): Promise<string> => {
  const id = entry.id ?? Math.random().toString(36).slice(2, 12);
  const createdAt = entry.createdAt ?? Date.now();
  const full: HistoryEntry = { ...entry, id, createdAt };
  await set(ENTRY_PREFIX + id, full);
  const idx = await getIndex();
  idx.push({
    id,
    createdAt,
    direction: entry.direction,
    sourceName: entry.sourceName,
    outputsCount: entry.outputs.length,
  });
  // trim
  const trimmed = idx.sort((a, b) => b.createdAt - a.createdAt).slice(0, MAX_ENTRIES);
  const toDelete = idx.filter((r) => !trimmed.includes(r));
  await Promise.all(toDelete.map((r) => del(ENTRY_PREFIX + r.id)));
  await set(INDEX_KEY, trimmed);
  return id;
};

export const deleteHistoryEntry = async (id: string): Promise<void> => {
  await del(ENTRY_PREFIX + id);
  const idx = await getIndex();
  await set(INDEX_KEY, idx.filter((r) => r.id !== id));
};

export const clearHistory = async (): Promise<void> => {
  const all = await keys();
  await Promise.all(
    all
      .filter((k) => typeof k === "string" && (k as string).startsWith(ENTRY_PREFIX))
      .map((k) => del(k)),
  );
  await del(INDEX_KEY);
};
