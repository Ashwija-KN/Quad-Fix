import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Layout, Panel, Btn, Field, Stamp, Msg, Empty } from "@/components/campus/ui";
import { useDB, update, uid, ago, fmtDate, SLOT_TIMES, type ReportStatus } from "@/lib/campus-store";
import { checkAdminPasscode } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Desk — Campus Problem Solver" },
      {
        name: "description",
        content:
          "Approve lost and found listings, confirm claim codes, update maintenance status, add lots and rooms, and resolve safety alerts.",
      },
      { property: "og:title", content: "Campus Admin Desk" },
      {
        property: "og:description",
        content: "Moderation and operations desk for the Campus Problem Solver hub.",
      },
    ],
  }),
  component: Admin,
});

const TABS = ["Lost & Found", "Parking Lots", "Maintenance", "Study Rooms", "Safety Alerts"] as const;

function Admin() {
  const db = useDB();
  const [pass, setPass] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [err, setErr] = useState(false);
  const [checking, setChecking] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Lost & Found");
  const [code, setCode] = useState("");
  const [claimMsg, setClaimMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [lot, setLot] = useState({ name: "", capacity: "" });
  const [room, setRoom] = useState({ name: "", seats: "" });

  const signIn = async () => {
    setChecking(true);
    setErr(false);
    try {
      // The passcode is checked on the server (see src/lib/admin-auth.ts) so
      // it never has to be shipped to or compared in the browser bundle.
      const result = await checkAdminPasscode({ data: { passcode: pass } });
      if (result.ok) {
        setSignedIn(true);
      } else {
        setErr(true);
      }
    } catch {
      setErr(true);
    } finally {
      setChecking(false);
    }
  };

  if (!signedIn) {
    return (
      <Layout>
        <Panel className="mx-auto max-w-sm text-center" title="Admin sign in">
          <div className="text-left">
            <span className="label-cap">Passcode</span>
            <input
              className="field"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Demo passcode: admin123"
              onKeyDown={(e) => e.key === "Enter" && !checking && signIn()}
            />
          </div>
          <div className="mt-4">
            <Btn onClick={signIn} disabled={checking}>
              {checking ? "Checking…" : "Enter admin panel"}
            </Btn>
          </div>
          {err ? <Msg>Wrong passcode. Try admin123.</Msg> : null}
          <p className="mt-3 text-[11px] text-muted-foreground">Demo-only gate, not real authentication.</p>
        </Panel>
      </Layout>
    );
  }

  const confirmClaim = () => {
    const item = db.lf.find((i) => i.claimCode && i.claimCode.toLowerCase() === code.trim().toLowerCase());
    if (!item) {
      setClaimMsg({ ok: false, text: "No listing matches that claim code." });
      return;
    }
    update((d) => ({
      ...d,
      lf: d.lf.map((i) => (i.id === item.id ? { ...i, status: "claimed" } : i)),
    }));
    setClaimMsg({ ok: true, text: `Handover confirmed for "${item.title}".` });
    setCode("");
  };

  return (
    <Layout>
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Btn key={t} variant="chip" active={tab === t} onClick={() => setTab(t)}>
            {t}
          </Btn>
        ))}
      </div>

      {tab === "Lost & Found" ? (
        <>
          <Panel title="Pending approvals">
            {db.lf.filter((i) => i.status === "pending").length === 0 ? (
              <Empty>Queue is clear.</Empty>
            ) : (
              db.lf
                .filter((i) => i.status === "pending")
                .map((i) => (
                  <div
                    key={i.id}
                    className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-sm border-[1.5px] border-border bg-white p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold">{i.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {i.type} · {i.category} · {i.location}
                        {i.date ? ` · ${fmtDate(i.date)}` : ""} · by {i.reporter}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Btn
                        size="sm"
                        onClick={() =>
                          update((d) => ({
                            ...d,
                            lf: d.lf.map((x) => (x.id === i.id ? { ...x, status: "approved" } : x)),
                          }))
                        }
                      >
                        Approve
                      </Btn>
                      <Btn
                        size="sm"
                        variant="outline"
                        onClick={() => update((d) => ({ ...d, lf: d.lf.filter((x) => x.id !== i.id) }))}
                      >
                        Reject
                      </Btn>
                    </div>
                  </div>
                ))
            )}
          </Panel>

          <Panel title="Confirm a claim">
            <div className="max-w-sm">
              <span className="label-cap">Claim code</span>
              <input
                className="field"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Code from the claimant's ticket"
              />
            </div>
            <div className="mt-4">
              <Btn variant="gold" onClick={confirmClaim}>
                Confirm handover
              </Btn>
            </div>
            {claimMsg ? <Msg ok={claimMsg.ok}>{claimMsg.text}</Msg> : null}
          </Panel>

          <Panel title="All listings">
            {db.lf.map((i) => (
              <div
                key={i.id}
                className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-sm border-[1.5px] border-border bg-white p-3"
              >
                <div>
                  <p className="text-sm font-semibold">{i.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {i.location} · {ago(i.createdAt)}
                    {i.claimCode ? ` · code ${i.claimCode}` : ""}
                  </p>
                </div>
                <Stamp tone={i.status}>{i.status}</Stamp>
              </div>
            ))}
          </Panel>
        </>
      ) : null}

      {tab === "Parking Lots" ? (
        <>
          <Panel title="Add a parking lot">
            <div className="flex flex-wrap gap-3">
              <Field label="Lot name">
                <input
                  className="field"
                  value={lot.name}
                  onChange={(e) => setLot({ ...lot, name: e.target.value })}
                  placeholder="e.g. North Block Lot"
                />
              </Field>
              <Field label="Capacity">
                <input
                  className="field"
                  type="number"
                  value={lot.capacity}
                  onChange={(e) => setLot({ ...lot, capacity: e.target.value })}
                  placeholder="e.g. 40"
                />
              </Field>
            </div>
            <div className="mt-4">
              <Btn
                onClick={() => {
                  if (!lot.name) return;
                  update((d) => ({
                    ...d,
                    lots: [
                      ...d.lots,
                      {
                        id: uid(),
                        name: lot.name,
                        capacity: Number(lot.capacity) || 0,
                        status: "available",
                        updatedAt: Date.now(),
                        updatedBy: "Admin",
                      },
                    ],
                  }));
                  setLot({ name: "", capacity: "" });
                }}
              >
                Add lot
              </Btn>
            </div>
          </Panel>

          <Panel title="Manage lots">
            {db.lots.map((l) => (
              <div
                key={l.id}
                className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-sm border-[1.5px] border-border bg-white p-3"
              >
                <div>
                  <p className="text-sm font-semibold">{l.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.capacity} spots · updated {ago(l.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Stamp tone={l.status}>{l.status}</Stamp>
                  <Btn
                    size="sm"
                    variant="outline"
                    onClick={() => update((d) => ({ ...d, lots: d.lots.filter((x) => x.id !== l.id) }))}
                  >
                    Remove
                  </Btn>
                </div>
              </div>
            ))}
          </Panel>
        </>
      ) : null}

      {tab === "Maintenance" ? (
        <Panel title="Update report status">
          {db.reports.map((r) => (
            <div key={r.id} className="mt-3 rounded-sm border-[1.5px] border-border bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{r.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.category} · {r.location} · {ago(r.createdAt)}
                  </p>
                </div>
                <Stamp tone={r.status}>{r.status}</Stamp>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["Reported", "In Progress", "Resolved"] as ReportStatus[]).map((s) => (
                  <Btn
                    key={s}
                    variant="chip"
                    active={r.status === s}
                    onClick={() =>
                      update((d) => ({
                        ...d,
                        reports: d.reports.map((x) => (x.id === r.id ? { ...x, status: s } : x)),
                      }))
                    }
                  >
                    {s}
                  </Btn>
                ))}
              </div>
            </div>
          ))}
        </Panel>
      ) : null}

      {tab === "Study Rooms" ? (
        <>
          <Panel title="Add a study room">
            <div className="flex flex-wrap gap-3">
              <Field label="Room name">
                <input
                  className="field"
                  value={room.name}
                  onChange={(e) => setRoom({ ...room, name: e.target.value })}
                  placeholder="e.g. Library Room 3"
                />
              </Field>
              <Field label="Total seats">
                <input
                  className="field"
                  type="number"
                  value={room.seats}
                  onChange={(e) => setRoom({ ...room, seats: e.target.value })}
                  placeholder="e.g. 8"
                />
              </Field>
            </div>
            <div className="mt-4">
              <Btn
                onClick={() => {
                  if (!room.name) return;
                  update((d) => ({
                    ...d,
                    rooms: [
                      ...d.rooms,
                      {
                        id: uid(),
                        name: room.name,
                        seats: Number(room.seats) || 0,
                        slots: SLOT_TIMES.map((time) => ({ time, takenBy: null })),
                      },
                    ],
                  }));
                  setRoom({ name: "", seats: "" });
                }}
              >
                Add room
              </Btn>
            </div>
          </Panel>

          <Panel title="Manage rooms">
            {db.rooms.map((r) => (
              <div
                key={r.id}
                className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-sm border-[1.5px] border-border bg-white p-3"
              >
                <div>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.seats} seats · {r.slots.filter((s) => s.takenBy).length} slots booked
                  </p>
                </div>
                <div className="flex gap-2">
                  <Btn
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      update((d) => ({
                        ...d,
                        rooms: d.rooms.map((x) =>
                          x.id === r.id ? { ...x, slots: x.slots.map((s) => ({ ...s, takenBy: null })) } : x,
                        ),
                      }))
                    }
                  >
                    Clear bookings
                  </Btn>
                  <Btn
                    size="sm"
                    variant="outline"
                    onClick={() => update((d) => ({ ...d, rooms: d.rooms.filter((x) => x.id !== r.id) }))}
                  >
                    Remove
                  </Btn>
                </div>
              </div>
            ))}
          </Panel>
        </>
      ) : null}

      {tab === "Safety Alerts" ? (
        <Panel title="Safety alerts">
          {db.sos.length === 0 ? (
            <Empty>No alerts logged.</Empty>
          ) : (
            db.sos.map((a) => (
              <div
                key={a.id}
                className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-sm border-[1.5px] border-border bg-white p-3"
              >
                <div>
                  <p className="text-sm font-semibold">{a.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.location} · {ago(a.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Stamp tone={a.status}>{a.status}</Stamp>
                  {a.status === "Active" ? (
                    <Btn
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        update((d) => ({
                          ...d,
                          sos: d.sos.map((x) => (x.id === a.id ? { ...x, status: "Resolved" } : x)),
                        }))
                      }
                    >
                      Mark resolved
                    </Btn>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </Panel>
      ) : null}
    </Layout>
  );
}
