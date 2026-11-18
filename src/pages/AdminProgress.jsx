import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Download, Search } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import AdminTabs from "../components/AdminTabs";
import { documentById } from "../data/documents";
import { NoBackend, fetchAllProgress, percent } from "../worksheets/api";

// ─────────────────────────────────────────────────────────────────────────
// Admin: every student's progress on every fill-in worksheet. Each cell
// opens that student's answers (read-only).
// ─────────────────────────────────────────────────────────────────────────

const shortTitle = (id) => (documentById[id]?.title || id).split(/ — | – /)[0];

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function Cell({ p, total, to }) {
  const filled = p?.filled ?? 0;
  if (!p || (!filled && !p.updatedAt)) {
    return (
      <span className="text-xs text-slate/60" title="Not started">
        —
      </span>
    );
  }
  const pct = percent(filled, total);
  const tone = pct >= 100 ? "bg-[#2f8a4c] text-white" : pct >= 50 ? "bg-stage-2 text-white" : "bg-stage-2/15 text-stage-2";
  return (
    <Link
      to={to}
      className={`inline-block min-w-12 rounded-md px-2 py-1 text-center text-xs font-semibold ring-stage-2/40 hover:ring-2 ${tone}`}
      title={`${filled} of ${total} filled in — open answers`}
    >
      {pct}%
    </Link>
  );
}

function summarize(student, worksheets) {
  let filled = 0;
  let total = 0;
  let last = null;
  for (const w of worksheets) {
    const p = student.progress[w.id];
    total += w.total;
    filled += p?.filled ?? 0;
    if (p?.updatedAt && (!last || p.updatedAt > last)) last = p.updatedAt;
  }
  return { filled, total, pct: percent(filled, total), last };
}

function downloadCsv(worksheets, rows) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = ["email", "name", "overall %", ...worksheets.map((w) => `${shortTitle(w.id)} %`), "last activity"];
  const lines = rows.map(({ s, sum }) =>
    [
      s.email,
      s.name,
      sum.pct,
      ...worksheets.map((w) => percent(s.progress[w.id]?.filled ?? 0, w.total)),
      sum.last ? new Date(sum.last).toISOString() : "",
    ]
      .map(esc)
      .join(","),
  );
  const url = URL.createObjectURL(
    new Blob(["﻿" + [header.map(esc).join(","), ...lines].join("\r\n")], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `worksheet-progress-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function AdminProgress() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchAllProgress()
      .then(setData)
      .catch((err) => setError(err instanceof NoBackend ? "Progress needs the backend (see README)." : err.message));
  }, []);

  const rows = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.students
      .filter((s) => !q || `${s.email} ${s.name}`.toLowerCase().includes(q))
      .map((s) => ({ s, sum: summarize(s, data.worksheets) }));
  }, [data, query]);

  if (user?.role !== "admin") return <Navigate to="/" replace />;

  const all = data ? data.students.map((s) => summarize(s, data.worksheets)) : [];
  const started = all.filter((x) => x.filled > 0).length;
  const avg = all.length ? Math.round(all.reduce((n, x) => n + x.pct, 0) / all.length) : 0;

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <AdminTabs />
      <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">Progress</h1>
      <p className="mt-2 max-w-2xl text-slate">
        How much of each worksheet every student has filled in. Click a percentage to read that student's answers.
      </p>

      {data && (
        <p className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
          <span className="rounded-full bg-card px-3 py-1 text-ink">
            {data.students.length} student{data.students.length === 1 ? "" : "s"}
          </span>
          <span className="rounded-full bg-card px-3 py-1 text-ink">{started} started</span>
          <span className="rounded-full bg-card px-3 py-1 text-ink">{avg}% average completion</span>
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <label className="relative w-full max-w-xs">
          <span className="sr-only">Search students</span>
          <Search size={16} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by email or name"
            className="w-full rounded-md border border-black/15 bg-paper py-2 pr-3 pl-9 text-sm text-ink focus:border-stage-2 focus:ring-2 focus:ring-stage-2/20 focus:outline-none"
          />
        </label>
        {data && data.students.length > 0 && (
          <button
            type="button"
            onClick={() => downloadCsv(data.worksheets, rows)}
            className="inline-flex items-center gap-1.5 rounded-md border border-black/10 bg-paper px-3 py-2 text-xs font-medium text-ink hover:bg-card"
          >
            <Download size={14} aria-hidden="true" /> Download as CSV
          </button>
        )}
      </div>

      <div className="mt-4">
        {error && <p className="rounded-md bg-[#fdecec] px-3 py-2.5 text-sm text-[#9b1c1d]">{error}</p>}
        {!data && !error && <p className="text-sm text-slate">Loading progress…</p>}
        {data && data.students.length === 0 && (
          <p className="text-sm text-slate">
            No student accounts yet. Add students on the <Link to="/admin" className="text-stage-2 underline">Accounts</Link> tab.
          </p>
        )}
        {data && data.students.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-black/5">
            <table className="w-full text-left text-sm">
              <thead className="bg-card text-xs text-slate">
                <tr>
                  <th className="sticky left-0 z-10 bg-card px-4 py-2.5 font-semibold uppercase tracking-wide">Student</th>
                  <th className="px-3 py-2.5 font-semibold uppercase tracking-wide">Overall</th>
                  {data.worksheets.map((w) => (
                    <th key={w.id} className="min-w-28 px-3 py-2.5 align-bottom font-medium" title={documentById[w.id]?.title}>
                      {shortTitle(w.id)}
                    </th>
                  ))}
                  <th className="px-4 py-2.5 font-semibold uppercase tracking-wide whitespace-nowrap">Last activity</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ s, sum }) => (
                  <tr key={s.id} className="border-t border-black/5">
                    <td className="sticky left-0 z-10 bg-paper px-4 py-3">
                      <div className="font-medium text-ink">{s.name || s.email}</div>
                      {s.name && <div className="text-xs text-slate">{s.email}</div>}
                      {!s.active && <div className="text-xs text-[#9b1c1d]">Disabled</div>}
                    </td>
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-2">
                        <span className="h-1.5 w-16 overflow-hidden rounded-full bg-black/10" aria-hidden="true">
                          <span className="block h-full rounded-full bg-stage-2" style={{ width: `${sum.pct}%` }} />
                        </span>
                        <span className="text-xs font-semibold text-ink">{sum.pct}%</span>
                      </span>
                    </td>
                    {data.worksheets.map((w) => (
                      <td key={w.id} className="px-3 py-3">
                        <Cell p={s.progress[w.id]} total={w.total} to={`/worksheets/${w.id}?student=${s.id}`} />
                      </td>
                    ))}
                    <td className="px-4 py-3 text-xs whitespace-nowrap text-slate">{formatDate(sum.last)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
