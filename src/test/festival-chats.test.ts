import { beforeEach, describe, expect, it } from "vitest";
import { ensureThread, newThread, saveThreads } from "@/lib/festival-chats";

describe("Browser festival conversations", () => {
  beforeEach(() => localStorage.clear());
  it("restores arbitrary route IDs without creating duplicate threads", () => {
    const first = ensureThread("visitor-conversation");
    const restored = ensureThread("visitor-conversation");
    expect(first.thread.id).toBe("visitor-conversation");
    expect(restored.threads).toHaveLength(1);
  });
  it("keeps histories separate for two route IDs", () => {
    const first = newThread("first");
    first.messages = [{ id: "question-one", role: "user", parts: [{ type: "text", text: "Festival date?" }] }];
    saveThreads([first, newThread("second")]);
    expect(ensureThread("first").thread.messages).toHaveLength(1);
    expect(ensureThread("second").thread.messages).toEqual([]);
  });
});