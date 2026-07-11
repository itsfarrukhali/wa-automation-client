import type { WorkingHoursDay } from "@/lib/business-profile";

const DAY_KEYS: WorkingHoursDay["day"][] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

function parseTimeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

/** Generates 30-min slot start times (as "HH:mm") that leave enough room for `durationMinutes`. */
export function generateTimeSlots(
  workingHours: WorkingHoursDay[],
  date: Date,
  durationMinutes: number,
  stepMinutes = 30,
): string[] {
  const dayKey = DAY_KEYS[date.getDay()];
  const entry = workingHours.find((day) => day.day === dayKey);
  if (!entry?.isOpen) return [];

  const openMinutes = parseTimeToMinutes(entry.openTime);
  const closeMinutes = parseTimeToMinutes(entry.closeTime);
  const slots: string[] = [];

  for (
    let minutes = openMinutes;
    minutes + durationMinutes <= closeMinutes;
    minutes += stepMinutes
  ) {
    const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mm = String(minutes % 60).padStart(2, "0");
    slots.push(`${hh}:${mm}`);
  }

  // Filter out past slots if the selected date is today.
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (!isToday) return slots;

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return slots.filter((slot) => parseTimeToMinutes(slot) > nowMinutes);
}

export function combineDateAndTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
}
