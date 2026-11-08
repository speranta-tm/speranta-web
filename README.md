# speranta-web

Website of **Biserica Adventistă de Ziua a Șaptea Speranța – Timișoara**, replacing the
WordPress site at sperantatm.adventist.ro.

- **Stack:** React 19 · Vite · TypeScript · Tailwind CSS v4 · React Router · Bun
- **API:** [`speranta-api`](https://github.com/maze-33/speranta-api)
- **Design:** [Figma](https://www.figma.com/design/NolJGaQ4AKE8Eqwc3ZXTaS). Every visual change is designed there first.
- **Hosting:** not decided yet.

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
