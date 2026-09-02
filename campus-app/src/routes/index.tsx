import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout, Panel } from "@/components/campus/ui";
import { useDB } from "@/lib/campus-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Campus Problem Solver — One hub for campus fixes" },
      {
        name: "description",
        content:
          "Report lost items, find free parking, log maintenance issues, book study rooms, check canteen crowds and send a safety alert.",
      },
      { property: "og:title", content: "Campus Problem Solver" },
      {
        property: "og:description",
        content:
          "Lost & found matching, live parking, maintenance tracking, room booking, canteen crowd and safety SOS in one campus hub.",
      },
    ],
  }),
  component: Home,
});

function Icon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

function Home() {
  const db = useDB();
  const openIssues = db.reports.filter((r) => r.status !== "Resolved").length;
  const freeLots = db.lots.filter((l) => l.status === "available").length;
  const activeSos = db.sos.filter((a) => a.status === "Active").length;

  const modules = [
    {
      to: "/lost-found" as const,
      n: "01",
      icon: <Icon d="M8 8V6a4 4 0 0 1 8 0v2M5 8h14v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8Zm4 5h6" />,
      title: "Lost & Found",
      desc: "Post a lost or found item, get smart matches, and claim it with a code ticket.",
      stat: `${db.lf.filter((i) => i.status !== "pending").length} active listings`,
      pct: Math.min(100, db.lf.length * 20),
      badge: "bg-m1-soft text-m1",
      bar: "bg-m1",
      wash: "bg-m1-soft",
    },
    {
      to: "/parking" as const,
      n: "02",
      icon: <Icon d="M9 18V6h4a3.5 3.5 0 0 1 0 7H9M4 3h16v18H4z" />,
      title: "Parking Finder",
      desc: "See which campus lots are free right now, reported live by other students.",
      stat: `${freeLots} / ${db.lots.length} lots free`,
      pct: db.lots.length ? (freeLots / db.lots.length) * 100 : 0,
      badge: "bg-m2-soft text-m2",
      bar: "bg-m2",
      wash: "bg-m2-soft",
    },
    {
      to: "/maintenance" as const,
      n: "03",
      icon: <Icon d="M14.5 5.5a4 4 0 1 0 4.9 4.9L21 12l-9 9-3-3 9-9-2.4-3.5Z" />,
      title: "Maintenance & Complaints",
      desc: "Report a broken AC, dead wifi or a leaking tap, and track the fix.",
      stat: `${openIssues} open issues`,
      pct: Math.min(100, openIssues * 25),
      badge: "bg-m3-soft text-m3",
      bar: "bg-m3",
      wash: "bg-m3-soft",
    },
    {
      to: "/study-rooms" as const,
      n: "04",
      icon: <Icon d="M4 5h6v14H4zM14 5h6v14h-6zM4 9h6M14 9h6" />,
      title: "Study Room Booking",
      desc: "Check which library rooms are free today and reserve an hourly slot.",
      stat: `${db.rooms.length} rooms bookable`,
      pct: Math.min(100, db.rooms.length * 20),
      badge: "bg-m4-soft text-m4",
      bar: "bg-m4",
      wash: "bg-m4-soft",
    },
    {
      to: "/canteen" as const,
      n: "05",
      icon: <Icon d="M4 10h16a8 8 0 0 1-8 8 8 8 0 0 1-8-8ZM9 6c0-1 1-1.5 1-2.5M13 6c0-1 1-1.5 1-2.5" />,
      title: "Canteen Crowd Tracker",
      desc: "See how busy the canteen is before you walk over, plus today's menu.",
      stat: `${db.canteens.length} canteens tracked`,
      pct: Math.min(100, db.canteens.length * 33),
      badge: "bg-m5-soft text-m5",
      bar: "bg-m5",
      wash: "bg-m5-soft",
    },
    {
      to: "/safety" as const,
      n: "06",
      icon: <Icon d="M12 3v3M5 12H2m20 0h-3M6 6 4 4m14 2 2-2M7 20h10a5 5 0 0 0-10 0Z" />,
      title: "Safety SOS",
      desc: "One-tap alert with your location, sent straight to campus security.",
      stat: `${activeSos} active alerts`,
      pct: activeSos ? 100 : 8,
      badge: "bg-m6-soft text-m6",
      bar: "bg-m6",
      wash: "bg-m6-soft",
    },
  ];

  const quick = [
    { label: "Lots free", value: `${freeLots}`, wash: "bg-m2-soft" },
    { label: "Open issues", value: `${openIssues}`, wash: "bg-m3-soft" },
    { label: "Rooms", value: `${db.rooms.length}`, wash: "bg-m4-soft" },
    { label: "SOS active", value: `${activeSos}`, wash: "bg-m6-soft" },
  ];

  return (
    <Layout>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quick.map((q) => (
          <div
            key={q.label}
            className={`rounded-xl border-2 border-primary p-4 text-center shadow-block ${q.wash}`}
          >
            <p className="font-display text-3xl font-bold">{q.value}</p>
            <p className="stamp-text mt-1 text-[10px] text-muted-foreground">{q.label}</p>
          </div>
        ))}
      </div>
      <Panel
        title="What do you need help with?"
        hint="Six small tools that fix the daily friction of campus life."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <Link
              key={m.to}
              to={m.to}
              className="group relative overflow-hidden rounded-xl border-2 border-primary bg-card p-5 shadow-block transition-transform hover:-translate-y-0.5"
            >
              <div className={`confetti absolute inset-0 opacity-40 ${m.wash}`} />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className={`icon-badge ${m.wash}`}>{m.icon}</span>
                  <span
                    className={`stamp-text inline-block -rotate-3 rounded-full border-2 border-current px-2 py-0.5 text-[10px] ${m.badge}`}
                  >
                    Module {m.n}
                  </span>
                </div>
                <h3 className="mt-3 mb-1.5 text-lg font-bold">{m.title}</h3>
                <p className="mb-3 text-sm text-muted-foreground">{m.desc}</p>
                <div className="bar-track mb-2">
                  <div
                    className={`h-full ${m.bar}`}
                    style={{ width: `${Math.max(6, Math.round(m.pct))}%` }}
                  />
                </div>
                <p className="stamp-text text-[11px]">{m.stat}</p>
              </div>
            </Link>
          ))}
        </div>
      </Panel>
    </Layout>
  );
}
