.DEFAULT_GOAL := help
VENV := .venv
PY   := $(VENV)/bin/python
PIP  := $(VENV)/bin/pip

.PHONY: help venv install run test lint format typecheck migrate revision seed-admin seed-dev db-up db-down db-shell db-reset sam-build sam-deploy build-ApiFunction clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

venv: ## Create the virtualenv
	python3 -m venv $(VENV)

install: venv ## Install the app plus dev and migration extras
	$(PIP) install --upgrade pip
	$(PIP) install -e '.[dev,migrate]'

run: ## Run the API with autoreload on :9091
	$(VENV)/bin/uvicorn app.main:app --reload --port 9091

test: ## Run the test suite
	$(PY) -m pytest -q

lint: ## Lint with ruff
	$(VENV)/bin/ruff check app tests scripts

format: ## Auto-fix and format with ruff
	$(VENV)/bin/ruff check --fix app tests scripts
	$(VENV)/bin/ruff format app tests scripts

typecheck: ## Type-check with mypy
	$(VENV)/bin/mypy app

migrate: ## Apply database migrations
	$(VENV)/bin/alembic upgrade head

revision: ## Autogenerate a migration: make revision m="add column"
	$(VENV)/bin/alembic revision --autogenerate -m "$(m)"

seed-admin: ## Create an admin: make seed-admin email=a@b.com name="Admin"
	$(PY) scripts/seed_admin.py --email "$(email)" --name "$(name)"

seed-dev: ## Insert dummy test data (add args="--reset" to replace existing rows)
	$(PY) scripts/seed_dev_data.py $(args)

db-up: ## Start only the Postgres container (postgres:16-alpine)
	docker compose up -d db

db-down: ## Stop the Postgres container (data survives in the pgdata volume)
	docker compose stop db

db-shell: ## Open psql inside the Postgres container
	docker compose exec db psql -U $${POSTGRES_USER:-lifecare} -d $${POSTGRES_DB:-lifecare}

db-reset: ## Destroy the database volume, recreate it, migrate and re-seed
	docker compose down -v
	docker compose up -d db
	until docker compose exec -T db pg_isready -U $${POSTGRES_USER:-lifecare} >/dev/null 2>&1; do sleep 1; done
	$(VENV)/bin/alembic upgrade head
	$(PY) scripts/seed_dev_data.py

sam-build: ## Build the Lambda deployment package
	sam build --use-container

# Same bucket and prefix CI uses, so a manual deploy cannot strand artifacts
# somewhere the deploy role has no permission to clean up.
ARTIFACT_BUCKET ?= lifecare-portal-635738234790-ap-south-2-an

sam-deploy: ## Deploy to AWS Lambda (first run: prompts for the parameters)
	sam deploy --guided --s3-bucket $(ARTIFACT_BUCKET) --s3-prefix backend

# Called by `sam build` inside the Lambda build image, not by hand. The target
# name must stay in sync with the ApiFunction logical id in template.yaml.
# Plain `pip`, not $(PIP): there is no .venv inside the build container.
build-ApiFunction:
	pip install . -t "$(ARTIFACTS_DIR)"

clean: ## Remove caches and build artefacts
	find . -type d -name __pycache__ -prune -exec rm -rf {} +
	rm -rf .pytest_cache .mypy_cache .ruff_cache .aws-sam dist build *.egg-info
