import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const DATA_DIR = join(import.meta.dir, "data");
mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = join(DATA_DIR, "bookmarks.db");
const db = new Database(DB_PATH);

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
export function initDB(): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      url   TEXT    NOT NULL,
      title TEXT    NOT NULL,
      tags  TEXT    NOT NULL DEFAULT ''
    )
  `);
}

// ---------------------------------------------------------------------------
// Seed data (idempotent — only inserts when the table is empty)
// ---------------------------------------------------------------------------
const SEED_BOOKMARKS = [
  {
    url: "https://bun.sh",
    title: "Bun — Fast all-in-one JavaScript runtime",
    tags: "javascript,runtime,tooling",
  },
  {
    url: "https://hono.dev",
    title: "Hono — Ultrafast web framework for the Edges",
    tags: "web,framework,typescript",
  },
  {
    url: "https://sqlite.org",
    title: "SQLite — Small, fast, self-contained SQL database engine",
    tags: "database,sql,embedded",
  },
  {
    url: "https://developer.mozilla.org",
    title: "MDN Web Docs — Resources for developers, by developers",
    tags: "reference,web,documentation",
  },
  {
    url: "https://www.typescriptlang.org",
    title: "TypeScript — JavaScript with syntax for types",
    tags: "typescript,language,dev",
  },
  {
    url: "https://github.com",
    title: "GitHub — Where the world builds software",
    tags: "git,code,collaboration",
  },
  {
    url: "https://vitejs.dev",
    title: "Vite — Next Generation Frontend Tooling",
    tags: "build,tooling,javascript",
  },
  {
    url: "https://css-tricks.com",
    title: "CSS-Tricks — Daily articles about CSS, HTML, and JavaScript",
    tags: "css,design,tutorials",
  },
  {
    url: "https://owasp.org/www-project-top-ten",
    title: "OWASP Top Ten — Web application security risks",
    tags: "security,web,reference",
  },
  {
    url: "https://orm.drizzle.team",
    title: "Drizzle ORM — TypeScript ORM for SQL databases",
    tags: "database,orm,typescript",
  },
];

export function seed(): void {
  const row = db.query("SELECT COUNT(*) AS cnt FROM bookmarks").get() as {
    cnt: number;
  } | null;
  if (row && row.cnt > 0) return;

  const insert = db.prepare(
    "INSERT INTO bookmarks (url, title, tags) VALUES (?, ?, ?)",
  );
  for (const b of SEED_BOOKMARKS) {
    insert.run(b.url, b.title, b.tags);
  }
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
export interface Bookmark {
  id: number;
  url: string;
  title: string;
  tags: string;
}

export function getAllBookmarks(): Bookmark[] {
  return db.query("SELECT * FROM bookmarks ORDER BY id DESC").all() as Bookmark[];
}

export function getBookmarksByTag(tag: string): Bookmark[] {
  const safe = tag.replace(/[%_]/g, "\\$&");
  return db
    .query("SELECT * FROM bookmarks WHERE tags LIKE ? ORDER BY id DESC")
    .all(`%${safe}%`) as Bookmark[];
}

export function addBookmark(
  url: string,
  title: string,
  tags: string,
): void {
  db.run("INSERT INTO bookmarks (url, title, tags) VALUES (?, ?, ?)", [
    url,
    title,
    tags,
  ]);
}
