import type { UIMessage } from "ai";

export type FestivalThread = { id: string; title: string; updatedAt: number; messages: UIMessage[] };
const KEY = "festival-praise-chats-v1";
export function newThread(id = crypto.randomUUID()): FestivalThread {
  return { id, title: "New conversation", updatedAt: Date.now(), messages: [] };
}
export function readThreads(): FestivalThread[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((t): t is FestivalThread => !!t && typeof t.id === "string" && typeof t.title === "string" && Array.isArray(t.messages)) : [];
  } catch { return []; }
}
export function saveThreads(threads: FestivalThread[]) {
  localStorage.setItem(KEY, JSON.stringify(threads));
}
export function ensureThread(id?: string): { threads: FestivalThread[]; thread: FestivalThread } {
  const threads = readThreads();
  const existing = id ? threads.find(t => t.id === id) : threads[0];
  if (existing) return { threads, thread: existing };
  const thread = newThread(id);
  const next = [thread, ...threads];
  saveThreads(next);
  return { threads: next, thread };
}