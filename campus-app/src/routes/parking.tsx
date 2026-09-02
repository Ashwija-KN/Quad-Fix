import { createFileRoute } from "@tanstack/react-router";
import { Layout, Panel, Btn, Stamp } from "@/components/campus/ui";
import { useDB, update, ago, type LotStatus } from "@/lib/campus-store";

export const Route = createFileRoute("/parking")({
  head: () => ({
    meta: [
      { title: "Parking Finder — Campus Problem Solver" },
      {
        name: "description",
        content:
          "Crowdsourced live status for every campus parking lot: see what is free, filling up or full before you drive in.",
      },
      { property: "og:title", content: "Campus Parking Finder" },
      {
        property: "og:description",
        content: "Live, student-reported parking lot availability across campus.",
      },
    ],
  }),
  component: Parking,
});

const FILL: Record<LotStatus, { pct: number; bar: string; label: string }> = {
  available: { pct: 25, bar: "bg-ok", label: "Spots open" },
  filling: { pct: 70, bar: "bg-gold-deep", label: "Filling up" },
  full: { pct: 100, bar: "bg-alert", label: "Full" },
};

function Parking() {
  const db = useDB();
  const report = (id: string, status: LotStatus) =>
    update((d) => ({
      ...d,
      lots: d.lots.map((l) =>
        l.id === id ? { ...l, status, updatedAt: Date.now(), updatedBy: "You" } : l,
      ),
    }));

  return (
    <Layout>
      <Panel
        title="Live lot status"
        hint="Anyone can update a lot when they walk or drive past it — crowdsourced, just like traffic apps."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {db.lots.map((l) => (
            <article key={l.id} className="ticket p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold">{l.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {l.capacity} spots · updated {ago(l.updatedAt)} by {l.updatedBy}
                  </p>
                </div>
                <Stamp tone={l.status}>{l.status}</Stamp>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-secondary">
                <div className={`h-full ${FILL[l.status].bar}`} style={{ width: `${FILL[l.status].pct}%` }} />
              </div>
              <p className="stamp-text mt-1 text-[10px] text-muted-foreground">{FILL[l.status].label}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["available", "filling", "full"] as LotStatus[]).map((s) => (
                  <Btn key={s} variant="chip" active={l.status === s} onClick={() => report(l.id, s)}>
                    {s === "available" ? "Free" : s === "filling" ? "Filling" : "Full"}
                  </Btn>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </Layout>
  );
}
