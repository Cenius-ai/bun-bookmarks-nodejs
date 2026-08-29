# Usage

Once the server is running (see [INSTALL.md](INSTALL.md)), you can use the app through any web browser.

## Browsing Bookmarks

Open `http://localhost:3000` (or the configured `PORT`). The home page displays a list of all bookmarks, sorted by most recently added.

## Adding a Bookmark

Use the “Add Bookmark” form (usually accessible from the main page or at `/add`). Fill in:

- **URL** – the bookmark’s web address
- **Title** – a descriptive label
- **Tags** – comma-separated keywords (e.g., `javascript,runtime,tooling`)

Submit the form to save the bookmark and return to the list.

## Filtering by Tag

Enter a tag in the filter/search input and submit. The page will reload showing only bookmarks whose tags contain the entered keyword.

## Data Storage

All bookmarks are persisted in `data/bookmarks.db`, an SQLite database that is created automatically. Seeding happens only when the table is empty, so your additions will survive restarts.