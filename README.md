# 🏥 LifeCare Portal - Healthcare Management Simplified

**Bridging the gap between patients and hospitals during critical times**  

![Healthcare Website Image](https://portfolio-15aniruddh.vercel.app/static/media/LifeCare-Portal.5a1ffc4aaae21f99e86d.png)

## 🌟 Inspiration
Born from the challenges of the COVID-19 pandemic, LifeCare Portal revolutionizes how people access vital hospital resources. We eliminate the frantic search for medical facilities during emergencies, putting crucial information at your fingertips.

## 🚀 Key Features
- **Real-time bed availability** tracking
- **Oxygen supply** status updates
- **Nearby hospital** locator with directions
- **Centralized database** of medical facilities
- **User-friendly interface** for stress-free access

## 🗂️ Repository layout

```
LifeCare-Portal/
├── LifeCare-FrontEnd/
│   └── vite/            # React 19 + Vite 7 single-page app  → :3000
├── LifeCare-BackEnd/
│   ├── python/          # FastAPI + PostgreSQL API (current) → :9091
│   └── java/            # the original Spring Boot service, kept for reference
└── LifeCare-Documentation/
```

The Python backend is a port of the Java one; the two are not run together.
**Each app has its own README with full setup instructions** — this page is only
the map.

| Component | Stack | Docs |
| --------- | ----- | ---- |
| Frontend | React 19, Vite 7, React Router 7, Bootstrap 5, Vitest | [`LifeCare-FrontEnd/vite/README.md`](LifeCare-FrontEnd/vite/README.md) |
| Backend | FastAPI, SQLAlchemy 2 (async), PostgreSQL, Alembic, pytest | [`LifeCare-BackEnd/python/README.md`](LifeCare-BackEnd/python/README.md) |

## 🛠️ Getting Started

### Prerequisites
- **Node.js 18+** (developed on 24.9.0) with Corepack for Yarn
- **Python 3.11+** for the backend
- **A PostgreSQL database** — a hosted one (Neon) or local via Docker
- Modern web browser

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/15aniruddh/LifeCare-Portal.git
cd LifeCare-Portal
```

**2. Start the backend** — full detail in the
[backend README](LifeCare-BackEnd/python/README.md)

```bash
cd LifeCare-BackEnd/python
make install                 # creates .venv and installs everything
cp .env.example .env         # then set DATABASE_URL and SECRET_KEY
make migrate                 # create the tables
make seed-dev                # demo hospitals, users and requests
make run                     # http://localhost:9091  (docs at /docs)
```

**3. Start the frontend** in a second terminal — full detail in the
[frontend README](LifeCare-FrontEnd/vite/README.md)

```bash
cd LifeCare-FrontEnd/vite
corepack yarn install
corepack yarn start          # http://localhost:3000
```

The frontend has no mock data, so the backend must be running first.

### Demo accounts

Every seeded account uses the password **`Password@123`**:

| Role | Email |
| ---- | ----- |
| User | `asha.rao@lifecare-portal.com` |
| Hospital | `apollo@lifecare-portal.com` |
| Admin | `admin@lifecare-portal.com` |

## ✅ Tests

```bash
cd LifeCare-BackEnd/python && make test      # 59 tests, in-memory SQLite
cd LifeCare-FrontEnd/vite  && corepack yarn test   # 25 tests, Vitest
```
