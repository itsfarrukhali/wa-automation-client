// src/lib/time-slots.ts
import type { WorkingHoursDay } from "@/lib/business-profile";
import { getDateKeyInTimezone, getScheduleParts } from "@/lib/timezone";

const MINUTES_PER_DAY = 24 * 60;

/**
 * "00:00" means different things depending on role: as an OPEN time it's the
 * start of the day (0 minutes); as a CLOSE time it means midnight at the END
 * of the day (1440 minutes). Without this distinction, any business open
 * until midnight (very common for gyms/restaurants) would show zero slots.
 */
function parseTimeToMinutes(value: string, role: "open" | "close") {
  const [hours, minutes] = value.split(":").map(Number);
  const total = hours * 60 + minutes;
  if (role === "close" && total === 0) return MINUTES_PER_DAY;
  return total;
}

export function generateTimeSlots(
  workingHours: WorkingHoursDay[],
  date: Date,
  durationMinutes: number,
  timezone: string,
  stepMinutes = 30,
): string[] {
  const { day: dayKey } = getScheduleParts(date, timezone);
  const entry = workingHours.find((day) => day.day === dayKey);
  if (!entry?.isOpen || !entry.openTime || !entry.closeTime) return [];

  const openMinutes = parseTimeToMinutes(entry.openTime, "open");
  const closeMinutes = parseTimeToMinutes(entry.closeTime, "close");
  const slots: string[] = [];

  for (
    let minutes = openMinutes;
    minutes + durationMinutes <= closeMinutes;
    minutes += stepMinutes
  ) {
    const hh = String(Math.floor(minutes / 60) % 24).padStart(2, "0");
    const mm = String(minutes % 60).padStart(2, "0");
    slots.push(`${hh}:${mm}`);
  }

  const now = new Date();
  const isSelectedDateToday =
    getDateKeyInTimezone(date, timezone) ===
    getDateKeyInTimezone(now, timezone);
  if (!isSelectedDateToday) return slots;

  const { minutes: nowMinutes } = getScheduleParts(now, timezone);
  return slots.filter((slot) => parseTimeToMinutes(slot, "open") > nowMinutes);
}

export function combineDateAndTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
}
