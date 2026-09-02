# LifeCare Portal — Python Backend

A production-oriented migration of the original Spring Boot service
(`../java`) to **FastAPI + PostgreSQL**.

Every route, path and JSON field name matches the Spring API. The React
frontend in `../../LifeCare-FrontEnd/vite` talks to it and already sends the JWT
that `POST /login/userlogin` returns — see
[How the frontend authenticates](#how-the-frontend-authenticates).

**Just want to run it?** Jump to
[Running the backend — step by step](#running-the-backend--step-by-step).

---

## Stack

| Concern        | Java (`../java`)                | Python (`./`)                       |
| -------------- | ------------------------------- | ----------------------------------- |
| Framework      | Spring Boot 2.6 MVC             | FastAPI (ASGI)                      |
| Server         | Embedded Tomcat                 | Uvicorn                             |
| ORM            | Spring Data JPA / Hibernate     | SQLAlchemy 2.0 (async, `asyncpg`)   |
| Database       | MySQL 8                         | PostgreSQL 16+ (Neon in this setup) |
| Schema         | `ddl-auto=update`               | Alembic migrations                  |
| Validation     | none                            | Pydantic v2                         |
| Passwords      | BCrypt (cost 10)                | bcrypt (cost 10) — hashes are compatible |
| Auth           | none (`csrf().disable()`)       | JWT bearer tokens + role checks     |
| Mail           | `JavaMailSender`                | `aiosmtplib`, sent in the background |
| API docs       | none                            | OpenAPI at `/docs`                  |

## Layout

The Spring layering is preserved, except that its repository interfaces are
folded into the services - SQLAlchemy's session is already the repository.

```
python/
├── app/
│   ├── main.py                 # LifeCarePortalApplication
│   ├── core/
│   │   ├── config.py           # application.properties
│   │   ├── security.py         # BCryptPasswordEncoder + JWT
│   │   ├── errors.py           # domain exceptions -> JSON responses
│   │   ├── middleware.py       # request ids, access logs, security headers, CORS
│   │   ├── logging.py          # structured logging
│   │   └── rate_limit.py       # login throttle
│   ├── db/                     # engine, session, declarative base
│   ├── models/                 # @Entity classes
│   ├── schemas/                # DTOs + request/response contracts
│   ├── services/               # *ServiceImpl classes
│   └── api/
│       ├── deps.py             # DI wiring + authorisation rules
│       └── routers/            # @RestController classes
├── alembic/versions/           # schema migrations
├── scripts/
│   ├── seed_admin.py
│   └── seed_dev_data.py        # the demo dataset (make seed-dev)
├── tests/
├── .env.example                # copy to .env
├── docker-compose.yml          # local Postgres (+ optional API)
├── Dockerfile
└── Makefile                    # every command below — `make help`
```

---

## Running the backend — step by step

Prerequisites: **Python 3.11+** (developed on 3.13) and a PostgreSQL database.
The project currently points at a hosted **Neon** database, so Docker is
optional — see [Option B](#option-b--local-postgres-in-docker) if you would
rather run Postgres locally.

### Option A — hosted Postgres (Neon), the current setup

**1. Open a terminal in this folder**

```bash
cd LifeCare-Portal/LifeCare-BackEnd/python
```

**2. Create the virtualenv and install dependencies**

```bash
make install
```

This creates `.venv/` and installs the app plus the dev and migration extras.
It is safe to re-run. (Manual equivalent: `python3 -m venv .venv && .venv/bin/pip install -e '.[dev,migrate]'`.)

**3. Create your `.env`**

```bash
cp .env.example .env
```

Then set two values in it:

```ini
# Your Neon connection string, straight from the Neon dashboard.
DATABASE_URL=postgresql://user:password@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require

# Generate with: python3 -c "import secrets; print(secrets.token_urlsafe(48))"
SECRET_KEY=<paste the generated value>
```

`DATABASE_URL` overrides the `POSTGRES_*` settings entirely. You can paste a
Neon URL verbatim — `sslmode` and `channel_binding` are translated to what the
async driver expects (see [Connection URLs](#connection-urls)).

**4. Create the database schema**

```bash
make migrate
```

Runs `alembic upgrade head`. Safe to re-run — it only applies what is missing.

**5. Load demo data** *(optional, but needed for the frontend to show anything)*

```bash
make seed-dev
```

Adds 1 admin, 3 hospitals, 6 doctors, 5 users and 7 requests. Add
`args="--reset"` to replace existing rows. For a real deployment use
`make seed-admin email=admin@yourdomain.com name="Site Admin"` instead.

**6. Start the API**

```bash
make run
```

The API is now on **<http://localhost:9091>**, with interactive docs at
**<http://localhost:9091/docs>**. `make run` enables autoreload, so edits restart
it automatically. Stop it with `Ctrl+C`.

**7. Check it works**

```bash
curl http://localhost:9091/health          # {"status":"ok",...}
curl http://localhost:9091/hospital/all    # the 3 seeded hospitals
```

The startup log should include `Database connection verified`.

Now start the frontend — see `../../LifeCare-FrontEnd/vite/README.md`.

### Option B — local Postgres in Docker

Prefer this if you want to work offline. Requires Docker Desktop running.

```bash
make install
cp .env.example .env          # set SECRET_KEY; leave DATABASE_URL commented out
make db-up                    # postgres:16-alpine on localhost:5432
make migrate
make seed-dev
make run
```

With `DATABASE_URL` unset, the app falls back to the `POSTGRES_*` values, which
default to the `docker-compose.yml` credentials (`lifecare` / `lifecare` /
`lifecare`).

Useful targets: `make db-shell` opens `psql` in the container, `make db-down`
stops it, `make db-reset` destroys the volume and rebuilds from scratch.
`make help` lists everything.

### Option C — everything in Docker

```bash
cp .env.example .env          # set SECRET_KEY
docker compose up --build
```

Brings up Postgres *and* the API together, applying migrations on boot.

### Switching between hosted and local

The `DATABASE_URL` line is the only switch:

| Goal | What to do |
| ---- | ---------- |
| Use Neon | Set `DATABASE_URL` in `.env` |
| Use local Docker | Comment out `DATABASE_URL`, run `make db-up` |

Run `make migrate` after switching — each database needs its own schema.

### Common problems

| Symptom | Cause and fix |
| ------- | ------------- |
| `connection refused` on startup | Local Postgres is not running → `make db-up`, or you meant to set `DATABASE_URL` |
| `password authentication failed` | Wrong credentials in `.env` |
| `sslmode is an invalid keyword argument` | An old `DATABASE_URL` reaching the driver untranslated — pull the latest `app/core/config.py` |
| Startup hangs ~60 s, then `TimeoutError`, on a hosted database | Your network blackholes IPv6 and the driver tries the provider's AAAA records first. See [IPv6 and hosted Postgres](#ipv6-and-hosted-postgres) |
| `Address already in use` on 9091 | Something else holds the port → `lsof -ti:9091 \| xargs kill` |
| Tables missing / `relation does not exist` | `make migrate` was not run against *this* database |
| Frontend shows no data | Run `make seed-dev`, and confirm the API answers on 9091 |

### Dummy test data

`scripts/seed_dev_data.py` (`make seed-dev`) inserts a coherent dataset:

| Table | Rows | Notes |
| ----- | ---- | ----- |
| `admins` | 1 | `admin@lifecare-portal.com` |
| `hospitals` | 3 | Varied stock, including one with **zero** ventilators and **one** oxygen bed — useful for testing the "no beds left" 409 |
| `doctor_info` | 6 | 3 / 2 / 1 across the hospitals |
| `users` | 5 | |
| `requests` | 7 | A mix of `pending`, `Accepted` and `Rejected` |

Every seeded account uses the password **`Password@123`**:

| Role | Email |
| ---- | ----- |
| Admin | `admin@lifecare-portal.com` |
| Hospital | `apollo@lifecare-portal.com`, `sunrise@…`, `grace@…` |
| User | `asha.rao@lifecare-portal.com`, `ravi.kumar@…`, and three more |

The script refuses to run when `ENV` is `staging` or `production`.

### Browsing the database (SQLTools)

Install the [SQLTools](https://marketplace.visualstudio.com/items?itemName=mtxr.sqltools)
extension **and** its PostgreSQL driver (`mtxr.sqltools-driver-pg`), then add a
connection with the values from your `.env`.

For **Neon**, take them from the connection string
`postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require`:

| Setting | Value |
| ------- | ----- |
| Driver | PostgreSQL |
| Server | the `ep-…neon.tech` host |
| Port | `5432` |
| Database | `neondb` (or whatever follows the last `/`) |
| Username / Password | from the URL |
| SSL | **Enabled** — Neon requires it |

For **local Docker**, use `localhost` / `5432` / `lifecare` / `lifecare` /
`lifecare` with SSL disabled. `.vscode/settings.json` ships that one ready-made.

### The first admin

The Spring API had **no endpoint for creating admins** — rows were inserted into
the `admin` table by hand. `scripts/seed_admin.py` is the supported replacement;
it hashes the password properly and is safe to re-run (it updates in place).

---

## API

All 27 Spring endpoints are present at their original paths, plus
`GET /hospital/all`. The "Who" column is new: it is the role the JWT must carry.
"public" means no token at all — browsing availability does not require an
account, so the frontend's Beds / Blood / Oxygen / Doctors / Ambulance screens
work signed out.

| Method | Path | Who | Notes |
| ------ | ---- | --- | ----- |
| POST   | `/login/userlogin`                      | public | Rate-limited. Returns `{id, name, role, access_token, …}` |
| POST   | `/user/adduser`                         | public | Registration |
| GET    | `/user/{userId}`                        | that user, or admin | |
| PUT    | `/user/updateuser/{userId}`             | that user, or admin | Partial update |
| DELETE | `/user/deleteuser/{userId}`             | that user, or admin | |
| GET    | `/user/doctorinfo/{hosname}`            | any signed-in | |
| GET    | `/hospital/all`                         | public | **New.** Hospital directory. Returns `HospitalPublic` — no login email, no patient requests |
| POST   | `/admin/addhospital`                    | admin | |
| GET    | `/admin/allhospitals`                   | admin | |
| GET    | `/admin/allusers`                       | admin | |
| GET    | `/hospital/hospitalid/{hospid}`         | that hospital, or admin | |
| PUT    | `/hospital/updatehospital/{hospid}`     | that hospital, or admin | Partial update |
| DELETE | `/hospital/deletehospital/{hospid}`     | that hospital, or admin | |
| PUT    | `/hospital/addbed/{hospid}`             | that hospital, or admin | |
| PUT    | `/hospital/addblood/{hospid}`           | that hospital, or admin | |
| PUT    | `/hospital/addoxygen/{hospid}`          | that hospital, or admin | |
| POST   | `/hospital/adddoctorinfo/{hospid}`      | that hospital, or admin | |
| GET    | `/hospital/doctorinfo/{hospid}`         | public | A hospital's doctors |
| GET    | `/hospital/byname/{hosname}`            | public | Bed, blood and oxygen availability |
| POST   | `/request/addrequest/{userId}/{hospid}` | that user, or admin | |
| GET    | `/request/requestbyuser/{userid}`       | that user, or admin | |
| GET    | `/request/pendingrequest/{hospid}`      | that hospital, or admin | |
| GET    | `/request/requestforhosp/{hospid}`      | that hospital, or admin | |
| PUT    | `/request/acceptrequest/{status}/{reqid}` | the hospital the request targets, or admin | |
| GET    | `/request/allrequest`                   | admin | |
| GET    | `/health`, `/health/ready`              | public | New — liveness / readiness probes |

The four public `/hospital/*` reads return the `HospitalPublic` schema, which
deliberately omits the hospital's login `email` and its `requests` list. The
authenticated `/hospital/hospitalid/{hospid}` routes still return the full `HospitalRead`.

Plain-text responses (`"Successfully Added"`, `"Bed Details Added"`, and the
rest, including the original `"Blood Detials Added"` misspelling) are byte-for-byte
what Spring returned.

Interactive docs: <http://localhost:9091/docs> (disabled when `ENV=production`).

### How the frontend authenticates

This is already wired up in `../../LifeCare-FrontEnd/vite`; the notes below are
for reference.

`POST /login/userlogin` returns `{id, name, role, access_token, …}`. The React
app stores the whole response in `sessionStorage` under its role key
(`admin` / `hospital` / `user`), and
`src/services/httpAuth.js` installs two axios interceptors from
`index.js`:

* a **request** interceptor that attaches `Authorization: Bearer <token>` to
  every outgoing call, and
* a **response** interceptor that clears the session and redirects to `/login`
  on any `401`, so an expired token cannot leave a dead page on screen.

Tokens last `ACCESS_TOKEN_EXPIRE_MINUTES` (default 480 = 8 hours).

It is refused when `ENV` is `staging` or `production`.

---

## Behaviour that deliberately differs from the Java version

Everything below is a fix, not an oversight. Each was a real defect in the
original service.

**Security**

1. **Password hashes are never returned.** The Spring API serialised the bcrypt
   hash of every hospital and user in `GET /user/{id}`, `GET /hospital/{id}`,
   `/admin/allusers` and `/admin/allhospitals`. Two admin screens
   (`Updatehospital.js`, `Updateuser.js`) bound a form field to that value and
   posted it back; with the field now empty they post `""`, which is read as
   "leave the password alone" — so the screens keep working.
2. **Admin passwords are bcrypt-hashed.** `LoginServiceImpl` compared the admin
   password with `password.equals(admin.getPassword())` — plaintext. The data
   migration hashes existing admin passwords on the way across; the old
   passwords still work, but rotate them.
3. **Failed logins return 401**, with a message that does not reveal whether the
   address exists. The old code threw `RuntimeException("Invalid password!!!")`,
   which surfaced as a 500, and logged the email of every failed attempt.
4. **Every endpoint requires a token and a role.** Previously anyone who knew a
   URL could read every user record or empty a hospital's bed inventory.
5. **Login is rate-limited** per client IP (10 attempts/minute by default).
6. **Secrets come from the environment.** `application.properties` had the MySQL
   root password and a Gmail app password committed in plaintext — see
   [Rotate these credentials](#rotate-these-credentials).

**Correctness**

7. **Accepting a bed request is atomic.** The old flow read the hospital,
   decremented in Java and wrote it back; two approvals racing could hand out the
   same last bed and drive the count negative. It is now a single guarded
   `UPDATE … WHERE count > 0`, and an approval with no stock left returns 409.
8. **Partial updates no longer blank out data.** `PUT /hospital/updatehospital/{id}`
   passed the deserialised entity straight to `save()`, so any field missing from
   the request body was overwritten with `null`/`0`. Only the keys actually
   present are written now. The admin screens post the whole object, so their
   behaviour is unchanged.
9. **Unknown ids return 404.** `findById(...).get()` threw
   `NoSuchElementException` → 500; name lookups returned `null` with a 200.
10. **Duplicate emails are rejected with 409.** There was no unique constraint,
    so two accounts could share an address and login would silently pick one.
11. **An unrecognised value in `/request/acceptrequest/{status}/{reqid}` returns 422.**
    The old handler compared against `"accepted"`/`"rejected"`, did nothing at
    all for anything else, and still answered `"Request Status Updated"`.
12. **A failed welcome email no longer fails the signup.** It was sent inline, so
    an SMTP hiccup turned a successful registration into a 500. It is now sent
    after the response and only logged if it fails.
13. **Deleting a hospital or user cleans up its children.** `Request` had no
    cascade, so the delete failed on a foreign key. Both relations are now
    `ON DELETE CASCADE`.
14. **Related rows are eager-loaded in one query.** `open-in-view` lazy loading
    meant `/admin/allhospitals` issued a query per hospital per relation.
15. **Hospital-name and pending-status lookups are case-insensitive.**

**Unchanged on purpose:** URL paths, path/query parameter names, JSON field
names (`hospid`, `hospitalname`, `a_pos`, `doctorid`, `timetoarrive`, …), the
plain-text response strings, the `{id, name, role}` login shape, the
`"pending"` / `"Accepted"` / `"Rejected"` status casing, and the fact that
`RequestRead` omits its `hospital` and `user` relations (they were
`@JsonBackReference` / `@JsonIgnore` in the entity).

---

## Database

### Table mapping

Column names are unchanged. Only table names differ — `user` is a reserved word
in Postgres, and mixed singular/plural naming is worse than consistent plural.

| MySQL (Hibernate) | PostgreSQL   |
| ----------------- | ------------ |
| `admin`           | `admins`     |
| `user`            | `users`      |
| `hospital`        | `hospitals`  |
| `doctorinfo`      | `doctor_info`|
| `request`         | `requests`   |

### Connection URLs

The app and Alembic both run on **asyncpg**, which does not understand the libpq
parameters that managed providers put in their connection strings. `DATABASE_URL`
is therefore translated per driver in `app/core/config.py`:

| In `DATABASE_URL` | asyncpg (app, Alembic) | psycopg (`sync_url`, scripts) |
| ----------------- | ---------------------- | ----------------------------- |
| `sslmode=require` | `ssl=require` | kept as-is |
| `channel_binding=require` | dropped | kept as-is |
| `postgresql://` | `postgresql+asyncpg://` | `postgresql+psycopg://` |

Dropping `channel_binding` does **not** weaken the connection — `ssl=require`
still enforces TLS. Practically, this means you can paste a Neon, Supabase or
RDS URL verbatim and it will work.

### IPv6 and hosted Postgres

Neon (and most managed providers) publish both AAAA and A records. On a network
with no working IPv6 route to them, asyncpg tries the IPv6 addresses first and
each connection attempt burns a full timeout — the API starts but every query
stalls, and `alembic` hangs.

Confirm it before working around it:

```bash
nc -4 -z -G 6 <your-host> 5432   # succeeds
nc -6 -z -G 6 <your-host> 5432   # times out  → this is the problem
```

The workaround, applied entirely in `.env` with no code change, is to connect
to an IPv4 address directly and move the endpoint id into the password — the
fallback Neon documents for clients that cannot do TLS SNI, which is what you
lose by dialling an IP instead of a hostname:

```ini
# was: postgresql://USER:PASS@ep-xxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require&channel_binding=require
DATABASE_URL=postgresql://USER:endpoint%3Dep-xxx%3BPASS@<ipv4>:5432/neondb?sslmode=require
```

`%3D` is `=` and `%3B` is `;`, URL-encoded so the URL parser keeps them inside
the password. `sslmode=require` encrypts without verifying the hostname, so the
IP does not break TLS.

**This pins an IP that the provider can rotate.** The committed `.env` carries
the original hostname URL on a commented line directly above — restore it once
IPv6 works, or when the pinned address stops answering.

### Migrations

```bash
make migrate                          # alembic upgrade head
make revision m="add triage column"   # autogenerate after changing a model
.venv/bin/alembic downgrade -1
```

### Moving data between two Postgres databases

To copy a local database up to a hosted one (or the reverse), dump the rows and
replay them against the target after its schema exists:

```bash
# 1. Schema on the target
make migrate                                   # with DATABASE_URL pointing at it

# 2. Rows out of the source
docker compose exec -T db pg_dump -U lifecare -d lifecare \
  --data-only --column-inserts > data.sql

# 3. Replay, parents before children, then bump the identity sequences
```

Insert parent tables first (`admins`, `hospitals`, `users`, then `doctor_info`,
`requests`) so the foreign keys resolve, and afterwards run `setval` on each
serial column — `pg_dump --column-inserts` writes explicit ids, which leaves the
sequences behind and makes the next insert collide. Note the primary key on
`admins` is `id`, while the other tables use `hospid` / `userid` / `doctorid` /
`reqid`.


## Configuration

Every setting is an environment variable — see `.env.example` for the annotated
list. The ones that matter most:

| Variable | Default | Notes |
| -------- | ------- | ----- |
| `SECRET_KEY`      | — | **Required.** Signs the JWTs. Must be ≥32 chars in staging/production. |
| `ENV`             | `local` | `staging`/`production` enable the safety checks below. |
| `CORS_ORIGINS`    | `*` | Must be an explicit list in production. |
| `DATABASE_URL`    | — | Full connection string; overrides every `POSTGRES_*` value. Paste a Neon/Supabase/RDS URL as-is. |
| `MAIL_ENABLED`    | `false` | Welcome emails are off until configured. |
| `PORT`            | `9091` | The port the React app calls. |

On startup in `staging`/`production` the app refuses to boot with a default
`SECRET_KEY`, `DEBUG=true`, or a wildcard CORS origin.

---

## Development

```bash
make test        # pytest — 59 tests
make lint        # ruff
make format      # ruff --fix + format
make typecheck   # mypy
make clean       # drop __pycache__, .pytest_cache, .mypy_cache, .ruff_cache, *.egg-info
```

Tests run against in-memory SQLite, so no database is needed. The Alembic
migration is verified against PostgreSQL separately — run `make migrate` against
a real instance before deploying.

---

## Production notes

* `Dockerfile` is a two-stage build running as a non-root user (uid 10001) with a
  `HEALTHCHECK` against `/health`.
* Point your load balancer's liveness probe at `/health` and its readiness probe
  at `/health/ready` (which returns 503 when Postgres is unreachable).
* Every response carries an `X-Request-ID`; send your own to correlate with an
  upstream trace. Logs are JSON by default (`LOG_JSON=false` for local reading).
* The login rate limiter is per-process. Behind more than one replica, move
  `app/core/rate_limit.py` onto Redis — the interface is one `allow()` call.
* JWTs are stateless, so there is no server-side logout. If you need revocation,
  add a `jti` denylist; the claim is already issued.

### Rotate these credentials

`../java/src/main/resources/application.properties` contains, in plaintext and
in version control:

* the MySQL `root` password, and
* a Gmail address with its app password.

Both should be treated as compromised. Rotate them, and scrub them from the git
history, independently of this migration.
