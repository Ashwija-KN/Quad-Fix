import { useSyncExternalStore } from "react";

export type LFType = "lost" | "found";
export type LFStatus = "pending" | "approved" | "claimed";
export type LFItem = {
  id: string;
  type: LFType;
  title: string;
  category: string;
  location: string;
  date: string;
  description: string;
  reporter: string;
  contact: string;
  status: LFStatus;
  claimCode?: string;
  createdAt: number;
};

export type LotStatus = "available" | "filling" | "full";
export type Lot = {
  id: string;
  name: string;
  capacity: number;
  status: LotStatus;
  updatedAt: number;
  updatedBy: string;
};

export type ReportStatus = "Reported" | "In Progress" | "Resolved";
export type MaintReport = {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string;
  reporter: string;
  contact: string;
  status: ReportStatus;
  createdAt: number;
};

export type Room = {
  id: string;
  name: string;
  seats: number;
  slots: { time: string; takenBy: string | null }[];
};

export type Canteen = {
  id: string;
  name: string;
  crowd: "quiet" | "moderate" | "packed";
  menu: string[];
  reports: number;
  updatedAt: number;
};

export type SosAlert = {
  id: string;
  name: string;
  location: string;
  status: "Active" | "Resolved";
  createdAt: number;
};

export type DB = {
  lf: LFItem[];
  lots: Lot[];
  reports: MaintReport[];
  rooms: Room[];
  canteens: Canteen[];
  sos: SosAlert[];
};

export const SLOT_TIMES = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

// Uses the Web Crypto API (available in both browsers and the SSR runtime)
// instead of Math.random(), which is not cryptographically secure and can
// produce predictable/colliding values. Falls back to Math.random() only if
// crypto is somehow unavailable.
function randomAlphanumeric(length: number): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const cryptoObj = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (cryptoObj?.getRandomValues) {
    const bytes = new Uint32Array(length);
    cryptoObj.getRandomValues(bytes);
    return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  }
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export const uid = () => randomAlphanumeric(8).toLowerCase();
export const claimCode = () => "CPS-" + randomAlphanumeric(6).toUpperCase();

const room = (name: string, seats: number, taken: number[]): Room => ({
  id: uid(),
  name,
  seats,
  slots: SLOT_TIMES.map((time, i) => ({
    time,
    takenBy: taken.includes(i) ? "Reserved" : null,
  })),
});

const now = Date.now();

export const seed = (): DB => ({
  lf: [
    {
      id: uid(),
      type: "found",
      title: "Black Casio calculator",
      category: "Electronics",
      location: "Block C, Room 204",
      date: "2026-08-11",
      description: "Left on the third desk after the stats lecture. Has a chipped corner.",
      reporter: "Meera J.",
      contact: "meera@campus.edu",
      status: "approved",
      createdAt: now - 8.64e7,
    },
    {
      id: uid(),
      type: "lost",
      title: "Blue Jansport backpack",
      category: "Bag / backpack",
      location: "Library, 2nd floor",
      date: "2026-08-10",
      description: "Blue backpack with a red keychain, notes and a calculator inside.",
      reporter: "Arjun S.",
      contact: "9800011122",
      status: "approved",
      createdAt: now - 1.72e8,
    },
    {
      id: uid(),
      type: "found",
      title: "Steel water bottle, dented",
      category: "Water bottle",
      location: "Sports Complex",
      date: "2026-08-12",
      description: "Silver bottle with a faded sticker of a mountain.",
      reporter: "Coach Rao",
      contact: "sports@campus.edu",
      status: "approved",
      createdAt: now - 3.6e6,
    },
    {
      id: uid(),
      type: "lost",
      title: "Student ID card — 2nd year CSE",
      category: "ID / cards",
      location: "Canteen queue",
      date: "2026-08-12",
      description: "Plastic ID with a blue lanyard.",
      reporter: "Nikhil P.",
      contact: "nikhil@campus.edu",
      status: "pending",
      createdAt: now - 6e5,
    },
  ],
  lots: [
    { id: uid(), name: "North Block Lot", capacity: 40, status: "available", updatedAt: now - 9e5, updatedBy: "Ravi" },
    { id: uid(), name: "Library Basement", capacity: 60, status: "filling", updatedAt: now - 2.4e6, updatedBy: "Sana" },
    { id: uid(), name: "Main Gate Strip", capacity: 25, status: "full", updatedAt: now - 4.2e5, updatedBy: "Dev" },
    { id: uid(), name: "Hostel Side Lot", capacity: 30, status: "available", updatedAt: now - 6.6e6, updatedBy: "Anon" },
  ],
  reports: [
    {
      id: uid(),
      title: "AC not cooling in Room 204",
      category: "AC / Cooling",
      location: "Block C, Room 204",
      description: "Blows warm air since Monday morning.",
      reporter: "Arjun S.",
      contact: "arjun@campus.edu",
      status: "In Progress",
      createdAt: now - 2.6e8,
    },
    {
      id: uid(),
      title: "WiFi drops in reading hall",
      category: "WiFi / Network",
      location: "Library, 2nd floor",
      description: "Disconnects every few minutes near the window seats.",
      reporter: "Meera J.",
      contact: "meera@campus.edu",
      status: "Reported",
      createdAt: now - 4.3e7,
    },
    {
      id: uid(),
      title: "Leaking tap, ground floor washroom",
      category: "Plumbing",
      location: "Block A",
      description: "Constant drip, water pooling on the floor.",
      reporter: "Anon",
      contact: "",
      status: "Resolved",
      createdAt: now - 6.9e8,
    },
  ],
  rooms: [
    room("Library Room 3", 8, [0, 1, 4]),
    room("Discussion Pod A", 4, [3]),
    room("Silent Study 12", 6, [5, 6, 7]),
  ],
  canteens: [
    {
      id: uid(),
      name: "Main Canteen",
      crowd: "packed",
      menu: ["Veg thali", "Paneer roll", "Filter coffee", "Lemon rice"],
      reports: 14,
      updatedAt: now - 3e5,
    },
    {
      id: uid(),
      name: "Hostel Mess 2",
      crowd: "quiet",
      menu: ["Idli & sambar", "Egg curry", "Fruit bowl"],
      reports: 5,
      updatedAt: now - 3.3e6,
    },
    {
      id: uid(),
      name: "Café by the Lawn",
      crowd: "moderate",
      menu: ["Grilled sandwich", "Cold coffee", "Brownie"],
      reports: 9,
      updatedAt: now - 1.2e6,
    },
  ],
  sos: [
    {
      id: uid(),
      name: "Anonymous student",
      location: "Near Gate 3",
      status: "Resolved",
      createdAt: now - 5.4e8,
    },
  ],
});

const KEY = "campus_problem_solver_v1";
let snapshot: DB = seed();
let hydrated = false;
const listeners = new Set<() => void>();

function read(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...seed(), ...(JSON.parse(raw) as DB) };
  } catch {
    /* ignore */
  }
  return seed();
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  if (!hydrated) {
    hydrated = true;
    snapshot = read();
  }
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function update(fn: (db: DB) => DB) {
  snapshot = fn(snapshot);
  try {
    localStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {
    /* ignore */
  }
  emit();
}

export function useDB(): DB {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => snapshot,
  );
}

export function fmtDate(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

export function ago(ts: number) {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.round(h / 24)} d ago`;
}

export function scoreMatch(lost: LFItem, found: LFItem) {
  let score = 0;
  const reasons: string[] = [];
  if (lost.category === found.category) {
    score += 30;
    reasons.push("Same category");
  }
  const ll = lost.location.toLowerCase();
  const fl = found.location.toLowerCase();
  if (ll && fl && (ll.includes(fl) || fl.includes(ll))) {
    score += 25;
    reasons.push("Similar location");
  }
  if (lost.date && found.date) {
    const diff = Math.abs(+new Date(lost.date) - +new Date(found.date)) / 86400000;
    if (diff <= 7) {
      score += 15;
      reasons.push("Reported close in time");
    }
  }
  const words = (i: LFItem) =>
    new Set(
      `${i.title} ${i.description}`
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 2),
    );
  const lw = words(lost);
  const fw = words(found);
  const overlap = [...lw].filter((w) => fw.has(w));
  if (overlap.length) {
    score += Math.min(30, overlap.length * 8);
    reasons.push("Matching words: " + overlap.slice(0, 4).join(", "));
  }
  return { score: Math.min(100, score), reasons };
}
