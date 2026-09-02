import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Layout, Panel, Btn, Field, Stamp, Msg, Empty } from "@/components/campus/ui";
import { useDB, update, uid, ago, type ReportStatus } from "@/lib/campus-store";

export const Route = createFileRoute("/maintenance")({
  head: () => ({
    meta: [
      { title: "Maintenance & Complaints — Campus Problem Solver" },
      {
        name: "description",
        content:
          "Log a broken AC, dead wifi or leaking tap on campus and follow the repair status from reported to resolved.",
      },
      { property: "og:title", content: "Campus Maintenance Reports" },
      {
        property: "og:description",
        content: "Report campus facility issues and track them through to resolution.",
      },
    ],
  }),
  component: Maintenance,
});

const CATS = ["Electrical", "Plumbing", "WiFi / Network", "Furniture", "Cleanliness", "AC / Cooling", "Other"];

function Maintenance() {
  const db = useDB();
  const [form, setForm] = useState({
    title: "",
    category: CATS[0]!,
    location: "",
    description: "",
    reporter: "",
    contact: "",
  });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [filter, setFilter] = useState<"all" | ReportStatus>("all");

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.title || !form.location) {
      setMsg({ ok: false, text: "Please add at least an issue title and a location." });
      return;
    }
    update((d) => ({
      ...d,
      reports: [
        {
          id: uid(),
          ...form,
          reporter: form.reporter || "Anon",
          status: "Reported" as ReportStatus,
          createdAt: Date.now(),
        },
        ...d.reports,
      ],
    }));
    setMsg({ ok: true, text: "Report logged. Facilities will pick it up from here." });
    setForm({ ...form, title: "", location: "", description: "" });
  };

  const list = db.reports.filter((r) => (filter === "all" ? true : r.status === filter));

  return (
    <Layout>
      <Panel title="Report a problem">
        <div className="flex flex-wrap gap-3">
          <Field label="Issue title">
            <input
              className="field"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. AC not cooling in Room 204"
            />
          </Field>
          <Field label="Category">
            <select className="field" value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <Field label="Building / room">
            <input
              className="field"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. Block C, Room 204"
            />
          </Field>
          <Field label="Your name">
            <input
              className="field"
              value={form.reporter}
              onChange={(e) => set("reporter", e.target.value)}
              placeholder="Name (optional)"
            />
          </Field>
        </div>
        <div className="mt-3">
          <span className="label-cap">Description</span>
          <textarea
            className="field min-h-[70px]"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="What's wrong, and since when?"
          />
        </div>
        <div className="mt-3">
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
          <Btn onClick={submit}>Submit report</Btn>
        </div>
        {msg ? <Msg ok={msg.ok}>{msg.text}</Msg> : null}
      </Panel>

      <Panel title="All reports">
        <div className="flex flex-wrap gap-2">
          {(["all", "Reported", "In Progress", "Resolved"] as const).map((f) => (
            <Btn key={f} variant="chip" active={filter === f} onClick={() => setFilter(f)}>
              {f}
            </Btn>
          ))}
        </div>
        {list.length === 0 ? (
          <Empty>No reports in this bucket.</Empty>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {list.map((r) => (
              <article key={r.id} className="ticket p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold">{r.title}</h3>
                  <Stamp tone={r.status}>{r.status}</Stamp>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.category} · {r.location} · {ago(r.createdAt)}
                </p>
                <p className="mt-2 text-sm">{r.description}</p>
                <p className="mt-3 border-t-2 border-dashed border-border pt-2 text-xs text-muted-foreground">
                  reported by {r.reporter}
                </p>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </Layout>
  );
}
