export const EVENT = {
  name: "Festival of Praise @20",
  tagline: "20 Years of Praise",
  campaign: "Two Decades of Praise. One Unforgettable Celebration.",
  dateLabel: "Saturday, 27 March 2027",
  dateNote: "Easter Saturday",
  date: "2027-03-27",
  venue: "Church Field, Bethlehem Methodist Church, Tema, Ghana",
  venueShort: "Church Field · Bethlehem Methodist Church, Tema",
  organizer: "Bethlehem Methodist Church, Tema",
  programme: "Late afternoon into the evening",
  /**
   * Official start time in 24h "HH:MM" (Africa/Accra, UTC+0).
   * While null, the countdown runs to the start of festival day (00:00 Accra).
   */
  startTime: null as string | null,
};

/** Accra is UTC+0 year-round, so local time maps directly to UTC. Falls back to the start of the day. */
export function getStartTimestamp(date: string, startTime: string | null): number {
  const t = startTime && /^\d{2}:\d{2}$/.test(startTime) ? startTime : "00:00";
  return Date.parse(`${date}T${t}:00Z`);
}

export function getRemaining(target: number, now: number) {
  const diff = Math.max(0, target - now);
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: diff === 0,
  };
}
