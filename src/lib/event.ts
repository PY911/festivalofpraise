export const EVENT = {
  name: "Festival of Praise @20",
  tagline: "20 Years of Praise",
  campaign: "Two Decades of Praise. One Unforgettable Celebration.",
  dateLabel: "Saturday, 27 March 2027",
  dateNote: "Easter Saturday",
  date: "2027-03-27",
  venue: "Golf City - Tema, Ghana",
  venueShort: "Golf City - Tema",
  organizer: "Bethlehem Methodist Church, Tema",
  programme: "Late afternoon into the evening",
  /**
   * Official start time in 24h "HH:MM" (Africa/Accra, UTC+0).
   * While null, the countdown runs to the start of festival day (00:00 Accra).
   */
  startTime: null as string | null,
};

/**
 * Official social pages of the organizer (supplied by the church).
 * Every link on the site points here — never a placeholder profile URL.
 */
export const SOCIAL = [
  { label: "Instagram", handle: "@bethlehemonline_", url: "https://www.instagram.com/bethlehemonline_/" },
  { label: "TikTok", handle: "@bethlehemonline", url: "https://www.tiktok.com/@bethlehemonline" },
  { label: "Facebook", handle: "Bethlehem Society", url: "https://www.facebook.com/BethlehemSociety" },
] as const;

/** Accra is UTC+0 year-round, so local time maps directly to UTC. Falls back to the start of the day. */
export function getStartTimestamp(date: string, startTime: string | null): number {
  const t = startTime && /^\d{2}:\d{2}$/.test(startTime) ? startTime : "00:00";
  return Date.parse(`${date}T${t}:00Z`);
}

/** Google Maps search URL for the venue, so directions always match what the site shows. */
export function getMapUrl(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(EVENT.venue)}`;
}

/** All-day ICS calendar file for festival day (start time is not yet announced). `dtstamp` is injectable for tests. */
export function buildIcs(dtstamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")): string {
  const day = EVENT.date.replace(/-/g, "");
  const next = new Date(Date.parse(`${EVENT.date}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10).replace(/-/g, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bethlehem Methodist Church Tema//Festival of Praise//EN",
    "BEGIN:VEVENT",
    "UID:festival-of-praise-20@bethlehem-tema",
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${day}`,
    `DTEND;VALUE=DATE:${next}`,
    `SUMMARY:${EVENT.name} — ${EVENT.tagline}`,
    `DESCRIPTION:${EVENT.campaign}`,
    `LOCATION:${EVENT.venue}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
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
