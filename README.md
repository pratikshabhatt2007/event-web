# GDG RBU Events — React frontend

Website for the Event Management & Registration API (see the `event-api` project).
Built with React + Vite. No UI library, just plain CSS (light and dark mode, responsive).

## Pages
- **Home** — event cards with search, category filter, "spots available" filter, sorting, pagination
- **Login / Sign up**
- **Event page** — details, live seat meter, Register / Cancel
- **My events** — upcoming and past registrations, QR-code ticket, cancel
- **Admin** (admin account only) — create / edit / delete events, attendee list (CSV download), analytics

## Run locally
The backend must be running first (`npm start` inside `event-api`, on port 5000).

```bash
npm install
cp .env.example .env     # Windows PowerShell: copy .env.example .env
npm run dev
```
Open http://localhost:5173

The backend's `CORS_ORIGIN` must include `http://localhost:5173` (or be `*`).

## Environment
| Variable | Example | Meaning |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | Backend URL, **must end with `/api`** |

## Deploy to Vercel
1. Push this folder to its own GitHub repo.
2. On vercel.com: **Add New → Project**, import the repo (framework: Vite is auto-detected).
3. Add environment variable `VITE_API_URL` = `https://YOUR-BACKEND-URL/api`.
4. Deploy. Then set the backend's `CORS_ORIGIN` to your Vercel URL.

`vercel.json` already makes page refreshes on routes like `/admin` work.
