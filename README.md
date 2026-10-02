# Appointment API

A simple REST API built with Express and PostgreSQL for managing appointments.

## Requirements

- Node.js 18 or later.
- PostgreSQL installed and running.

## Set up PostgreSQL

1. Create a database, for example:

   ```sql
   CREATE DATABASE appointment_api;
   ```

2. Configure the connection variables in your terminal. You can use
   [`.env.example`](./.env.example) as a starting point; the project does not
   load `.env` automatically, so export the variables or configure them in your
   runtime environment. For example, on Linux/macOS:

   ```sh
   export PGHOST=localhost
   export PGPORT=5432
   export PGDATABASE=appointment_api
   export PGUSER=postgres
   export PGPASSWORD=your_password
   ```

   You can also set `DATABASE_URL`, for example
   `postgres://postgres:your_password@localhost:5432/appointment_api`.

3. Apply the schema:

   ```sh
   psql "$DATABASE_URL" -f db/schema.sql
   ```

   If you use `PG*` variables instead of `DATABASE_URL`, run:

   ```sh
   psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -f db/schema.sql
   ```

4. Install dependencies and start the API:

   ```sh
   npm install
   npm start
   ```

## Appointments CRUD

The API is available at `http://localhost:3000/appointments`. An appointment
has this shape: `{ "name": "Consultation", "date": "2026-10-02", "hour": "09:30" }`.
`date` and `hour` can be `null` or omitted; `name` is required.

| Operation | Method and route | Result |
|---|---|---|
| List | `GET /appointments` | `results` containing all appointments |
| Get one | `GET /appointments/:id` | `result` containing one appointment |
| Create | `POST /appointments` | `201` and the created appointment |
| Update | `PUT /appointments/:id` | Replaces the appointment fields |
| Delete | `DELETE /appointments/:id` | `204` with no content |

Ejemplo:

```sh
curl -X POST http://localhost:3000/appointments \
  -H 'Content-Type: application/json' \
  -d '{"name":"Consultation","date":"2026-10-02","hour":"09:30"}'
```

Validation errors return `400`; a missing appointment returns `404`. SQL values
are passed as parameters rather than being interpolated into queries.

## Learn to plan with agents

This repository includes a custom agent at
[`.github/agents/backend-api.agent.md`](./.github/agents/backend-api.agent.md).
The agent is an instruction profile: it can explore the project, propose a
plan, and implement and verify changes when you ask it to. It is not an
autonomous process that runs tasks without supervision.

### Create and use the agent in VS Code

1. Open this repository in VS Code with GitHub Copilot enabled.
2. Create `.github/agents/` if it does not exist yet, then add
   `backend-api.agent.md` inside it. The filename becomes the agent's visible
   identifier in the agent picker.
3. Add YAML frontmatter with `name` and `description`, followed by clear
   instructions about the agent's role, project context, and working process.
   You can start by copying the agent already included in this repository.
4. Save the file. Open Copilot Chat in Agent mode and select `Backend API` from
   the picker. If it does not appear, reload the VS Code window.
5. Start by asking for a plan, not code. For example:

   > Analyze how this API is structured. Do not edit any files yet. Propose a
   > plan for adding authentication, with small tasks, dependencies, affected
   > files, risks, and tests.

6. Review and adjust the plan. Ask the agent to implement one task at a time,
   confirm before major changes, and review the diff. Finish by asking it to run
   tests and explain anything that remains.

### How to break down and plan the work

For this appointments API, a useful plan separates work into areas with
verifiable deliverables and respects their dependencies:

1. **Persistence**: define columns and constraints, and create `db/schema.sql`.
   Done when a new PostgreSQL database can apply the schema.
2. **Connection**: add `pg`, configure the pool, and document the environment
   variables. This depends on deciding how the schema and connection are
   represented.
3. **Endpoints**: implement listing, lookup by ID, creation, updating, and
   deletion, with validation and parameterized queries. This depends on the
   connection and schema.
4. **Verification and documentation**: test responses, errors, and persistence,
   then update the usage examples. This depends on the endpoints being
   implemented.

For each task, define its goal, scope, likely files, dependencies, acceptance
criteria, and how to test it. Dependencies matter: there is little value in
testing persistence before the schema and connection are ready. Keep tasks
small so you can review the agent's changes and catch errors before they spread.

A good workflow is: **explore → plan → approve → implement → test → review the
diff**. Ask the agent to call out assumptions instead of inventing requirements,
and verify that the tests cover the behavior you expect.
