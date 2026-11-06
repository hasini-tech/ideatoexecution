# Idea to Execution

A mobile-first PWA that turns ideas into finished work: capture → prioritise → execute → get reminded → complete.

**Stack:** Next.js 14 (App Router) · React · Tailwind CSS · Next.js API routes · MongoDB Atlas + Mongoose · JWT auth (httpOnly cookie) · Service Worker + Web Push (VAPID)

## 1. Run locally

```bash
npm install
cp .env.example .env.local     # then fill in the values below
npm run vapid                  # prints a public/private VAPID key pair
npm run dev                    # http://localhost:3000
```

Open it on your phone's width (or Chrome DevTools → device toolbar). Create an account, then add your first idea.

### Environment variables (`.env.local`)

| Variable | What it is |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string (allow your IP in Atlas → Network Access). If the URI omits a database name, the app uses `idea-to-execution`. |
| `JWT_SECRET` | Long random string, e.g. `openssl rand -base64 48` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | From `npm run vapid` |
| `VAPID_SUBJECT` | `mailto:you@example.com` |
| `CRON_SECRET` | Secret for the scheduled reminder endpoint |
| `ENABLE_INTERNAL_CRON` | `true` to run the scheduler inside the Node server (self-hosting only) |

## 2. Deploy (Vercel + Atlas is the easiest)

1. Push to GitHub, import the repo in Vercel, add all the env vars above.
2. Deploy. Push notifications and installation require **HTTPS** (Vercel provides it).
3. On your Android phone open the site in Chrome → ⋮ → **Install app** (or use Profile → Install app).
4. Profile → Reminders → **Enable on this device** → **Send test**.

## 3. Scheduled reminders (works when the app is closed)

Reminders are created by `GET /api/cron/reminders` (requires `Authorization: Bearer <CRON_SECRET>`). It creates the notification history entry **and** sends Web Push to every subscribed device. Duplicates are prevented by a unique `dedupeKey` per user.

Pick one scheduler:

- **GitHub Actions (free, included):** `.github/workflows/reminders.yml` pings the endpoint every 15 minutes. Add repo secrets `APP_URL` and `CRON_SECRET`.
- **cron-job.org / any pinger:** call the URL every 5–15 min with the Bearer header.
- **Self-hosted Node (VPS, Railway, Render…):** set `ENABLE_INTERNAL_CRON=true`; `instrumentation.js` runs the job every 5 minutes.
- Vercel Cron works too (add a `vercel.json` cron), but the Hobby plan only allows once per day.

Reminder rules (per user timezone and reminder time, default 09:00):
- **Due today** → "Your task is due today! Time to execute your idea."
- **Overdue** → "Your task is overdue. Complete it as soon as possible." (once per day until done)
- **Upcoming** → heads-up 1–3 days before (configurable)

While the app is open it also checks every minute and shows an in-app popup (each reminder shows once).

## 4. How it works

```
app/
  page.js           Public landing page
  (app)/            Dashboard · Ideas (+new, [id], [id]/edit) · Execution (+[id]) · Calendar · Profile · Insights · Notifications
  api/              auth · ideas · tasks · notifications · push · stats · goals · cron
components/         BottomNav, Fab, IdeaCard, TaskCard, IdeaForm, ReminderWatcher, PushSettings, GoalsCard, ui kit
lib/                db, auth, reminders engine, push, dates, validators, client hooks
models/             User, Idea, ExecutionTask, Notification, PushSubscription, DailyGoal
public/             manifest.json, sw.js, offline.html, icons/
```

- **Privacy:** every query filters by the signed-in user's id; passwords are bcrypt-hashed; the session is an httpOnly, SameSite=Lax JWT cookie.
- **Dates** are stored as `YYYY-MM-DD` strings so due dates never shift with timezones.
- **Move to Execution** creates an `ExecutionTask` linked to the idea; completing the task marks the idea Completed, which can then be archived.
- The app supports a private guest session when sign-in and registration are unavailable. Guest data is scoped to the browser's session cookie.
- **Offline:** the service worker caches the app shell and static assets and shows `/offline.html` when there is no network. API data is never cached.
- The service worker is registered only in production builds. To test push locally: `npm run build && npm start`.

## 5. Customising

- Brand colour: `tailwind.config.js` → `colors.brand`.
- Motivational quotes: `lib/constants.js`.
- Icons: `public/icons/` (192, 512, maskable 512, badge).
