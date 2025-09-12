# Repository Guidelines

## Project Structure & Module Organization

- Source: `src/` (Next.js App Router under `src/app/`), shared UI in `src/components/`, domain/libs in `src/lib/`, helpers in `src/helpers/`, i18n in `src/i18n/`.
- Public assets: `public/` (images, manifest, icons). Translations: `translations/*.json`.
- Tests: unit in `src/**/?(*.)+(spec|test).(ts|tsx)`; E2E in `tests/e2e/`.
- Scripts: `scripts/` (Storyblok, perf, webhooks). Config: root `*.config.*`, `next.config.js`, `tailwind.config.js`.

## Build, Test, and Development Commands

- `yarn dev`: Start Next.js locally on HTTPS port 3200.
- `yarn build`: Generate bloom filters then build app.
- `yarn start`: Run the production build.
- `yarn lint` / `yarn lint:fix`: Lint (and autofix) `src/` with zero warnings allowed.
- `yarn test` / `yarn test:watch`: Run unit tests (Jest + jsdom).
- `yarn test:e2e` / `yarn test:e2e:headed`: Run Puppeteer E2E tests.
- `yarn storyblok` / `yarn pull-storyblok`: Generate Storyblok types from content.

## Coding Style & Naming Conventions

- Language: TypeScript (strict). Formatting: Prettier (+ Tailwind plugin) with 2‑space indent.
- Linting: ESLint (Next.js, TypeScript, import sort, unused‑imports). CI hooks via Husky.
- Imports: Prefer aliases (`@/*`, `@lib/*`, `@components/*`). Use type‑only imports when applicable.
- i18n: Do not import `next/link` or `next/navigation` directly; use `@/i18n/routing`.
- Files: React components `PascalCase.tsx`; helpers `camelCase.ts`; tests `*.test.ts(x)`.

## Testing Guidelines

- Framework: Jest with `jest-dom` setup. Unit tests colocate near code or under `src/`.
- E2E: `tests/e2e` (Jest + Puppeteer). Default headless; use `:headed` to debug.
- Coverage: V8 provider; no strict thresholds enforced.
- Example: `yarn test src/lib/utils/localization.test.ts`.

## Commit & Pull Request Guidelines

- Messages: Use clear prefixes (e.g., `fix:`, `feat:`, `chore:`, `docs:`, `refactor:`). Keep subject imperative and ≤72 chars.
- Hooks: Pre‑commit runs lint‑staged and secret checks; pre‑push runs `yarn lint`.
- PRs: Describe intent and scope, link issues, add screenshots for UI changes, note env or migration impacts, and ensure `lint`, `test`, and E2E (when relevant) pass.

## Security & Configuration Tips

- Env: Copy `.env.example` to `.env.local`. Never commit secrets (hooks run `scripts/check-secrets.sh`).
- CSP/HTTPS: Local dev uses HTTPS; review `next.csp.js` when adding external scripts.
- Performance: Use `yarn analyze` or `yarn performance:baseline` for bundle/perf checks.
