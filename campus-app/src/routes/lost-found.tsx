import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { Layout, Panel, Btn, Field, Stamp, Msg, Empty } from "@/components/campus/ui";
import {
  useDB,
  update,
  uid,
  claimCode,
  fmtDate,
  scoreMatch,
  type LFItem,
} from "@/lib/campus-store";

export const Route = createFileRoute("/lost-found")({
  head: () => ({
    meta: [
      { title: "Lost & Found — Campus Problem Solver" },
      {
        name: "description",
        content:
          "Post a lost or found campus item, browse approved listings, see smart match scores and claim your item with a pickup code.",
      },
      { property: "og:title", content: "Campus Lost & Found" },
      {
        property: "og:description",
        content: "Smart matching between lost and found campus items, with claim tickets.",
      },
    ],
  }),
  component: LostFound,
});

const CATEGORIES = [
  "Bag / backpack",
  "Electronics",
  "ID / cards",
  "Keys",
  "Clothing",
  "Water bottle",
  "Books / notes",
  "Jewelry / accessories",
  "Other",
];

function LostFound() {
  const db = useDB();
  const [type, setType] = useState<"lost" | "found">("lost");
  const [form, setForm] = useState({
    title: "",
    category: CATEGORIES[0]!,
    location: "",
    date: "",
    description: "",
    reporter: "",
    contact: "",
  });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("");
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all");
  const [matchFor, setMatchFor] = useState<LFItem | null>(null);
  const [claimFor, setClaimFor] = useState<LFItem | null>(null);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.title || !form.location || !form.reporter) {
      setMsg({ ok: false, text: "Please fill in at least title, location and your name." });
      return;
    }
    update((d) => ({
      ...d,
      lf: [{ id: uid(), type, ...form, status: "pending", createdAt: Date.now() }, ...d.lf],
    }));
    setMsg({ ok: true, text: "Submitted. An admin will approve it shortly." });
    setForm({ ...form, title: "", location: "", description: "" });
  };

  const listings = useMemo(() => {
    const q = query.toLowerCase();
    return db.lf
      .filter((i) => i.status !== "pending")
      .filter((i) => (filter === "all" ? true : i.type === filter))
      .filter((i) => (cat ? i.category === cat : true))
      .filter((i) =>
        q ? `${i.title} ${i.description} ${i.location}`.toLowerCase().includes(q) : true,
      );
  }, [db.lf, query, cat, filter]);

  const matches = useMemo(() => {
    if (!matchFor) return [];
    return db.lf
      .filter((i) => i.type === "found" && i.status === "approved")
      .map((f) => ({ item: f, ...scoreMatch(matchFor, f) }))
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [db.lf, matchFor]);

  const doClaim = (item: LFItem) => {
    const code = item.claimCode ?? claimCode();
    update((d) => ({
      ...d,
      lf: d.lf.map((i) => (i.id === item.id ? { ...i, claimCode: code } : i)),
    }));
    setClaimFor({ ...item, claimCode: code });
    setMatchFor(null);
  };

  return (
    <Layout>
      <Panel title="Report an item" hint="Posts go live after a quick admin check.">
        <div className="mb-4 flex w-fit overflow-hidden rounded-sm border-2 border-primary">
          {(["lost", "found"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`stamp-text px-5 py-2 text-xs ${
                type === t
                  ? t === "lost"
                    ? "bg-alert text-primary-foreground"
                    : "bg-ok text-primary-foreground"
                  : "bg-secondary text-primary"
              }`}
            >
              {t === "lost" ? "Lost it" : "Found it"}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Field label="Item title">
            <input
              className="field"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Blue Jansport backpack"
            />
          </Field>
          <Field label="Category">
            <select className="field" value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <Field label="Location">
            <input
              className="field"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. Library, 2nd floor"
            />
          </Field>
          <Field label="Date">
            <input
              className="field"
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
            />
          </Field>
        </div>
        <div className="mt-3">
          <span className="label-cap">Description</span>
          <textarea
            className="field min-h-[70px]"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Color, brand, distinguishing marks..."
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <Field label="Your name">
            <input
              className="field"
              value={form.reporter}
              onChange={(e) => set("reporter", e.target.value)}
              placeholder="So we know who posted this"
            />
          </Field>
          <Field label="Contact">
            <input
              className="field"
              value={form.contact}
              onChange={(e) => set("contact", e.target.value)}
              placeholder="Email or phone"
            />
          </Field>
        </div>
        <div className="mt-4">
          <Btn onClick={submit}>Submit for approval</Btn>
        </div>
        {msg ? <Msg ok={msg.ok}>{msg.text}</Msg> : null}
      </Panel>

      <Panel title="Browse listings">
        <div className="flex flex-wrap gap-3">
          <input
            className="field flex-2 min-w-[12rem]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, description, location..."
          />
          <select className="field min-w-[10rem] flex-1" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">All categories</option>
            {[...new Set(db.lf.map((i) => i.category))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex gap-2">
          {(["all", "lost", "found"] as const).map((f) => (
            <Btn key={f} variant="chip" active={filter === f} onClick={() => setFilter(f)}>
              {f}
            </Btn>
          ))}
        </div>
        {listings.length === 0 ? (
          <Empty>Nothing here yet. Post an item or check back soon.</Empty>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((i) => (
              <article key={i.id} className="ticket overflow-hidden">
                <span className="notch-l" />
                <span className="notch-r" />
                <div className="p-4">
                  <Stamp tone={i.status === "claimed" ? "claimed" : i.type}>
                    {i.status === "claimed" ? "Claimed" : i.type}
                  </Stamp>
                  <h3 className="mt-2.5 mb-1 text-base font-bold">{i.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {i.category} · {i.location}
                    {i.date ? ` · ${fmtDate(i.date)}` : ""}
                  </p>
                  <p className="mt-2 text-sm">{i.description}</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-dashed border-primary bg-secondary/40 p-3">
                  <span className="text-xs text-muted-foreground">posted by {i.reporter}</span>
                  {i.status !== "claimed" ? (
                    i.type === "lost" ? (
                      <Btn size="sm" variant="outline" onClick={() => setMatchFor(i)}>
                        Find matches
                      </Btn>
                    ) : (
                      <Btn size="sm" variant="outline" onClick={() => doClaim(i)}>
                        This is mine
                      </Btn>
                    )
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>

      {matchFor ? (
        <Modal title={`Matches for "${matchFor.title}"`} onClose={() => setMatchFor(null)}>
          {matches.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No strong matches yet. Check back as more found items get posted.
            </p>
          ) : (
            matches.map((m) => (
              <div key={m.item.id} className="mt-3 rounded-sm border-[1.5px] border-border bg-white p-3">
                <strong className="text-sm">{m.item.title}</strong>
                <span className="text-xs text-muted-foreground"> · {m.item.location}</span>
                <div className="my-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-gold-deep" style={{ width: `${m.score}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Match score {m.score}% — {m.reasons.join("; ")}
                </p>
                <div className="mt-2">
                  <Btn size="sm" variant="outline" onClick={() => doClaim(m.item)}>
                    Claim this one
                  </Btn>
                </div>
              </div>
            ))
          )}
        </Modal>
      ) : null}

      {claimFor ? (
        <Modal title={`Claim "${claimFor.title}"`} onClose={() => setClaimFor(null)}>
          <p className="text-sm text-muted-foreground">
            Show this code at the front desk. An admin confirms the handover.
          </p>
          <div className="mt-4 flex flex-col overflow-hidden rounded-sm border-2 border-dashed border-primary sm:flex-row">
            <div className="flex-1 p-4">
              <p className="label-cap">Item</p>
              <p className="text-sm font-semibold">{claimFor.title}</p>
              <p className="mt-2 text-xs text-muted-foreground">Found at {claimFor.location}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Contact: {claimFor.contact || "via admin desk"}
              </p>
            </div>
            <div className="bg-secondary p-4 text-center sm:w-40">
              <p className="label-cap">Claim code</p>
              <p className="stamp-text text-base text-gold-deep">{claimFor.claimCode}</p>
            </div>
          </div>
        </Modal>
      ) : null}
    </Layout>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/55 p-5"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-md overflow-auto rounded-md border-2 border-primary bg-card p-6 shadow-block-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-3 cursor-pointer text-xl text-muted-foreground"
          aria-label="Close"
        >
          ×
        </button>
        <h3 className="mt-0 mb-2 pr-6 text-lg font-bold">{title}</h3>
        {children}
      </div>
    </div>
  );
}
