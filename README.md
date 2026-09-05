# @stadii/web

This repository holds the STADII public website — a read-only discovery surface.

## It is generated

The source of truth is the STADII monorepo, where this app lives at
`apps/web_nextjs` alongside the backend it calls. This repository is produced by

```bash
node scripts/publish-app.mjs web --out <dir>
```

and regenerated on every publish. **Do not edit it directly** — an edit
made here is overwritten by the next publish and is invisible to the
backend contracts, the shared packages and the test suites that guard
them.

The `packages/` directory is a copy of the workspace packages this app
depends on (design_tokens, shared_constants, shared_models), vendored so the repository installs
and builds on its own.

## Running it

```bash
pnpm install
pnpm build
```

Configuration is read from `NEXT_PUBLIC_*` environment variables; see
`.env.example`. This app holds no server-side credential.
