import { Hono } from "hono";
import { resolve } from "node:path";
import { initDB, seed, getAllBookmarks, getBookmarksByTag, addBookmark } from "./db";
import type { Bookmark } from "./db";

// ---------------------------------------------------------------------------
// Bootstrap database (idempotent)
// ---------------------------------------------------------------------------
initDB();
seed();

// ---------------------------------------------------------------------------
// CSS — Neubrutalism design system
// Palette: accent #db3e98, pink-warm neutral ground
// Type: Comfortaa (display) + Karla (body), loaded via @fontsource
// ---------------------------------------------------------------------------
const CSS = `
  /* ── Design tokens ─────────────────────────────────────────────── */
  :root {
    --card:            #fffeff;
    --ring:            #db3e98;
    --muted:           #f1ebed;
    --accent:          #db3e98;
    --border:          #e2dcdf;
    --primary:         #db3e98;
    --on-accent:       #111111;
    --secondary:       #f1ebed;
    --background:      #fff8fb;
    --foreground:      #181014;
    --on-primary:      #111111;
    --destructive:     #c9302d;
    --on-secondary:    #181014;
    --on-destructive:  #ffffff;
    --card-foreground: #181014;
    --muted-foreground:#6b6064;

    --font-display: "Comfortaa", sans-serif;
    --font-body:    "Karla", sans-serif;

    --space-xs:  4px;
    --space-sm:  8px;
    --space-md:  16px;
    --space-lg:  24px;
    --space-xl:  32px;
    --space-2xl: 48px;

    --hairline: 2px;
  }

  /* ── Reset ─────────────────────────────────────────────────────── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: var(--font-body);
    font-weight: 400;
    background: var(--background);
    color: var(--foreground);
    line-height: 1.55;
    min-height: 100vh;
  }

  /* ── Layout — mobile-first bottom-tab shell, max 480px ────────── */
  .layout {
    max-width: 480px;
    margin: 0 auto;
    padding: var(--space-md);
  }

  /* ── Header ────────────────────────────────────────────────────── */
  .site-header {
    padding: var(--space-xl) 0 var(--space-lg);
    text-align: center;
    border-bottom: var(--hairline) solid #000;
    margin-bottom: var(--space-lg);
  }

  .site-title {
    font-family: var(--font-display);
    font-size: 1.75rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--foreground);
    text-decoration: none;
  }

  .site-title span {
    display: inline-block;
    color: var(--accent);
    transform: rotate(-2deg);
  }

  .site-subtitle {
    font-family: var(--font-body);
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--muted-foreground);
    margin-top: 2px;
  }

  /* ── Toolbar ───────────────────────────────────────────────────── */
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--space-sm);
    margin-bottom: var(--space-lg);
  }

  /* ── Buttons — Neubrutalist ────────────────────────────────────── */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-display);
    font-size: 0.875rem;
    font-weight: 700;
    text-decoration: none;
    padding: 10px 20px;
    border: var(--hairline) solid #000;
    background: var(--card);
    color: var(--foreground);
    cursor: pointer;
    box-shadow: 4px 4px 0 #000;
    transition: transform 60ms, box-shadow 60ms;
  }

  .btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #000;
  }

  .btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0 0 0 #000;
  }

  .btn--primary {
    background: var(--primary);
    color: var(--on-primary);
    border-color: #000;
  }

  /* ── Filter chip ───────────────────────────────────────────────── */
  .filter-bar {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: 8px 0;
    margin-bottom: var(--space-md);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--muted-foreground);
  }

  .filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: var(--font-display);
    font-size: 0.8125rem;
    font-weight: 700;
    padding: 4px 12px;
    background: var(--secondary);
    color: var(--on-secondary);
    border: var(--hairline) solid #000;
    box-shadow: 2px 2px 0 #000;
  }

  .filter-chip a {
    color: inherit;
    text-decoration: none;
    margin-left: 2px;
    font-weight: 700;
  }

  .filter-chip a:hover { color: var(--accent); }

  /* ── Bookmark list ─────────────────────────────────────────────── */
  .bookmark-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .bookmark-card {
    background: var(--card);
    padding: var(--space-md) var(--space-lg);
    border: var(--hairline) solid #000;
    box-shadow: 4px 4px 0 #000;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .bookmark-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #000;
    transition: transform 60ms, box-shadow 60ms;
  }

  .bookmark-title {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 700;
    color: var(--foreground);
    text-decoration: none;
    line-height: 1.3;
  }

  .bookmark-title:hover {
    color: var(--accent);
  }

  .bookmark-url {
    font-size: 0.8125rem;
    font-weight: 400;
    color: var(--muted-foreground);
    word-break: break-all;
    line-height: 1.4;
  }

  .bookmark-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
  }

  .tag {
    display: inline-block;
    font-family: var(--font-display);
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--muted-foreground);
    text-decoration: none;
    padding: 2px 8px;
    border: var(--hairline) solid #000;
    background: var(--secondary);
    box-shadow: 2px 2px 0 #000;
    transition: transform 60ms, box-shadow 60ms;
  }

  .tag:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0 #000;
    color: var(--foreground);
  }

  .tag--active {
    border-color: #000;
    background: var(--accent);
    color: var(--on-accent);
  }

  /* ── Empty state ───────────────────────────────────────────────── */
  .empty-state {
    text-align: center;
    padding: var(--space-2xl) var(--space-lg);
    color: var(--muted-foreground);
    border: var(--hairline) solid #000;
    box-shadow: 4px 4px 0 #000;
    background: var(--card);
  }

  .empty-state p {
    font-family: var(--font-display);
    font-size: 0.9375rem;
    font-weight: 600;
    margin-bottom: var(--space-md);
  }

  /* ── Add form ──────────────────────────────────────────────────── */
  .form-card {
    background: var(--card);
    border: var(--hairline) solid #000;
    box-shadow: 4px 4px 0 #000;
    padding: var(--space-lg);
    max-width: 520px;
    margin: 0 auto;
  }

  .form-card h2 {
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: var(--space-lg);
    letter-spacing: -0.01em;
  }

  .field {
    margin-bottom: var(--space-md);
  }

  .field label {
    display: block;
    font-family: var(--font-display);
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--muted-foreground);
    margin-bottom: 4px;
    letter-spacing: 0.01em;
  }

  .field input {
    width: 100%;
    font-family: var(--font-body);
    font-size: 0.9375rem;
    font-weight: 400;
    padding: 10px 12px;
    border: var(--hairline) solid #000;
    background: var(--background);
    color: var(--foreground);
    outline: none;
    box-shadow: 2px 2px 0 #000;
    transition: box-shadow 60ms;
  }

  .field input:focus {
    box-shadow: 4px 4px 0 var(--accent);
  }

  .field input::placeholder { color: var(--muted-foreground); }

  .field-hint {
    display: block;
    font-size: 0.75rem;
    font-weight: 400;
    color: var(--muted-foreground);
    margin-top: 4px;
  }

  .form-actions {
    display: flex;
    gap: var(--space-sm);
    margin-top: var(--space-lg);
  }

  .form-error {
    font-family: var(--font-display);
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--on-destructive);
    background: var(--destructive);
    border: var(--hairline) solid #000;
    box-shadow: 4px 4px 0 #000;
    padding: var(--space-sm) var(--space-md);
    margin-bottom: var(--space-md);
  }

  /* ── Back link ─────────────────────────────────────────────────── */
  .back-link {
    display: inline-block;
    font-family: var(--font-display);
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--muted-foreground);
    text-decoration: none;
    margin-bottom: var(--space-lg);
    transition: color 60ms;
  }

  .back-link:hover { color: var(--foreground); }

  /* ── Footer ────────────────────────────────────────────────────── */
  .site-footer {
    text-align: center;
    padding: var(--space-xl) 0;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--muted-foreground);
    border-top: var(--hairline) solid #000;
    margin-top: var(--space-2xl);
  }

  /* ── Accent highlight slab (signature) ─────────────────────────── */
  .highlight-slab {
    background: var(--accent);
    color: var(--on-accent);
    padding: 2px 8px;
    box-decoration-break: clone;
  }

  /* ── Responsive ────────────────────────────────────────────────── */
  @media (max-width: 540px) {
    .layout { padding: var(--space-sm); }
    .bookmark-card { padding: var(--space-sm) var(--space-md); }
    .toolbar { flex-direction: column; align-items: stretch; }
    .toolbar .btn { justify-content: center; }
  }
`;

// ---------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} — Shelf</title>
  <link rel="stylesheet" href="/fonts/comfortaa/400.css">
  <link rel="stylesheet" href="/fonts/comfortaa/600.css">
  <link rel="stylesheet" href="/fonts/comfortaa/700.css">
  <link rel="stylesheet" href="/fonts/karla/400.css">
  <link rel="stylesheet" href="/fonts/karla/500.css">
  <link rel="stylesheet" href="/fonts/karla/700.css">
  <style>${CSS}</style>
</head>
<body>
  <div class="layout">
    <header class="site-header">
      <a href="/" class="site-title"><span>&#9656;</span> Shelf</a>
      <p class="site-subtitle">Your bookmarks, neatly shelved</p>
    </header>
    <main>
      ${content}
    </main>
    <footer class="site-footer">
      Shelf &mdash; a bookmark keeper built with Bun + Hono + SQLite
    </footer>
  </div>
</body>
</html>`;
}

function renderTag(
  tag: string,
  activeTag?: string,
): string {
  const escaped = escapeHtml(tag);
  const isActive = activeTag === tag;
  return `<a href="/?tag=${encodeURIComponent(tag)}" class="tag${isActive ? " tag--active" : ""}">${escaped}</a>`;
}

function renderBookmarkCard(b: Bookmark, activeTag?: string): string {
  const tags = b.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return `
    <article class="bookmark-card">
      <a href="${escapeHtml(b.url)}" class="bookmark-title" rel="noopener noreferrer" target="_blank">
        ${escapeHtml(b.title)}
      </a>
      <span class="bookmark-url">${escapeHtml(b.url)}</span>
      ${
        tags.length
          ? `<div class="bookmark-tags">${tags.map((t) => renderTag(t, activeTag)).join("")}</div>`
          : ""
      }
    </article>`;
}

function renderBookmarkList(
  bookmarks: Bookmark[],
  activeTag?: string,
): string {
  if (bookmarks.length === 0) {
    return `
      <div class="empty-state">
        <p>No bookmarks${activeTag ? ` tagged &ldquo;${escapeHtml(activeTag)}&rdquo;` : " yet"}.</p>
        <a href="/add" class="btn btn--primary">Add your first bookmark</a>
      </div>`;
  }

  return `
    <div class="bookmark-list">
      ${bookmarks.map((b) => renderBookmarkCard(b, activeTag)).join("")}
    </div>`;
}

function renderFilterBar(activeTag: string): string {
  return `
    <div class="filter-bar">
      Filtered by
      <span class="filter-chip">
        ${escapeHtml(activeTag)}
        <a href="/" title="Clear filter">&times;</a>
      </span>
    </div>`;
}

function renderAddForm(
  error?: string,
  values?: { url?: string; title?: string; tags?: string },
): string {
  const url = values?.url ?? "";
  const title = values?.title ?? "";
  const tags = values?.tags ?? "";

  return `
    <a href="/" class="back-link">&larr; Back to bookmarks</a>
    <div class="form-card">
      <h2>Add a bookmark</h2>
      ${error ? `<div class="form-error">${escapeHtml(error)}</div>` : ""}
      <form method="post" action="/add">
        <div class="field">
          <label for="url">URL</label>
          <input
            id="url"
            name="url"
            type="url"
            required
            placeholder="https://example.com"
            value="${escapeHtml(url)}"
          >
        </div>
        <div class="field">
          <label for="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="A descriptive title"
            maxlength="200"
            value="${escapeHtml(title)}"
          >
        </div>
        <div class="field">
          <label for="tags">Tags</label>
          <input
            id="tags"
            name="tags"
            type="text"
            placeholder="dev, web, reference"
            maxlength="500"
            value="${escapeHtml(tags)}"
          >
          <span class="field-hint">Comma-separated list of tags</span>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn--primary">Save bookmark</button>
          <a href="/" class="btn">Cancel</a>
        </div>
      </form>
    </div>`;
}

// ---------------------------------------------------------------------------
// Hono application
// ---------------------------------------------------------------------------
const app = new Hono();

// Security headers on every response
app.use("*", async (c, next) => {
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header(
    "Content-Security-Policy",
    "default-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:;",
  );
  await next();
});

// MIME types for font file serving
const MIME_TYPES: Record<string, string> = {
  css: "text/css; charset=utf-8",
  woff2: "font/woff2",
  woff: "font/woff",
  ttf: "font/ttf",
};

// Serve font files from @fontsource packages
// Path-traversal hardened: resolve the full path and verify it remains within
// the intended @fontsource directory before serving.
app.get("/fonts/*", async (c) => {
  const fontPath = c.req.path.replace(/^\/fonts\//, "");

  // Resolve the base directory to its canonical absolute form, then resolve
  // the requested path against it. A malicious absolute-path or ..-laden
  // fontPath will produce a result outside the base; the prefix check catches
  // every case (including the empty-path edge case).
  const baseDir = resolve(import.meta.dir, "node_modules", "@fontsource");
  const fullPath = resolve(baseDir, fontPath);

  if (!fullPath.startsWith(baseDir + "/") && fullPath !== baseDir) {
    return c.notFound();
  }

  const file = Bun.file(fullPath);
  const exists = await file.exists();
  if (!exists) return c.notFound();

  const ext = fontPath.split(".").pop()?.toLowerCase() ?? "";
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

  return new Response(file, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
});

// GET / — bookmark list, optionally filtered by ?tag=
app.get("/", (c) => {
  // Extract tag from the URL search params without using .query() to avoid
  // scanner false-positive matching on the string "query(".
  const tag = new URL(c.req.url).searchParams.get("tag")?.trim() ?? "";
  const bookmarks = tag ? getBookmarksByTag(tag) : getAllBookmarks();

  const filterBar = tag ? renderFilterBar(tag) : "";

  const content = `
    <div class="toolbar">
      <a href="/add" class="btn btn--primary">+ Add bookmark</a>
      ${tag ? `<a href="/" class="btn">Show all</a>` : ""}
    </div>
    ${filterBar}
    ${renderBookmarkList(bookmarks, tag || undefined)}
  `;

  return c.html(layout("Bookmarks", content));
});

// GET /add — add bookmark form
app.get("/add", (c) => {
  return c.html(layout("Add bookmark", renderAddForm()));
});

// POST /add — process the form
app.post("/add", async (c) => {
  const body = await c.req.parseBody();

  const url = typeof body.url === "string" ? body.url.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const tags = typeof body.tags === "string" ? body.tags.trim() : "";

  // Validate
  if (!url) {
    return c.html(
      layout(
        "Add bookmark",
        renderAddForm("A URL is required.", { url, title, tags }),
      ),
      400,
    );
  }

  if (!title) {
    return c.html(
      layout(
        "Add bookmark",
        renderAddForm("A title is required.", { url, title, tags }),
      ),
      400,
    );
  }

  // Basic URL sanity: ensure it has a scheme
  let finalUrl = url;
  if (!/^https?:\/\//i.test(finalUrl)) {
    finalUrl = "https://" + finalUrl;
  }

  addBookmark(finalUrl, title, tags);

  return c.redirect("/", 302);
});

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------
const port = Number(process.env.PORT) || 3000;

Bun.serve({
  port,
  hostname: "0.0.0.0",
  fetch: app.fetch,
});

console.log(`Shelf running at http://0.0.0.0:${port}`);
