// Postgres connection and schema. Works with any Postgres: Neon (via the
// Vercel Marketplace), Supabase, or a server of your own. The tables are
// created automatically on first use.

import pg from "pg";
import { ConfigError } from "./session.js";
import { hashPassword } from "./passwords.js";

let pool = null;
let ready = null;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new ConfigError("Login is not configured: DATABASE_URL is not set.");
    }
    pool = new pg.Pool({ connectionString, max: 3, idleTimeoutMillis: 10_000 });
    pool.on("error", (err) => console.error("postgres pool error", err));
  }
  return pool;
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS app_users (
    id              BIGSERIAL PRIMARY KEY,
    email           TEXT NOT NULL UNIQUE,
    name            TEXT NOT NULL DEFAULT '',
    password_hash   TEXT NOT NULL,
    role            TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    session_version INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at   TIMESTAMPTZ
  );
  CREATE TABLE IF NOT EXISTS app_login_failures (
    id    BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    ip    TEXT NOT NULL,
    at    TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS app_login_failures_email_at ON app_login_failures (email, at);
  CREATE INDEX IF NOT EXISTS app_login_failures_ip_at ON app_login_failures (ip, at);
  CREATE TABLE IF NOT EXISTS app_worksheet_answers (
    user_id    BIGINT NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
    doc_id     TEXT NOT NULL,
    answers    JSONB NOT NULL DEFAULT '{}'::jsonb,
    filled     INTEGER NOT NULL DEFAULT 0,
    total      INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, doc_id)
  );
`;

// Creates the tables (once per server instance) and, if there is no admin
// yet, the first admin account from ADMIN_EMAIL / ADMIN_PASSWORD.
async function init() {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    // Serialise concurrent cold starts so CREATE TABLE doesn't race.
    await client.query("SELECT pg_advisory_xact_lock(724501)");
    await client.query(SCHEMA);

    const email = normalizeEmail(process.env.ADMIN_EMAIL);
    const password = process.env.ADMIN_PASSWORD;
    if (email && password) {
      const { rows } = await client.query("SELECT 1 FROM app_users WHERE role = 'admin' LIMIT 1");
      if (rows.length === 0) {
        await client.query(
          `INSERT INTO app_users (email, name, password_hash, role)
           VALUES ($1, 'Administrator', $2, 'admin')
           ON CONFLICT (email) DO UPDATE SET role = 'admin', active = TRUE,
             password_hash = EXCLUDED.password_hash,
             session_version = app_users.session_version + 1, updated_at = now()`,
          [email, await hashPassword(password)],
        );
      }
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function getDb() {
  const p = getPool();
  if (!ready) {
    ready = init().catch((err) => {
      ready = null;
      throw err;
    });
  }
  await ready;
  return p;
}

export function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function isValidEmail(email) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
