import { describe, expect, it } from "vitest";
import { EVENT, getRemaining, getStartTimestamp } from "@/lib/event";

describe("countdown", () => {
  it("stays inactive while the start time is not announced", () => {
    expect(EVENT.startTime).toBeNull();
    expect(getStartTimestamp(EVENT.date, null)).toBeNull();
  });
  it("targets 27 March 2027 in Accra time once a time is set", () => {
    expect(getStartTimestamp("2027-03-27", "16:00")).toBe(Date.UTC(2027, 2, 27, 16, 0));
  });
  it("splits remaining time into days/hours/minutes/seconds", () => {
    const t = Date.UTC(2027, 2, 27, 16, 0);
    const r = getRemaining(t, t - (2 * 86_400_000 + 3 * 3_600_000 + 4 * 60_000 + 5000));
    expect(r).toMatchObject({ days: 2, hours: 3, minutes: 4, seconds: 5, done: false });
  });
});
