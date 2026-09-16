# Repository Guidelines

## Project Structure & Module Organization

This is an Express 5 and TypeScript backend. Entry points are `src/server.ts` and `src/app.ts`. Feature code belongs in `src/modules/<feature>/`; each module may contain controller, service, repository, and schema files, such as `src/modules/auth/auth.service.ts`. HTTP route composition remains in `src/routes/`, while shared middleware, configuration, types, and utilities live in their `src/` directories.

Prisma sources are under `prisma/`: edit `schema.prisma`, add generated migrations to `prisma/migrations/`, and maintain seed data in `seed.ts`. Do not hand-edit `src/generated/prisma/`. Manual API requests are stored in `http/`. Place tests beside the code they cover as `*.test.ts`.

## Build, Test, and Development Commands

- `npm run dev`: start the API with `tsx` in watch mode.
- `npm run type-check`: validate TypeScript without emitting files.
- `npm run build`: compile source into `dist/`.
- `npm start`: run the compiled server.
- `npm test`: run Jest once; `npm run test:watch` watches tests.
- `npm run migrate`: create and apply a development Prisma migration.
- `npm run seed`: seed the configured database.
- `npm run studio`: open Prisma Studio.

Copy `.env.example` to `.env` before local development and provide the required database and authentication values.

## Coding Style & Naming Conventions

Use two-space indentation, single quotes, semicolons, trailing commas, and an 80-column target. Run `npx prettier --check .` before submitting; use `npx prettier --write <paths>` only on files you intend to change. There is no ESLint configuration. Use camelCase for variables and functions, PascalCase for types, and lowercase feature filenames with role suffixes: `invitation.controller.ts`, `invitation.schema.ts`.

## Testing Guidelines

Jest runs in Node through `ts-jest` and matches `**/*.test.ts`. No coverage threshold is configured. Add focused tests for service rules, schema validation, authorization, and error responses. Avoid real database dependencies unless the test explicitly provisions and cleans up its data.

## Commit & Pull Request Guidelines

Commitlint enforces Conventional Commit types: `feat`, `fix`, `chore`, `refactor`, and `docs`. Follow recent history, for example `feat: 초대 API 구현`. Keep commits scoped and imperative.

Pull requests should explain the change, affected routes or migrations, verification commands, and any environment changes. Link the issue and include representative request/response evidence for API behavior. Call out schema migrations, security-sensitive cookie/token changes, and unverified runtime behavior explicitly.

## Security & Configuration

Never commit `.env`, credentials, tokens, or production data. Review cookie flags, authorization middleware, validation, and error exposure when changing authentication code. Confirm the target database before migrations or seed operations.
