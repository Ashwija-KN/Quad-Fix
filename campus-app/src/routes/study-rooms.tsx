import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Layout, Panel, Stamp, Msg } from "@/components/campus/ui";
import { useDB, update } from "@/lib/campus-store";

export const Route = createFileRoute("/study-rooms")({
  head: () => ({
    meta: [
      { title: "Study Room Booking — Campus Problem Solver" },
      {
        name: "description",
        content:
          "See which library rooms and discussion pods are free today and reserve an hourly slot in two taps.",
      },
      { property: "og:title", content: "Campus Study Room Booking" },
      {
        property: "og:description",
        content: "Hourly slot booking for library rooms, silent study desks and discussion pods.",
      },
    ],
  }),
  component: StudyRooms,
});

function StudyRooms() {
  const db = useDB();
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const book = (roomId: string, time: string) => {
    if (!name.trim()) {
      setMsg({ ok: false, text: "Add your name first so the desk knows who booked." });
      return;
    }
    update((d) => ({
      ...d,
      rooms: d.rooms.map((r) =>
        r.id === roomId
          ? {
              ...r,
              slots: r.slots.map((s) => (s.time === time && !s.takenBy ? { ...s, takenBy: name.trim() } : s)),
            }
          : r,
      ),
    }));
    setMsg({ ok: true, text: `Booked ${time} — show your name at the desk.` });
  };

  return (
    <Layout>
      <Panel title="Library & study rooms" hint="Pick an open hourly slot. Struck-through slots are already taken.">
        <div className="max-w-sm">
          <span className="label-cap">Your name</span>
          <input
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ananya R."
          />
        </div>
        {msg ? <Msg ok={msg.ok}>{msg.text}</Msg> : null}
        <div className="mt-5 grid gap-4">
          {db.rooms.map((r) => {
            const free = r.slots.filter((s) => !s.takenBy).length;
            return (
              <article key={r.id} className="ticket p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold">{r.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {r.seats} seats · {free} of {r.slots.length} slots free today
                    </p>
                  </div>
                  <Stamp tone={free === 0 ? "full" : free < 4 ? "filling" : "available"}>
                    {free === 0 ? "Full" : free < 4 ? "Filling" : "Available"}
                  </Stamp>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {r.slots.map((s) => (
                    <button
                      key={s.time}
                      disabled={!!s.takenBy}
                      onClick={() => book(r.id, s.time)}
                      className={`rounded-sm border-[1.5px] px-2 py-2 text-xs ${
                        s.takenBy
                          ? "cursor-not-allowed border-border bg-secondary text-muted-foreground line-through"
                          : "cursor-pointer border-border bg-white hover:border-gold-deep"
                      }`}
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </Panel>
    </Layout>
  );
}
