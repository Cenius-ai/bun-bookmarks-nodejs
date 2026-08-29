# Installation

## 1. Prerequisites

- **Node.js 20 or later**  
  *Must run under the Bun runtime (not Node.js), but a recent Node.js is still required for compatibility.*
- **Bun** – install it from [bun.sh](https://bun.sh)

## 2. Get the code

Clone the repository:

```sh
git clone <repository-url>
cd shelf
```

## 3. Install dependencies

```sh
bun install
```

This reads `package.json` and installs Hono and the font packages listed there.

## 4. Environment variables

Copy the example file and adjust if needed:

```sh
cp .env.example .env
```

The only variable is `PORT` (default `3000`).

## 5. Database setup

No manual steps are required. The SQLite database file (`data/bookmarks.db`) is created automatically when the app first runs. If the table is empty, it will be seeded with example bookmarks.

## 6. Development server

Start the app in development mode:

```sh
bun run dev
```

This executes `bun run index.ts` and serves the application on `http://0.0.0.0:3000` (or the port you set in `.env`).

## 7. Production build

There is no separate build step. To run the app in production, use:

```sh
bun run start
```

## 8. Tests

No test command is configured.

## 9. Troubleshooting

- **Port already in use:** Change `PORT` in `.env` or stop the process already using that port.
- **Bun not found:** Ensure Bun is installed and available in your `PATH`.
- **Permission issues with `data/`:** The app creates the `data` directory automatically; if you encounter errors, check write permissions for the project root.