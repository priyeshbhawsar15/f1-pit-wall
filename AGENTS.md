# Repository Guidelines

## Project Structure & Module Organization

This repository is a Next.js 14 TypeScript dashboard for F1 telemetry. `server.ts` starts the custom Node server and coordinates Next.js, Socket.IO, and UDP ingestion. Routes and pages live in `src/app/`, reusable React components in `src/components/`, hooks in `src/hooks/`, Zustand state in `src/stores/`, and shared utilities in `src/lib/`. Server-only code is grouped under `src/server/`: packet parsers are in `parser/`, persistence logic in `db/`, and Redis/socket integration in `realtime/`. Prisma schema and migrations live in `prisma/`; static assets belong in `public/`. The `sample_telemetry_data/` folder contains the required protocol specifications for decoding telemetry data.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: run the custom development server through `ts-node`.
- `npm test`: run specification-based 2025/2026 telemetry parser tests.
- `npm run build`: create a production Next.js build and catch type/build errors.
- `npm run start`: launch the compiled production server from `dist/server.js`.
- `npm run db:generate`: regenerate the Prisma client after schema changes.
- `npm run db:push`: synchronize the schema with a local development database.
- `npm run db:migrate`: apply committed database migrations.
- `docker-compose up --build`: start the app, TimescaleDB, and Redis together.

## Coding Style & Naming Conventions

Use strict TypeScript, two-space indentation, and the `@/*` alias for imports from `src/`. Name React components and their files in PascalCase, for example `TelemetryPanel.tsx`; hooks use `useX.ts`; Next.js handlers use `route.ts`. Keep packet parsers separated by packet type. Follow existing Tailwind utility patterns and use `lucide-react` for interface icons. ESLint dependencies are present, but no lint script is currently configured.

## Testing Guidelines

Run `npm test` for parser fixtures and `npm run build` for integration validation. Parser changes must match offsets and field widths in `sample_telemetry_data/`. No coverage threshold is configured. Exercise database and realtime changes with TimescaleDB, Redis, and representative UDP data.

## Commit & Pull Request Guidelines

Recent commits use concise, descriptive, sentence-style subjects such as `added session deletion API...`. Keep each commit focused on one behavior. Pull requests should summarize the change, list validation performed, link relevant issues, and include screenshots for UI work. Explicitly call out migrations, environment-variable changes, and telemetry protocol assumptions.

## Security & Configuration

Do not commit `.env` files, credentials, or local telemetry captures containing sensitive data. Typical runtime settings include `DATABASE_URL`, `REDIS_URL`, and `UDP_PORT`. Commit Prisma migrations alongside schema changes.
