export type Conversation = {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  intent: string;
  status: "open" | "waiting" | "resolved";
  time: string;
};

export type Booking = {
  id: string;
  customer: string;
  service: string;
  staff: string;
  date: string;
  status: "confirmed" | "pending" | "cancelled";
  amount: number;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  visits: number;
  lastSeen: string;
  tag: string;
};

export const conversations: Conversation[] = [
  {
    id: "c-01",
    name: "Ayesha Khan",
    phone: "+92 300 1122334",
    lastMessage: "Can I move my appointment to evening?",
    intent: "Reschedule",
    status: "open",
    time: "09:42",
  },
  {
    id: "c-02",
    name: "Bilal Ahmed",
    phone: "+92 321 8877665",
    lastMessage: "Need the price list for facial services.",
    intent: "Pricing",
    status: "waiting",
    time: "09:18",
  },
  {
    id: "c-03",
    name: "Hira Malik",
    phone: "+92 333 4455667",
    lastMessage: "Thanks, see you tomorrow.",
    intent: "Confirmation",
    status: "resolved",
    time: "Yesterday",
  },
];

export const bookings: Booking[] = [
  {
    id: "b-01",
    customer: "Ayesha Khan",
    service: "Hair color",
    staff: "Sana",
    date: "Today, 6:30 PM",
    status: "confirmed",
    amount: 8500,
  },
  {
    id: "b-02",
    customer: "Hira Malik",
    service: "Hydra facial",
    staff: "Mina",
    date: "Tomorrow, 3:00 PM",
    status: "pending",
    amount: 6500,
  },
  {
    id: "b-03",
    customer: "Noor Fatima",
    service: "Consultation",
    staff: "Adeel",
    date: "Fri, 12:15 PM",
    status: "confirmed",
    amount: 2500,
  },
];

export const customers: Customer[] = [
  {
    id: "u-01",
    name: "Ayesha Khan",
    phone: "+92 300 1122334",
    visits: 8,
    lastSeen: "Today",
    tag: "Regular",
  },
  {
    id: "u-02",
    name: "Bilal Ahmed",
    phone: "+92 321 8877665",
    visits: 2,
    lastSeen: "Yesterday",
    tag: "Lead",
  },
  {
    id: "u-03",
    name: "Hira Malik",
    phone: "+92 333 4455667",
    visits: 5,
    lastSeen: "Jun 29",
    tag: "VIP",
  },
];
