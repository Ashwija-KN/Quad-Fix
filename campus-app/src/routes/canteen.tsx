import { createFileRoute } from "@tanstack/react-router";
import { Layout, Panel, Btn, Stamp } from "@/components/campus/ui";
import { useDB, update, ago } from "@/lib/campus-store";

export const Route = createFileRoute("/canteen")({
  head: () => ({
    meta: [
      { title: "Canteen Crowd Tracker — Campus Problem Solver" },
      {
        name: "description",
        content:
          "Check how busy each campus canteen is right now, see today's menu, and report the crowd level you found.",
      },
      { property: "og:title", content: "Campus Canteen Crowd Tracker" },
      {
        property: "og:description",
        content: "Live crowd levels and daily menus for every campus canteen and café.",
      },
    ],
  }),
  component: CanteenPage,
});

type Crowd = "quiet" | "moderate" | "packed";

const META: Record<Crowd, { pct: number; bar: string; wait: string }> = {
  quiet: { pct: 25, bar: "bg-ok", wait: "walk right in" },
  moderate: { pct: 60, bar: "bg-gold-deep", wait: "about 5 min wait" },
  packed: { pct: 100, bar: "bg-alert", wait: "15+ min wait" },
};

function CanteenPage() {
  const db = useDB();
  const report = (id: string, crowd: Crowd) =>
    update((d) => ({
      ...d,
      canteens: d.canteens.map((c) =>
        c.id === id ? { ...c, crowd, reports: c.reports + 1, updatedAt: Date.now() } : c,
      ),
    }));

  return (
    <Layout>
      <Panel title="How busy is it right now?" hint="Crowd levels come from students already standing in the queue.">
        <div className="grid gap-4 sm:grid-cols-2">
          {db.canteens.map((c) => (
            <article key={c.id} className="ticket p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {META[c.crowd].wait} · {c.reports} reports · {ago(c.updatedAt)}
                  </p>
                </div>
                <Stamp tone={c.crowd}>{c.crowd}</Stamp>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-secondary">
                <div className={`h-full ${META[c.crowd].bar}`} style={{ width: `${META[c.crowd].pct}%` }} />
              </div>
              <p className="label-cap mt-4">Today's menu</p>
              <ul className="ml-4 list-disc text-sm">
                {c.menu.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2 border-t-2 border-dashed border-border pt-3">
                {(["quiet", "moderate", "packed"] as Crowd[]).map((k) => (
                  <Btn key={k} variant="chip" active={c.crowd === k} onClick={() => report(c.id, k)}>
                    {k}
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
