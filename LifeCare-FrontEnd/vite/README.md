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
| Framework | React 19 (Create React App / `react-scripts` 5) |
| Routing | React Router 7 |
| Styling | Bootstrap 5 + React-Bootstrap, over a custom design system in `src/index.css` |
| HTTP | axios, with auth interceptors in `src/components/service/httpAuth.js` |
| Dialogs | SweetAlert2 |
| Fonts | Plus Jakarta Sans (Google Fonts) |
| Package manager | Yarn (a `yarn.lock` is committed) |

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
cd LifeCare-Portal/LifeCare-FrontEnd/react
```

> Note the `react` subfolder — the app lives one level below `LifeCare-FrontEnd`.

### 2. Install dependencies

```bash
corepack yarn install
```

Takes roughly 30 seconds and creates `node_modules/`. Peer-dependency warnings
are expected and harmless.

<details>
<summary>Prefer plain <code>yarn</code> or <code>npm</code>?</summary>

Run `corepack enable` once and `yarn` works on its own afterwards. `npm install`
also works, but it ignores `yarn.lock` and resolves its own dependency tree —
stick to Yarn to get the versions this app was built against.
</details>

### 3. Start the dev server

```bash
corepack yarn start
```

It compiles, prints `Compiled successfully!`, and opens
**<http://localhost:3000>**. Hot reload is on — saving a file refreshes the
browser. Stop it with `Ctrl+C`.

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
| `corepack yarn start` | Dev server with hot reload on :3000 |
| `corepack yarn build` | Production bundle into `build/` |
| `corepack yarn test` | Jest in watch mode (no test suite ships today) |
| `corepack yarn eject` | **One-way.** Copies the CRA build config into the repo. Avoid unless you have to. |

---

## Pointing at a different backend

The API base URL is currently hard-coded in each service file under
`src/components/service/`:

```js
const HOSPITAL_API_BASE_URL = "http://localhost:9091/hospital";
```

To target a deployed backend, change those constants — or, better, replace them
with an environment variable. CRA exposes any variable prefixed `REACT_APP_`:

```bash
# .env.local  (gitignored; restart the dev server after changing it)
REACT_APP_API_URL=https://api.example.com
```

```js
const API = process.env.REACT_APP_API_URL || "http://localhost:9091";
```

Whatever host you use must allow this origin — set `CORS_ORIGINS` in the
backend's `.env` (it defaults to `http://localhost:3000`).

---

## Project structure

```
react/
├── public/
│   └── index.html              # loads Google Fonts, sets the page title
└── src/
    ├── index.js                # entry point: router, app shell, auth interceptors
    ├── index.css               # design tokens, typography, buttons, forms, tables
    ├── App.css                 # navbar, hero, cards, footer, dashboards
    ├── App.js                  # every route
    └── components/
        ├── common/             # shared UI
        │   ├── Header.js       # responsive navbar, role-aware
        │   ├── Footer.js
        │   ├── Home.js  About.js  Contact.js
        │   ├── HospitalDirectory.js   # list hospitals → drill into one
        │   ├── DashboardShell.js      # banner + action grid + auth guard
        │   ├── DataTable.js           # table in a card, with empty states
        │   ├── Icons.js               # inline SVG icon set
        │   └── contactDetails.js      # single source of truth for address/email
        ├── auth/               # Login, Usersignup
        ├── admin/              # hospital + user management
        ├── hospital/           # publish availability, action requests
        ├── user/               # browse availability, book, track requests
        ├── service/            # axios API clients + httpAuth interceptors
        └── images/
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

## Troubleshooting

| Symptom | Cause and fix |
| ------- | ------------- |
| `Something is already running on port 3000` | Another dev server is up. Accept the prompt to use 3001, or `lsof -ti:3000 \| xargs kill` |
| Hospital lists are empty | Backend is down or unseeded → start it, then `make seed-dev` |
| Everything bounces to `/login` | Token expired (8 h) or the backend restarted — just sign in again |
| `Network Error` in the console | Backend not running on 9091, or `CORS_ORIGINS` does not include `http://localhost:3000` |
| `command not found: yarn` | Use `corepack yarn …`, or run `corepack enable` once |
| Styles look unstyled | A failed install — delete `node_modules` and re-run `corepack yarn install` |
| Stale errors after editing | Stop the server, `rm -rf node_modules/.cache`, start it again |

> Deleting `node_modules/.cache` **while the dev server is running** crashes it
> with an `ENOENT … 0.pack` error. Stop the server first.

---

## Building for production

```bash
corepack yarn build
```

Writes an optimised, hashed bundle to `build/` (~138 kB JS + ~37 kB CSS gzipped).
Serve it with any static host:

```bash
npx serve -s build
```

Because this is a single-page app, the host must rewrite unknown paths to
`index.html` — otherwise refreshing on `/userdashboard` returns a 404.
