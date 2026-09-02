import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Layout, Panel, Stamp, Msg, Empty } from "@/components/campus/ui";
import { useDB, update, uid, ago } from "@/lib/campus-store";

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { title: "Safety SOS — Campus Problem Solver" },
      {
        name: "description",
        content:
          "One-tap campus safety alert that shares your location with security, plus a log of recent alerts and their status.",
      },
      { property: "og:title", content: "Campus Safety SOS" },
      {
        property: "og:description",
        content: "Send an emergency alert with your location to campus security in one tap.",
      },
    ],
  }),
  component: Safety,
});

function Safety() {
  const db = useDB();
  const [name, setName] = useState("");
  const [sent, setSent] = useState(false);

  const fire = () => {
    const label = name.trim() || "Anonymous student";
    const finish = (location: string) => {
      update((d) => ({
        ...d,
        sos: [{ id: uid(), name: label, location, status: "Active", createdAt: Date.now() }, ...d.sos],
      }));
      setSent(true);
    };
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => finish(`${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)}`),
        () => finish("Location unavailable — last seen on campus"),
        { timeout: 5000 },
      );
    } else {
      finish("Location unavailable — last seen on campus");
    }
  };

  return (
    <Layout>
      <Panel title="Campus safety">
        <div className="text-center">
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            Use this only in a genuine emergency. It shares your current location with campus security and logs the
            alert below.
          </p>
          <div className="mx-auto mt-5 max-w-xs text-left">
            <span className="label-cap">Your name (optional)</span>
            <input
              className="field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Stay anonymous if you prefer"
            />
          </div>
          <button
            onClick={fire}
            className="stamp-text mx-auto mt-7 h-44 w-44 cursor-pointer rounded-full border-[6px] border-alert/70 bg-alert text-2xl text-primary-foreground shadow-[8px_8px_0_var(--gold-deep)]"
          >
            SOS
          </button>
          {sent ? <Msg ok>Alert sent. Security has your location and is on the way.</Msg> : null}
          <p className="mt-6 text-[11px] text-muted-foreground">Demo only — not wired to a real dispatch system.</p>
        </div>
      </Panel>

      <Panel title="Recent alerts">
        {db.sos.length === 0 ? (
          <Empty>No alerts logged.</Empty>
        ) : (
          <div className="grid gap-3">
            {db.sos.map((a) => (
              <div
                key={a.id}
                className={`flex flex-wrap items-center justify-between gap-2 rounded-sm border-[1.5px] px-3 py-2.5 ${
                  a.status === "Active" ? "border-alert bg-alert-soft" : "border-border bg-white"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold">{a.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.location} · {ago(a.createdAt)}
                  </p>
                </div>
                <Stamp tone={a.status}>{a.status}</Stamp>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </Layout>
  );
}
