# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All task commands use `cargo make` (from `Makefile.toml`):

```bash
cargo make run          # Start Tauri dev server (hot-reload)
cargo make build        # Production desktop app build
cargo make test         # Run all tests
cargo make check        # Run clippy on all targets
cargo make typegen      # Generate TypeScript bindings from Rust Tauri commands
cargo make migrate      # Generate a new migration file
cargo make migrate-fresh # Reset DB and re-run all migrations
cargo make generate-entity # Regenerate SeaORM entities from current schema
```

Frontend dependencies: `bun install --cwd frontend`

Run a single test: `cargo test -p <crate-name> <test_name>`

## Architecture

Desktop app (Rust + Tauri + SolidJS) for activity time-tracking. Users log daily activities with categories, durations, and timestamps.

### Workspace Crates

| Crate | Path | Role |
|---|---|---|
| `domain` | `backend/domain` | Entities, aggregates, repository traits |
| `application` | `backend/application` | Use cases, DTOs, command/query handlers |
| `infrastructure` | `backend/infrastructure` | SeaORM repositories, ORM entities, mappers |
| `migration` | `backend/migration` | SeaORM migration files |
| Tauri app | `frontend/src-tauri` | IPC commands, app state wiring, event emission |
| SolidJS UI | `frontend/src` | Reactive UI (Tailwind CSS + DaisyUI) |

### Layer Dependencies

```
Frontend (SolidJS) ←→ Tauri IPC ←→ Application Services → Domain ← Infrastructure
```

The Tauri layer (`frontend/src-tauri/src/`) acts as a DI container — it owns `AppState`, which holds all repository impls and application services as `Arc<dyn Trait>`.

### Core Domain Concepts

**ActivityState** (aggregate root) owns:
- `active: Option<Activity>` — at most one active activity per day
- `completed: Vec<Activity>` — ordered completed activities

Invariants enforced: no overlapping time ranges, only one active activity, all activities belong to the same date.

**AuditContext** — captures clock + timezone at request start, used across all domain operations for consistency and testability.

**ActivityStatePublisher** — background task that polls the repository and broadcasts `activity_state_event` every ~1s via Tauri events, driving the live timer in the UI.

### IPC Communication

Tauri commands (defined in `frontend/src-tauri/src/commands/`) map directly to application service calls. TypeScript bindings are auto-generated via `cargo make typegen`.

Key commands: `get_activity_state`, `start_activity`, `stop_activity`, `cancel_active_activity`, `save_active_activity`, `save_completed_activity`, `delete_completed_activity`, `get_all_categories`, `create_category`, `rename_category`, `delete_category`.

Key events emitted to frontend: `activity_state_event` (contains date and `active_duration_seconds`).

### Database

SQLite at `~/.config/my_life_logger.db`. Managed by SeaORM with migrations auto-applied on startup via `ConnectionPool`. Schema: `activities` (id, category_id FK→categories, description, started_at, ended_at, date) and `categories` (id, name) with cascade delete.

Infrastructure writes activities transactionally per date (delete existing for date, insert all current).

### Error Hierarchy

`DomainError` → `PersistenceError` → `ApplicationError` (wraps both). Tauri command handlers convert `ApplicationError` to serializable responses.
