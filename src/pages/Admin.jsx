import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Check, Copy, Download, KeyRound, Search, Trash2, UserPlus, Users, Wand2 } from "lucide-react";
import { goToLogin, useAuth } from "../auth/AuthContext";
import AdminTabs from "../components/AdminTabs";

// ─────────────────────────────────────────────────────────────────────────
// Admin panel: create sign-in accounts for students and staff, reset
// passwords, disable or delete accounts. Talks to /api/admin/users.
// ─────────────────────────────────────────────────────────────────────────

const ENDPOINT = "/api/admin/users";

async function api(method, { body, query = "" } = {}) {
  const res = await fetch(ENDPOINT + query, {
    method,
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    // non-JSON error page
  }
  if (res.status === 401) {
    goToLogin();
    throw new Error("Your session has ended. Please sign in again.");
  }
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status}).`);
  return data;
}

// No look-alike characters (0/O, 1/l/I), so passwords are easy to read out.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
function generatePassword(length = 12) {
  const out = [];
  const buf = new Uint8Array(1);
  while (out.length < length) {
    crypto.getRandomValues(buf);
    if (buf[0] < 224) out.push(ALPHABET[buf[0] % ALPHABET.length]); // 224 = 4 × 56, no modulo bias
  }
  return out.join("");
}

function formatDate(value, withTime = true) {
  if (!value) return "Never";
  return new Date(value).toLocaleString(undefined, withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" });
}

function signInText(email, password) {
  return `Email: ${email}\nPassword: ${password}\nSign in at: ${window.location.origin}/login`;
}

function downloadCsv(rows, filename) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = ["email,name,password", ...rows.map((r) => [r.email, r.name, r.password].map(esc).join(","))];
  const url = URL.createObjectURL(new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const inputCls =
  "w-full rounded-md border border-black/15 bg-paper px-3 py-2 text-sm text-ink placeholder:text-slate/60 focus:border-stage-2 focus:outline-none focus:ring-2 focus:ring-stage-2/20";
const primaryBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-md bg-stage-2 px-4 py-2 font-display text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60";
const smallBtn =
  "inline-flex items-center gap-1.5 rounded-md border border-black/10 bg-paper px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-card disabled:opacity-60";
const cardCls = "rounded-xl border border-black/5 bg-card p-5 md:p-6";

function CopyButton({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={smallBtn}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // clipboard blocked; the text is still on screen
        }
      }}
    >
      {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
      {copied ? "Copied" : label}
    </button>
  );
}

function Notice({ type, children }) {
  const cls = type === "error" ? "bg-[#fdecec] text-[#9b1c1d]" : "bg-[#e8f5ec] text-[#1d5b33]";
  return (
    <div role={type === "error" ? "alert" : "status"} className={`rounded-md px-3 py-2.5 text-sm ${cls}`}>
      {children}
    </div>
  );
}

function Credentials({ email, password }) {
  return (
    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-md bg-paper px-3 py-2 font-mono text-xs text-ink">
      <span>
        {email} · {password}
      </span>
      <CopyButton text={signInText(email, password)} label="Copy sign-in details" />
    </div>
  );
}

// ── Add one account ───────────────────────────────────────────────────────
function AddOne({ onDone }) {
  const empty = { email: "", name: "", password: "", role: "student" };
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);
  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    setCreated(null);
    setBusy(true);
    try {
      const data = await api("POST", { body: { users: [form] } });
      if (data.created.length) {
        setCreated({ email: data.created[0].email, password: form.password });
        setForm({ ...empty, role: form.role });
        onDone();
      } else {
        setError(data.skipped[0]?.reason || "Couldn't create the account.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className={cardCls}>
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
        <UserPlus size={18} aria-hidden="true" /> Add an account
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-ink">Email</span>
          <input type="email" required value={form.email} onChange={update("email")} className={inputCls} placeholder="student@example.com" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink">Name (optional)</span>
          <input value={form.name} onChange={update("name")} className={inputCls} placeholder="First Last" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink">Role</span>
          <select value={form.role} onChange={update("role")} className={inputCls}>
            <option value="student">Student</option>
            <option value="admin">Admin (can manage accounts)</option>
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-ink">Password (at least 8 characters)</span>
          <div className="flex gap-2">
            <input required minLength={8} value={form.password} onChange={update("password")} className={`${inputCls} font-mono`} />
            <button type="button" className={smallBtn} onClick={() => setForm((f) => ({ ...f, password: generatePassword() }))}>
              <Wand2 size={14} aria-hidden="true" /> Generate
            </button>
          </div>
        </label>
      </div>
      <div className="mt-4 space-y-3">
        {error && <Notice type="error">{error}</Notice>}
        {created && (
          <Notice type="ok">
            Account created. Share these sign-in details with the person now — the password can't be shown again later.
            <Credentials email={created.email} password={created.password} />
          </Notice>
        )}
        <button type="submit" disabled={busy} className={primaryBtn}>
          {busy ? "Adding…" : "Add account"}
        </button>
      </div>
    </form>
  );
}

// ── Add many accounts from a pasted list ─────────────────────────────────
function parseLines(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/[,;\t]/).map((s) => s.trim()))
    .filter(([first]) => first && first.toLowerCase() !== "email") // skip a header row
    .map(([email = "", name = "", password = ""]) => ({ email, name, password }));
}

function AddMany({ onDone }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const rows = useMemo(() => parseLines(text), [text]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    if (rows.length === 0) return setError("Paste at least one line.");
    const users = rows.map((r) => ({ ...r, password: r.password || generatePassword(), role: "student" }));
    setBusy(true);
    try {
      const data = await api("POST", { body: { users } });
      const createdEmails = new Set(data.created.map((u) => u.email));
      const createdRows = users
        .map((u) => ({ ...u, email: u.email.trim().toLowerCase() }))
        .filter((u) => createdEmails.has(u.email));
      setResult({ created: createdRows, skipped: data.skipped });
      if (createdRows.length) {
        setText("");
        onDone();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className={cardCls}>
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
        <Users size={18} aria-hidden="true" /> Add many students at once
      </h2>
      <p className="mt-1 text-sm text-slate">
        One student per line: <code className="rounded bg-paper px-1">email, name, password</code>. Name and password are
        optional — a password is generated when left out. You can paste straight from Excel.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        spellCheck={false}
        className={`${inputCls} mt-3 font-mono text-xs`}
        placeholder={"aysel@example.com, Aysel Mammadova\nrashad@example.com, Rashad Aliyev, MyPass2026\nnigar@example.com"}
      />
      <div className="mt-3 space-y-3">
        {error && <Notice type="error">{error}</Notice>}
        {result && (
          <Notice type={result.created.length ? "ok" : "error"}>
            <p>
              {result.created.length} account{result.created.length === 1 ? "" : "s"} created
              {result.skipped.length ? `, ${result.skipped.length} skipped` : ""}.
            </p>
            {result.skipped.length > 0 && (
              <ul className="mt-1 list-disc pl-5 text-xs">
                {result.skipped.map((s) => (
                  <li key={`${s.index}-${s.email}`}>
                    {s.email || `Line ${s.index + 1}`}: {s.reason}
                  </li>
                ))}
              </ul>
            )}
            {result.created.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className={smallBtn}
                  onClick={() => downloadCsv(result.created, `sign-in-details-${new Date().toISOString().slice(0, 10)}.csv`)}
                >
                  <Download size={14} aria-hidden="true" /> Download sign-in details (CSV)
                </button>
                <span className="text-xs">Download now — passwords can't be shown again later.</span>
              </div>
            )}
          </Notice>
        )}
        <button type="submit" disabled={busy || rows.length === 0} className={primaryBtn}>
          {busy ? "Adding…" : rows.length ? `Add ${rows.length} student${rows.length === 1 ? "" : "s"}` : "Add students"}
        </button>
      </div>
    </form>
  );
}

// ── Account list ─────────────────────────────────────────────────────────
function UserRow({ u, me, onChange }) {
  const [mode, setMode] = useState(null); // "password" | "delete"
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null);
  const isMe = u.id === me.id;

  async function run(fn) {
    setBusy(true);
    setNote(null);
    try {
      await fn();
    } catch (err) {
      setNote({ type: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  const changeRole = (role) =>
    run(async () => {
      await api("PATCH", { body: { id: u.id, role } });
      setNote({ type: "ok", text: `Role changed to ${role}. They'll need to sign in again.` });
      onChange();
    });

  const toggleActive = () =>
    run(async () => {
      await api("PATCH", { body: { id: u.id, active: !u.active } });
      setNote({ type: "ok", text: u.active ? "Account disabled — they're signed out and can't sign in." : "Account enabled." });
      onChange();
    });

  const savePassword = (e) => {
    e.preventDefault();
    run(async () => {
      await api("PATCH", { body: { id: u.id, password } });
      setNote({ type: "ok", text: "Password changed. Share the new sign-in details:", email: u.email, password });
      setMode(null);
      setPassword("");
      onChange();
    });
  };

  const remove = () =>
    run(async () => {
      await api("DELETE", { query: `?id=${u.id}` });
      onChange();
    });

  return (
    <>
      <tr className="border-t border-black/5 align-middle">
        <td className="px-4 py-3">
          <div className="font-medium text-ink">
            {u.email} {isMe && <span className="ml-1 text-xs font-normal text-slate">(you)</span>}
          </div>
          {u.name && <div className="text-xs text-slate">{u.name}</div>}
        </td>
        <td className="px-4 py-3">
          <select
            aria-label={`Role for ${u.email}`}
            value={u.role}
            disabled={isMe || busy}
            onChange={(e) => changeRole(e.target.value)}
            className="rounded-md border border-black/10 bg-paper px-2 py-1 text-xs disabled:opacity-70"
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
              u.active ? "bg-[#e8f5ec] text-[#1d5b33]" : "bg-[#fdecec] text-[#9b1c1d]"
            }`}
          >
            {u.active ? "Active" : "Disabled"}
          </span>
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-xs text-slate">{formatDate(u.lastLoginAt)}</td>
        <td className="whitespace-nowrap px-4 py-3 text-xs text-slate">{formatDate(u.createdAt, false)}</td>
        <td className="px-4 py-3">
          <div className="flex justify-end gap-1.5">
            <button type="button" className={smallBtn} disabled={busy} onClick={() => setMode(mode === "password" ? null : "password")}>
              <KeyRound size={14} aria-hidden="true" /> Reset password
            </button>
            {!isMe && (
              <>
                <button type="button" className={smallBtn} disabled={busy} onClick={toggleActive}>
                  {u.active ? "Disable" : "Enable"}
                </button>
                <button
                  type="button"
                  className={`${smallBtn} text-[#9b1c1d]`}
                  disabled={busy}
                  onClick={() => setMode(mode === "delete" ? null : "delete")}
                  aria-label={`Delete ${u.email}`}
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
      {(mode || note) && (
        <tr className="bg-card/60">
          <td colSpan={6} className="px-4 py-3">
            {mode === "password" && (
              <form onSubmit={savePassword} className="flex flex-wrap items-center gap-2">
                <label className="text-xs font-semibold text-ink" htmlFor={`pw-${u.id}`}>
                  New password for {u.email}
                </label>
                <input
                  id={`pw-${u.id}`}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputCls} max-w-56 font-mono`}
                />
                <button type="button" className={smallBtn} onClick={() => setPassword(generatePassword())}>
                  <Wand2 size={14} aria-hidden="true" /> Generate
                </button>
                <button type="submit" className={primaryBtn} disabled={busy}>
                  Save
                </button>
                <button type="button" className={smallBtn} onClick={() => setMode(null)}>
                  Cancel
                </button>
              </form>
            )}
            {mode === "delete" && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-ink">
                  Delete <b>{u.email}</b>? This can't be undone.
                </span>
                <button type="button" className={`${primaryBtn} bg-stage-5`} disabled={busy} onClick={remove}>
                  Delete account
                </button>
                <button type="button" className={smallBtn} onClick={() => setMode(null)}>
                  Cancel
                </button>
              </div>
            )}
            {note && (
              <div className={mode ? "mt-2" : ""}>
                <Notice type={note.type}>
                  {note.text}
                  {note.password && <Credentials email={note.email} password={note.password} />}
                </Notice>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function AccountList({ users, me, onChange, error }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (users || []).filter((u) => !q || `${u.email} ${u.name}`.toLowerCase().includes(q));
  }, [users, query]);

  return (
    <div className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-xl font-semibold text-ink">All accounts</h2>
        <label className="relative w-full max-w-xs">
          <span className="sr-only">Search accounts</span>
          <Search size={16} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by email or name" className={`${inputCls} pl-9`} />
        </label>
      </div>
      <div className="mt-4">
        {error && <Notice type="error">{error}</Notice>}
        {!users && !error && <p className="text-sm text-slate">Loading accounts…</p>}
        {users && filtered.length === 0 && <p className="text-sm text-slate">No accounts match.</p>}
        {users && filtered.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-black/5">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-card text-xs tracking-wide text-slate uppercase">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Account</th>
                  <th className="px-4 py-2.5 font-semibold">Role</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                  <th className="px-4 py-2.5 font-semibold">Last sign-in</th>
                  <th className="px-4 py-2.5 font-semibold">Created</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <UserRow key={u.id} u={u} me={me} onChange={onChange} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminPanel({ me }) {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const data = await api("GET");
      setUsers(data.users);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const counts = useMemo(() => {
    const list = users || [];
    return {
      students: list.filter((u) => u.role === "student").length,
      admins: list.filter((u) => u.role === "admin").length,
      disabled: list.filter((u) => !u.active).length,
    };
  }, [users]);

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <AdminTabs />
      <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">Accounts</h1>
      <p className="mt-2 max-w-2xl text-slate">
        Everyone needs an account to open this site. Passwords are stored encrypted, so you only see them when you create or
        reset them — pass them on to the person straight away.
      </p>
      {users && (
        <p className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
          <span className="rounded-full bg-card px-3 py-1 text-ink">
            {counts.students} student{counts.students === 1 ? "" : "s"}
          </span>
          <span className="rounded-full bg-card px-3 py-1 text-ink">
            {counts.admins} admin{counts.admins === 1 ? "" : "s"}
          </span>
          {counts.disabled > 0 && <span className="rounded-full bg-[#fdecec] px-3 py-1 text-[#9b1c1d]">{counts.disabled} disabled</span>}
        </p>
      )}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <AddOne onDone={refresh} />
        <AddMany onDone={refresh} />
      </div>
      <AccountList users={users} me={me} onChange={refresh} error={error} />
    </section>
  );
}

export default function Admin() {
  const { user } = useAuth();
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  if (user.dev) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-14 md:px-8">
        <h1 className="font-display text-3xl font-bold text-ink">Accounts</h1>
        <p className="mt-3 text-slate">
          The admin panel needs the backend and a database. Run <code>npm run build</code> then{" "}
          <code>npm run serve:local</code> (see README) to try it locally.
        </p>
      </section>
    );
  }
  return <AdminPanel me={user} />;
}
