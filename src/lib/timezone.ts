// src/lib/timezone.ts
/**
 * Mirrors getLocalScheduleParts() in booking.service.js — computes weekday
 * and minutes-since-midnight in a specific IANA timezone, not the browser's.
 * Keeping this identical to the backend prevents client/server disagreement
 * on "is this slot available" checks.
 */
export function getScheduleParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );
  return {
    day: values.weekday.toLowerCase().slice(0, 3), // "mon", "tue", ...
    minutes: Number(values.hour) * 60 + Number(values.minute),
  };
}

/** Returns the "YYYY-MM-DD" calendar date as seen in the given timezone, not the browser's. */
export function getDateKeyInTimezone(date: Date, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
