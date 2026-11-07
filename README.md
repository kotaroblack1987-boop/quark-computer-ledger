# Quark Computer Ledger — Demo PWA

A responsive, installable static PWA prototype for a fictional internal company-ledger interface.

## Important data notice
The displayed available balance of **RM 415,055.98** and all seeded transactions are demonstration data only. They are not connected to a bank, accounting platform, or verified company records. Entries added in the app are stored in the current browser's local storage.

## Features
- Responsive desktop and mobile ledger dashboard
- Installable PWA manifest and service worker
- Offline app-shell caching
- Sample credits and debits
- Add local demo entries
- Search and filter transactions
- Export transactions to CSV

## Deploy on Render
Create a Render **Static Site** connected to this repository:
- Build command: leave empty
- Publish directory: `. ` (repository root; enter `.`)

The site is plain HTML, CSS, and JavaScript; no build step is required.

## Local preview
Serve this directory with any static HTTP server. Service workers and PWA installation require HTTPS or localhost.
