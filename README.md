# speranta-web

Website of **Biserica Adventistă de Ziua a Șaptea Speranța – Timișoara**, replacing the
WordPress site at sperantatm.adventist.ro.

- **Stack:** React 19 · Vite · TypeScript · Tailwind CSS v4 · React Router · Bun
- **API:** [`speranta-api`](https://github.com/maze-33/speranta-api)
- **Design:** [Figma](https://www.figma.com/design/NolJGaQ4AKE8Eqwc3ZXTaS). Every visual change is designed there first.
- **Hosting:** Cloudflare Pages, project `speranta-web`. Merge to `main` → staging
  (https://staging.speranta-web.pages.dev, stage API); a GitHub Release `vX.Y.Z` → production
  (https://sperantatm.thorsp.net, prod API); each PR from this repo gets its own preview on the stage
  API, linked in a PR comment. Release the API first when the site needs its new endpoints.

## Running it

```bash
bun install
bun run dev        # http://localhost:5173
```

`/api/*` is proxied to a local `speranta-api` on port 5280 (see its README). Point it
elsewhere with `SPERANTA_API_PROXY=https://… bun run dev`. A deployed build sets
`VITE_API_BASE` to the API's root instead.

If the API is down, the pages still render: the schedule, the kids' groups and the
book list fall back to the values the church had when the site was built
(`src/lib/site.tsx`), and only the forms and announcements need the API.

```bash
bun run lint       # oxlint
bun run build      # tsc + vite build
```

## Where things are

```
src/index.css          design tokens and text styles, one-to-one with the Figma variables
src/content/           page texts that live in code: the six books, the church's facts
src/components/        Header, Footer, Button, Field (inputs, radios, checkboxes), icons
src/pages/             one file per page
src/lib/api.ts         the API client and the shapes it returns
scripts/               prepare-images.py, which builds src/assets/img from the old site's photos
```

The texts on the pages are in code; what the church changes week to week (schedule,
flyer, books in stock, announcements) comes from the API and is edited in the admin.

## Pages

| Path | Page |
|---|---|
| `/` | Home |
| `/activitati-pentru-copii` | Kids' activities + sign-up form |
| `/carti-gratuite` | The free books |
| `/carti-gratuite/:slug` | One book + order form (the questions differ per book) |
| `/anunturi`, `/anunturi/:slug` | Announcements |
| `/contact` | Contact + message form |
| `/multumim` | Thank-you page after a form |
| `/confidentialitate` | Privacy policy (**draft**, to be reviewed by the church) |

Old WordPress links (`/index.php/biblia/`, `/index.php/1393-2/`, `/contact/` …) redirect to
the new pages.

The forms carry a hidden `website` field as a honeypot; the API keeps nothing a bot sends
through it.

## The admin (`/admin`)

Loaded on demand (`src/admin/`, its own chunk), so visitors to the public pages never
download it. Invite-only: the first admin comes from the API's `Bootstrap:AdminEmails`.

| Path | Screen |
|---|---|
| `/admin/autentificare`, `/admin/parola-uitata`, `/admin/resetare-parola`, `/admin/invitatie` | sign-in, forgotten password, new password, accept an invitation |
| `/admin` | dashboard: counts, "De făcut", shortcuts, phone alerts |
| `/admin/comenzi[/:id]`, `/admin/inscrieri[/:id]`, `/admin/mesaje[/:id]` | the submissions, with status, internal note, history and CSV export |
| `/admin/anunturi[/:id \| /nou]` | announcements, with an editor (autosaved drafts, scheduling, cover, preview) |
| `/admin/program`, `/admin/carti`, `/admin/administratori` | schedule and flyer, books on/off and order, admins and invitations |

The `:id` paths are the ones the notification emails and phone alerts link to.

**Email that can't silently stop.** While Gmail refuses or isn't set up, every admin page
shows a banner (from `GET /admin/mail-status`) saying since when and how many notifications
are waiting; "Cum rezolv?" walks through making a new Gmail app password and pasting it in,
which restarts email and sends everything that waited. Each submission whose email hasn't
gone out is marked. **Phone alerts** (Web Push, `public/sw.js`) can be turned on from the
dashboard per phone: they announce every new submission and an email outage, without going
through Gmail. On an iPhone they need the admin added to the home screen first (the
dashboard explains), which is why the admin, and only the admin, has a web manifest.
