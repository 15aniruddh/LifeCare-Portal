# 🏥 LifeCare Portal — Frontend

**A React single-page app for finding and booking hospital beds, blood, oxygen
and specialists.**

![LifeCare Portal Screenshot](https://portfolio-15aniruddh.vercel.app/static/media/LifeCare-Portal.5a1ffc4aaae21f99e86d.png)

Born from the challenges of the COVID-19 pandemic, LifeCare Portal puts
real-time hospital availability in one place. Visitors can browse without an
account; booking a bed requires signing in.

**Just want to run it?** Jump to [Running the frontend](#running-the-frontend--step-by-step).

---

## Stack

| Concern | Choice |
| ------- | ------ |
| Framework | React 19 |
| Build tool | **Vite 7** (`@vitejs/plugin-react`) |
| Tests | **Vitest 3** + Testing Library, jsdom environment — 25 tests |
| Routing | React Router 7 |
| Styling | Bootstrap 5 over a custom design system in `src/index.css` |
| HTTP | axios, with auth interceptors in `src/services/httpAuth.js` |
| Dialogs | SweetAlert2 |
| Images | WebP throughout `src/assets/images/` |
| Fonts | Plus Jakarta Sans (Google Fonts) |
| Package manager | Yarn (a `yarn.lock` is committed) |

> **Migrated off Create React App.** This app used to build with
> `react-scripts` 5. See [Why Vite](#why-vite-and-what-changed) for what that
> changed and why.

---

## Running the frontend — step by step

### Prerequisites

* **Node.js 18 or newer** — check with `node -v` (developed on 24.9.0)
* **Yarn**, via Corepack (bundled with Node 16.10+ — nothing to install)
* **The backend running on port 9091.** The frontend has no mock data; every
  screen reads from the API. Start it first:
  `../../LifeCare-BackEnd/python/README.md`

### 1. Open a terminal in this folder

```bash
cd LifeCare-Portal/LifeCare-FrontEnd/vite
```

> Note the `vite` subfolder — the app lives one level below `LifeCare-FrontEnd`.

### 2. Install dependencies

```bash
corepack yarn install
```

Takes roughly 20 seconds and creates `node_modules/`. One peer-dependency
warning from Bootstrap is expected and harmless.

<details>
<summary>Prefer plain <code>yarn</code> or <code>npm</code>?</summary>

Run `corepack enable` once and `yarn` works on its own afterwards. `npm install`
also works, but it ignores `yarn.lock` and resolves its own dependency tree —
stick to Yarn to get the versions this app was built against, and because
`yarn.lock` is what Dependabot scans.
</details>

### 3. Start the dev server

```bash
corepack yarn start
```

Vite is ready in well under a second and serves
**<http://localhost:3000>**. Hot Module Replacement is on — saving a file
updates the browser without a full reload. Stop it with `Ctrl+C`.

> Vite does not open a browser tab by itself, unlike CRA. Click the printed URL.

### 4. Check it works

You should land on the LifeCare home page. Then:

1. Click **Beds** in the navbar — you should see three hospitals.
   If the list is empty, the backend is not running or has no seed data
   (`make seed-dev` in the backend folder).
2. Click a hospital to see its bed counts.
3. Click **Login** and sign in with a demo account below.

### Demo accounts

All seeded accounts use the password **`Password@123`**:

| Role | Email | Lands on |
| ---- | ----- | -------- |
| User | `asha.rao@lifecare-portal.com` | `/userdashboard` |
| Hospital | `apollo@lifecare-portal.com` | `/hospitaldashboard` |
| Admin | `admin@lifecare-portal.com` | `/admindashboard` |

Or register your own via **Sign Up** — passwords need at least 8 characters
including a lowercase letter, a number and a special character.

---

## Available scripts

| Command | What it does |
| ------- | ------------ |
| `corepack yarn start` | Dev server with HMR on :3000 |
| `corepack yarn build` | Production bundle into `build/` |
| `corepack yarn preview` | Serve the built bundle locally, to check it before deploying |
| `corepack yarn test` | Vitest, single run — 25 tests across 3 files |

Add `--watch` to the test command (`corepack yarn test --watch`) to re-run on
save.

---

## Pointing at a different backend

The API base URL lives in **one** place, `src/services/apiConfig.js`, which
reads it from the environment:

```js
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:9091"
).replace(/\/+$/, "");
```

Set it in `.env` (this folder; gitignored — `.env.example` is the committed
template):

```bash
VITE_API_BASE_URL=https://api.example.com
```

Two things to know:

* **Only variables prefixed `VITE_` are exposed** to the app. A variable
  without that prefix is silently invisible to the browser bundle.
* The value is **baked in at build time**, not read at runtime. Restart the dev
  server after editing `.env`, and rebuild after changing it for production.

Whatever host you use must allow this origin — set `CORS_ORIGINS` in the
backend's `.env` (it defaults to `http://localhost:3000`).

---

## Project structure

```
vite/
├── index.html                  # entry HTML — at the project ROOT, not in public/
├── vite.config.js              # plugins, dev server port, build output, test config
├── public/                     # copied verbatim to the build root
│   ├── favicon.ico
│   ├── manifest.json
│   └── robots.txt
└── src/
    ├── index.js                # entry point: router, app shell, auth interceptors
    ├── index.css               # design tokens, typography, buttons, forms, tables
    ├── App.css                 # navbar, hero, cards, footer, dashboards
    ├── App.js                  # every route
    ├── setupTests.js           # loads jest-dom matchers for Vitest
    ├── assets/images/          # WebP images
    ├── services/               # axios API clients + httpAuth interceptors
    │   ├── apiConfig.js        # single source of truth for the API base URL
    │   └── httpAuth.js         # session store + bearer/401 interceptors
    └── components/
        ├── common/             # shared UI
        │   ├── Header.js       # responsive navbar, role-aware
        │   ├── Footer.js
        │   ├── Home.js  About.js  Contact.js
        │   ├── HospitalDirectory.js   # list hospitals → drill into one
        │   ├── HospitalStatsPage.js   # a hospital's own published numbers
        │   ├── DashboardShell.js      # banner + action grid + auth guard
        │   ├── DataTable.js           # table in a card, with empty states
        │   ├── Icons.js               # inline SVG icon set
        │   ├── labels.js              # shared display labels for API codes
        │   └── contactDetails.js      # single source of truth for address/email
        ├── auth/               # Login, Usersignup, GoogleCallback (+ tests)
        ├── admin/              # hospital + user management
        ├── hospital/           # publish availability, action requests
        └── user/               # browse availability, book, track requests
```

### How authentication works

1. `POST /login/userlogin` returns `{id, name, role, access_token}`.
2. `Login.js` stores the whole response in `sessionStorage` under its role key
   (`user`, `hospital` or `admin`).
3. `httpAuth.js` installs two axios interceptors from `index.js`: one attaches
   `Authorization: Bearer <token>` to every request, the other clears the
   session and redirects to `/login` on any `401`.
4. `sessionStorage` is per-tab and clears when the tab closes. Tokens expire
   after 8 hours, after which you are bounced to the login page.

**Public vs protected:** browsing beds, blood, oxygen, doctors and ambulance
contacts needs no account. Booking a bed, the dashboards, and every admin or
hospital screen do.

---

## Why Vite, and what changed

The app was built with Create React App (`react-scripts` 5.0.1) until it
accumulated **144 open Dependabot alerts**. Almost none of them were fixable:
`react-scripts` 5.0.1 is the last release CRA ever shipped, and 342 of the 346
advisory paths came from its build-time dependency tree. `npm audit fix --force`
"resolved" it by proposing `react-scripts@0.0.0`.

Replacing the build tool removed the whole tree at once. The audit now reports
**0 vulnerabilities**.

| | Before (CRA) | After (Vite) |
| --- | --- | --- |
| Dependabot alerts | 144 | **0** |
| Packages in `node_modules` | ~900 | **140** |
| Dev server start | ~10 s | **~0.1 s** |
| Production build | ~15 s | **~0.6 s** |

What that changed in this repo, if you are reading old branches or docs:

* `public/index.html` moved to **`index.html` at the project root**, and gained
  an explicit `<script type="module" src="/src/index.js">`. `%PUBLIC_URL%` is
  gone — reference `public/` files with a plain absolute path (`/manifest.json`).
* **`process.env.REACT_APP_*` → `import.meta.env.VITE_*`.** If you set the API
  URL anywhere outside this folder (CI, a deploy config), rename it there too or
  the app silently falls back to `localhost:9091`.
* **Jest → Vitest.** `jest.fn` is `vi.fn`, `jest.requireActual` is
  `vi.importActual`, and a mock factory that needs a spy declares it with
  `vi.hoisted(...)` because `vi.mock` calls are hoisted above the file body.
  Vitest has no automock, so `vi.mock("…/LoginApi")` spells out the stub.
* The build still writes to **`build/`** (Vite's default is `dist/`), set in
  `vite.config.js` to match what CRA produced. The deploy workflow syncs that
  directory.
* JSX lives in `.js` files, which Vite does not assume. `vite.config.js` tells
  esbuild to parse them as JSX rather than renaming 47 files to `.jsx`.
* CRA's built-in ESLint is gone with it. There is no linter wired up today; add
  `eslint` + `eslint-plugin-react-hooks` if you want that back.

### Images are WebP

Every image under `src/assets/images/` is WebP, imported by ES import:

```js
import logo from "../../assets/images/logo.webp";
```

This cut the image payload from **2.5 MB to 560 KB (−78%)** — encoded at q82
(photos) and q85 with full-quality alpha (images with transparency), measuring
44–57 dB PSNR, i.e. visually lossless. WebP is supported by every browser this
app targets. `public/favicon.ico` stays `.ico` by design.

---

## Troubleshooting

| Symptom | Cause and fix |
| ------- | ------------- |
| `Port 3000 is in use` | Another dev server is up. Vite picks the next free port, or `lsof -ti:3000 \| xargs kill` |
| Hospital lists are empty | Backend is down or unseeded → start it, then `make seed-dev` |
| Everything bounces to `/login` | Token expired (8 h) or the backend restarted — just sign in again |
| `Network Error` in the console | Backend not running on 9091, or `CORS_ORIGINS` does not include `http://localhost:3000` |
| API calls go to `localhost:9091` in production | `VITE_API_BASE_URL` was not set **at build time**, or was still named `REACT_APP_…` |
| `command not found: yarn` | Use `corepack yarn …`, or run `corepack enable` once |
| Styles look unstyled | A failed install — delete `node_modules` and re-run `corepack yarn install` |
| Stale or impossible errors after editing | `rm -rf node_modules/.vite` and restart |

---

## Building for production

```bash
corepack yarn build
```

Writes an optimised, hashed bundle to `build/` (~132 kB JS + ~35 kB CSS
gzipped). Check it locally before shipping:

```bash
corepack yarn preview
```

Because this is a single-page app, whatever serves `build/` must rewrite unknown
paths to `index.html` — otherwise refreshing on `/userdashboard` returns a 404.
CloudFront does this for the real deployment; see below.

---

## Deploying to AWS (S3 + CloudFront)

`template.yaml` in this folder describes the hosting setup: a CloudFront
distribution reading the `frontend/` prefix of the shared project bucket
(`lifecare-portal-artifacts-635738234790`) over Origin Access Control. The
bucket stays private — nothing is served except through the CDN.

The stack does **not** create the bucket; it only attaches a policy and points
CloudFront at it. That policy grants read on `frontend/*` and nothing else, and
the origin's `OriginPath` is `/frontend`, so the backend's Lambda zips in
`backend/` cannot be reached through the distribution. Note that a bucket has
exactly one policy document, so this stack owns it outright — a rule added by
hand in the console is replaced on the next deploy.

CloudFront's always-free tier covers 1 TB/month of transfer and 10M requests,
and the built bundle is a few MB of S3 storage, so this costs effectively
nothing. No WAF, no access logs, no Route 53 hosted zone — each of those bills
monthly and none is needed.

SPA routing is handled the free way: CloudFront rewrites 403 and 404 to
`/index.html` with a 200, so refreshing on `/userdashboard` works.

### It deploys itself

`.github/workflows/frontend.yml` (at the **repository root**) runs on every push
to `master` that touches `LifeCare-FrontEnd/vite/**`. Backend-only and
documentation-only pushes do not trigger it.

Each run: `yarn test` → create/update the stack → `yarn build` → sync to
`s3://lifecare-portal-artifacts-635738234790/frontend/` → invalidate the CDN.
The sync's `--delete` is scoped to that prefix, so the backend's artifacts in the
same bucket are never touched.

The upload is two passes on purpose. Hashed assets get
`max-age=31536000,immutable`; `index.html` gets `no-cache`. Cache it and
browsers keep asking for the previous release's asset filenames.

Setup is the [shared one-time OIDC role](../../LifeCare-BackEnd/python/README.md#continuous-deployment-from-github)
plus these repository variables:

| Kind | Name | Value |
|---|---|---|
| Variable | `FRONTEND_STACK_NAME` | `lifecare-web` |
| Variable | `ARTIFACT_BUCKET` | `lifecare-portal-artifacts-635738234790` (shared with the backend) |
| Variable | `VITE_API_BASE_URL` | the backend's Lambda Function URL, no trailing slash |

`AWS_REGION` must be `ap-south-1`: the origin hostname is built from the stack's
region, so the stack has to sit where the bucket does.

`VITE_API_BASE_URL` is read at **build time** — Vite inlines it into the bundle.
Changing it needs a rebuild, which is why it is a workflow variable rather than
anything runtime.

### First deploy: the two URLs reference each other

The backend needs the site's origin for CORS; the frontend needs the backend's
URL. Neither exists yet, so go round once:

1. Deploy the backend with `APP_ENV=dev` (which relaxes the CORS check). Note
   its Function URL.
2. Set `VITE_API_BASE_URL` to that, and run this workflow. Creating the
   CloudFront distribution takes ~10 minutes the first time. Note the
   `https://xxxx.cloudfront.net` it prints.
3. Set the backend's `CORS_ORIGINS` and `FRONTEND_BASE_URL` to that address and
   `APP_ENV` to `production`, then re-run the backend workflow.

From then on both pipelines are independent.

### Deleting it

The bucket is shared and not owned by this stack, so deleting the stack leaves
the files in place. Remove them separately if you want to:

```bash
aws cloudformation delete-stack --stack-name lifecare-web
aws s3 rm s3://lifecare-portal-artifacts-635738234790/frontend --recursive
```

Disabling and removing a CloudFront distribution takes AWS several minutes; the
stack sits in `DELETE_IN_PROGRESS` until it finishes. Deleting the stack also
drops the bucket policy, which is what was granting CloudFront its read access —
harmless once the distribution is gone.
