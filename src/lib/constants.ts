// src/lib/constants.ts
// Kept in sync with src/models/common/categorySchema.js and citySchema.js.
// There's no public list endpoint for these on the backend, so we mirror
// the enums here. If the backend enum changes, update this file too.

export const BUSINESS_TYPES = [
  { value: "salon", label: "Salon" },
  { value: "barber_shop", label: "Barber Shop" },
  { value: "spa", label: "Spa" },
  { value: "beauty_parlor", label: "Beauty Parlor" },
  { value: "clinic", label: "Clinic" },
  { value: "dental_clinic", label: "Dental Clinic" },
  { value: "hospital", label: "Hospital" },
  { value: "medical_store", label: "Medical Store" },
  { value: "gym", label: "Gym" },
  { value: "fitness_center", label: "Fitness Center" },
  { value: "yoga_studio", label: "Yoga Studio" },
  { value: "restaurant", label: "Restaurant" },
  { value: "cafe", label: "Cafe" },
  { value: "bakery", label: "Bakery" },
  { value: "catering", label: "Catering" },
  { value: "boutique", label: "Boutique" },
  { value: "tailor", label: "Tailor" },
  { value: "laundry", label: "Laundry" },
  { value: "tutor", label: "Tutor" },
  { value: "coaching_center", label: "Coaching Center" },
  { value: "driving_school", label: "Driving School" },
  { value: "real_estate", label: "Real Estate" },
  { value: "travel_agency", label: "Travel Agency" },
  { value: "event_planner", label: "Event Planner" },
  { value: "other", label: "Other" },
] as const;

export const CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Gujranwala",
  "Sialkot",
  "Hyderabad",
  "Sukkur",
  "Bahawalpur",
  "Sargodha",
  "Gujrat",
  "Jhelum",
  "Sahiwal",
  "Wah Cantt",
  "Mardan",
  "Mingora",
  "Other",
] as const;

export const WEEK_DAYS = [
  { value: "mon", label: "Monday" },
  { value: "tue", label: "Tuesday" },
  { value: "wed", label: "Wednesday" },
  { value: "thu", label: "Thursday" },
  { value: "fri", label: "Friday" },
  { value: "sat", label: "Saturday" },
  { value: "sun", label: "Sunday" },
] as const;
