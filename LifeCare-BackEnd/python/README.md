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
├── docker-compose.yml          # local Postgres, for offline development
├── template.yaml               # AWS SAM stack: one Lambda + a Function URL
├── github-oidc.yaml            # one-time: the IAM role GitHub Actions assumes
└── Makefile                    # every command below — `make help`
```

---

## Running the backend — step by step

Prerequisites: **Python 3.11+** (developed on 3.13) and a PostgreSQL database.
The project currently points at a hosted **Neon** database in
**ap-southeast-1 (Singapore)** — deliberately the region nearest the Lambda in
ap-south-1, because every query crosses that gap. Docker is
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

## Deploying to AWS Lambda

The whole API — every route, unchanged — runs on a single Lambda function.
`app/lambda_handler.py` wraps the same `app.main:app` in Mangum, which turns the
Lambda event into an ASGI request; `template.yaml` deploys that as a zip package
behind a Lambda Function URL.

**This stack costs nothing while nobody is using it**, and stays inside the free
tier for normal use. See [Keeping the bill at zero](#keeping-the-bill-at-zero)
below for exactly why, and for the two things that would break that.

Needs the [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html),
Docker (only as a build sandbox for the Linux/arm64 wheels — nothing is built
from a Dockerfile and nothing is pushed to a registry), and credentials in your
shell (`aws configure`).

```bash
# 1. Database: keep using Neon (or Supabase). Both have a free tier that scales
#    to zero. Do NOT use RDS for this — see the cost notes below.

# 2. Apply migrations from your machine, pointed at that database.
DATABASE_URL='postgresql://user:pass@host/lifecare?sslmode=require' make migrate

# 3. Build and deploy. The first deploy prompts for the parameters below and
#    remembers them in samconfig.toml.
make sam-build
make sam-deploy
```

Both go to the shared project bucket under the `backend/` prefix. SAM requires
that bucket to be in the **same region as the stack**, so deploy into
`ap-south-1` — the region the bucket lives in.

`sam deploy --guided` asks for:

| Parameter | Value |
|---|---|
| `DatabaseUrl` | the same connection string you migrated with |
| `SecretKey` | `python3 -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `CorsOrigins` | your frontend origin, e.g. `https://lifecare.example.com` — `*` is refused when `Env` is `staging`/`production` |
| `FrontendBaseUrl` | where the Google callback hands the browser back |
| `MaxConcurrency` | leave at `5` — the spend ceiling, see below |

It prints `ApiUrl` at the end. Put that in the frontend's
`LifeCare-FrontEnd/vite/.env` as the API base URL, and redeploy the frontend.

Anything else in `.env.example` is a plain environment variable — add it under
`Environment.Variables` in `template.yaml` (Google OAuth and SMTP settings, for
instance).

Redeploy after a code change with `make sam-build && sam deploy`.

### Continuous deployment from GitHub

`.github/workflows/backend.yml` (at the **repository root**, not in this folder —
GitHub only reads `.github/workflows/`) tests and deploys this service on every
push to `master`.

**The monorepo is handled by two settings in that file:**

* `paths:` — the workflow only runs when something under
  `LifeCare-BackEnd/python/**` changed. Editing the frontend, the docs, or the
  old Java backend triggers nothing, so you never pay for a pointless deploy or
  wait on an irrelevant build.
* `defaults.run.working-directory` — every step runs as if launched from this
  folder, so `pytest` and `sam build` need no path juggling.

The pipeline is: **test → migrate → deploy → curl `/health`**. Migrations run
before the deploy, so if a migration fails the old function keeps serving. If
the tests fail nothing reaches AWS at all.

#### The shared bucket

Both pipelines write to one bucket, `lifecare-portal-artifacts-635738234790`,
split by prefix:

```
lifecare-portal-artifacts-635738234790/
├── backend/     # Lambda deployment zips, uploaded by sam deploy
└── frontend/    # the built Vite site, served by CloudFront
```

They stay out of each other's way by construction. CloudFront's `OriginPath` is
`/frontend`, so the CDN physically cannot serve a deployment artifact, and the
frontend's `s3 sync --delete` is confined to its own prefix. The deploy role's
S3 permissions are scoped per prefix as well, so neither pipeline can write into
the other's folder even by accident.

Because SAM needs its artifact bucket in the stack's own region, **every stack
here deploys to `ap-south-1`**.

#### One-time setup

**1. Create the deploy role.** `github-oidc.yaml` gives GitHub Actions a role it
can assume via OpenID Connect — GitHub never stores an AWS access key, and the
credentials each run gets expire in an hour. Deploy it once from your machine:

```bash
aws cloudformation deploy \
  --template-file github-oidc.yaml \
  --stack-name lifecare-api-cicd \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides GitHubRepo=15aniruddh/LifeCare-Portal DeployBranch=master \
                        ArtifactBucket=lifecare-portal-artifacts-635738234790

aws cloudformation describe-stacks --stack-name lifecare-api-cicd \
  --query 'Stacks[0].Outputs[0].OutputValue' --output text
```

The role can only be assumed from this repository, on this branch. A pull
request — including one from a fork — cannot reach AWS.

> If it fails with `EntityAlreadyExists`, this account is already connected to
> GitHub Actions. Redeploy with `CreateOidcProvider=no` added to
> `--parameter-overrides`. It creates only IAM resources, which are free.

**2. Add the repository secrets and variables** under
*Settings → Secrets and variables → Actions*:

| Kind | Name | Value |
|---|---|---|
| Secret | `DATABASE_URL` | your Neon connection string |
| Secret | `APP_SECRET_KEY` | `python3 -c "import secrets; print(secrets.token_urlsafe(48))"` |
| Variable | `AWS_DEPLOY_ROLE_ARN` | the ARN printed above |
| Variable | `AWS_REGION` | `ap-south-1` — must match the artifact bucket's region |
| Variable | `ARTIFACT_BUCKET` | `lifecare-portal-artifacts-635738234790` |
| Variable | `STACK_NAME` | `lifecare-api` |
| Variable | `APP_ENV` | `production` (use `dev` until the frontend has a real URL) |
| Variable | `CORS_ORIGINS` | your frontend origin |
| Variable | `ALERT_EMAIL` | where abuse alarms go — also arms the auto-throttle |
| Variable | `FRONTEND_BASE_URL` | your frontend origin |

Secrets are write-only and masked in logs; variables are visible, which is why
only the two real credentials are secrets.

`STACK_NAME` must stay `lifecare-api` unless you also redeploy `github-oidc.yaml`
with a matching `StackName` — the role's permissions are scoped to that prefix,
so a rename locks CI out until both agree. The same is true of `ARTIFACT_BUCKET`
and the two prefixes.

**3. Push to `master`.** Watch it under the Actions tab. The final step prints
the API URL into the run summary.

After this, `sam deploy` from your laptop is only for emergencies — CI is the
path. Local `samconfig.toml` and CI are independent, and both are gitignored.

#### If CI fails on a permission

The role in `github-oidc.yaml` is deliberately scoped to this one stack rather
than given blanket access. If a deploy fails with `is not authorized to perform:
<action>`, add that exact action to the matching statement and redeploy the
`lifecare-api-cicd` stack. That is the intended way to widen it — resist
replacing the policy with a wildcard.

### Keeping the bill at zero

Lambda bills per request and per GB-second of execution, and **nothing at all
while idle** — that is the whole reason to prefer it to EC2 here. The free tier
covers 1M requests and 400,000 GB-seconds a month; at 512 MB that is about 200
hours of execution, which a portfolio-scale app will not come close to.

Everything in `template.yaml` was chosen to avoid a charge, and the reasoning is
in comments next to each line:

| Choice | What it avoids |
|---|---|
| Zip package, not a container image | ECR bills per GB-month and keeps every image you ever pushed. A zip sits in SAM's S3 bucket for cents a year |
| Lambda Function URL, not API Gateway | API Gateway adds ~$1 per million requests on top of Lambda's own, plus its own minimums |
| `ReservedConcurrentExecutions` (`MaxConcurrency`) | The URL is public. This caps how fast anyone — an attacker, or a retry loop in the frontend — can spend money. Currently **0 (unset)**: a new account's whole Lambda limit is 10 and AWS refuses any reservation that leaves fewer than 10 unreserved, so the account limit is the cap instead. Set it to 5 after a quota increase |
| `RetentionInDays: 7` on the log group | Lambda's default is *never expire*: every access log line you ever emit is stored, and billed, forever |
| `Architectures: [arm64]` | 20% cheaper per GB-second than x86, same code |
| `MemorySize: 512` | You are billed memory × duration. These requests wait on Postgres, not on CPU, so more memory would cost more without finishing sooner |
| No provisioned concurrency | Provisioned concurrency bills 24/7 whether or not a request arrives. Cold starts here are ~1–2s, which is the right trade for a free stack |
| No VPC config | See below — this is the expensive one |

**The two things that would actually cost you money:**

1. **Putting the function in a VPC to reach RDS.** RDS itself is billed per hour
   whether or not anyone calls the API — it is EC2 with a database on it, which
   is what you are moving away from. Worse, a Lambda in a private subnet needs a
   **NAT gateway** to reach anything on the internet (Google OAuth, SMTP), and a
   NAT gateway is roughly **$32/month before any traffic**, running idle, and is
   the single most common surprise on an AWS bill. Neon and Supabase are reached
   over the public internet, so the function needs no VPC and no NAT gateway at
   all. `template.yaml` deliberately has no `VpcConfig`. Leave it that way.

2. **Leaving the API public and un-capped.** `AuthType: NONE` is required for a
   browser to call the API, so the URL is world-reachable by design; the JWT is
   what protects the data, not the network. `MaxConcurrency` is what protects the
   wallet. Do not raise it without a reason.

### Keep the database near the Lambda

Every request makes roughly three round trips to Postgres — the pool pre-ping,
the query, and the commit — so the distance between the function and the
database sets the floor on response time. Measured on this deployment:

| Neon region | `/health/ready` | `/hospital/all` |
|---|---|---|
| us-east-2 (Ohio) | 1.42s | 1.80s |
| ap-southeast-1 (Singapore) | see below | see below |

Neon has no Mumbai region, so Singapore is the closest available. If that ever
changes, moving is cheap: create the project in the new region, point
`DATABASE_URL` at it, and let CI run `alembic upgrade head`. Copy existing rows
parents-first (`hospitals`, `users`, `admins`, `doctor_info`, `requests`) and
reset each identity sequence past the highest id, or the next insert collides on
the primary key.

### If someone points a script at it

The Function URL and the CDN are both public by design — the JWT protects the
data, not the wallet. Since AWS has no hard spend cap, the defence is layered:
make abuse cheap, notice it fast, and stop it without waiting for a human.

**1. The account's concurrency limit of 10 is a feature, not a bug.**
Lambda cannot run more than 10 of anything at once in this account, which caps
the burn rate no matter how hard the URL is hit. Do **not** request a quota
increase to "fix" `MaxConcurrency` — raising the limit to 1000 without also
setting a reservation makes the ceiling a hundred times worse. If you ever do
need the increase for real traffic, set `MaxConcurrency=5` in the *same* change.

**2. An alarm fires within 5 minutes.** `InvocationSpikeAlarm` watches Lambda
invocations and trips above `InvocationAlarmThreshold` (3,000 per 5 minutes).
Real usage here is a few hundred a day, and the concurrency cap puts the
physical ceiling near 15,000 per 5 minutes, so the threshold sits far above
anything legitimate and far below anything expensive.

**3. The API throttles itself.** The alarm publishes to an SNS topic with two
subscribers: your email, and a small `Throttler` Lambda that sets the API's
reserved concurrency to **0**. That stops every new invocation instantly. It
needs no human and no quota increase — reserving *zero* is allowed even on an
account whose entire limit is 10, unlike reserving a positive number.

The throttler's IAM role can call exactly one API, `lambda:PutFunctionConcurrency`,
on exactly one function. It cannot read data or invoke anything.

Enable it by setting the `ALERT_EMAIL` repository variable, then **click the
confirmation link SNS sends you** — an unconfirmed subscription means no email,
though the auto-throttle still fires.

```bash
gh variable set ALERT_EMAIL --body you@example.com
```

`GuardrailStatus` in the stack outputs reports `armed` or `OFF`.

**Recovering after a throttle.** The API returns errors until you clear it:

```bash
aws lambda delete-function-concurrency \
  --function-name $(aws cloudformation describe-stack-resource \
      --stack-name lifecare-api --logical-resource-id ApiFunction \
      --region ap-south-1 --query 'StackResourceDetail.PhysicalResourceId' --output text) \
  --region ap-south-1
```

**The manual switches**, if you want to pull them yourself:

```bash
# Stop the API instantly (same thing the throttler does)
aws lambda put-function-concurrency --function-name <fn> \
  --reserved-concurrent-executions 0 --region ap-south-1

# Take the site offline — disabling is reversible, deleting is not
aws cloudfront get-distribution-config --id <id> > d.json   # then set Enabled:false
aws cloudfront update-distribution --id <id> --if-match <etag> --distribution-config file://...
```

**What is deliberately *not* here:** AWS WAF. It is the usual answer to this
question and it would bill **$5/month base plus $0.60 per million requests**,
every month, forever — to guard against an attack that has not happened. The
alarm-plus-throttle above costs nothing at rest and is enough for a personal
project. Revisit WAF only if this ever carries real traffic.

**The CDN side.** CloudFront's free tier is 1 TB/month out and 10M requests;
the built site is about 200 kB, so exhausting that takes roughly five million
page loads. It is the far less likely money sink, and your account budget alarm
catches it. A CloudWatch alarm on CloudFront metrics is possible but must live
in **us-east-1** — CloudFront publishes its metrics only there — which is why
it is not in this stack.

### The honest ceiling

AWS has **no hard spend cap** — the budget alarm you set up in the console
alerts you, it does not stop anything.
So the real question is not "can this bill me" but "how much, at worst, before I
notice". With the account's concurrency limit of 10 and `Timeout: 15`, a public URL
pegged flat out for a solid month tops out around **$170–220**. That is the ceiling on sustained,
deliberate abuse, not an expectation: idle costs nothing, and normal portfolio
traffic stays inside the free tier.

The ceiling scales linearly with `MaxConcurrency` — set it to `2` and it is
roughly $35, set it to `1` and it is under $20. Five is the default because a
dashboard page firing three or four requests at once would otherwise start
getting 429s.

If something does go wrong, the kill switch is one command — it stops every
invocation immediately while leaving the stack in place:

```bash
aws lambda put-function-concurrency \
  --function-name <the function name from the stack> \
  --reserved-concurrent-executions 0
```

Set it back to 5 to resume, or `sam delete` to remove everything.

Two more worth knowing:

* The AWS free tier is not identical for every account — accounts opened after
  mid-2025 get a credit-based free plan instead of the older perpetual
  allowances. Check **Billing → Free tier** in the console once after the first
  deploy to see which one you are on.
* This account's Lambda concurrency quota is **10**, not the usual 1000, so
  `MaxConcurrency` is 0 (the property is omitted). Ask for an increase under
  *Service Quotas → Lambda → Concurrent executions*; once it is granted, set
  `MaxConcurrency=5` to get the tighter per-function cap back.
* Deployment zips accumulate under `backend/` in the shared bucket — 18 MB per
  deploy, so a few cents a month after a hundred deploys. Prune it occasionally,
  or put an S3 lifecycle rule on that prefix. Nothing outside `backend/` is
  touched by the backend pipeline.

To tear the whole thing down and be certain nothing is left running:

```bash
sam delete            # removes the function, its URL, IAM role and log group
```

### What changes on Lambda

* **Connection pool.** `app/db/session.py` drops to a pool of one per container
  when `AWS_LAMBDA_FUNCTION_NAME` is set. A container serves one request at a
  time, and a larger pool multiplies into the database's connection limit as
  concurrency climbs.
* **No lifespan per request.** Mangum would run FastAPI's startup *and shutdown*
  on every invocation, disposing the pool each time. `lifespan="off"` turns that
  off; logging setup and config validation happen at module import instead —
  which is the cold-start boundary anyway.
* **Migrations are not run by the app.** Run `make migrate` yourself against the
  target database, as in step 2 above.
* **The login rate limiter is per-container**, so it throttles far more loosely
  than it does on a single server. `MaxConcurrency` bounds how loose.
* **Secrets are plain Lambda environment variables.** Fine to start; Secrets
  Manager is $0.40 per secret per month, so only move them there when the account
  has more than one person in it.
* **Background tasks run inside the billed request.** Mangum waits for the whole
  ASGI call to finish, so the registration email in `app/api/routers/user.py`
  still sends — it just adds to that invocation's duration instead of happening
  after the response. `MAIL_TIMEOUT_SECONDS` (10s) keeps it under the function's
  15s timeout. Mail is off unless you add `MAIL_ENABLED` to `template.yaml`.
* **Cold starts.** First request after ~10 idle minutes takes a second or two
  while the container boots and connects to Postgres. Warming it on a schedule
  would fix that and would also mean paying for invocations around the clock, so
  it is deliberately not done.

---

## Production notes

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
