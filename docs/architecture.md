# Architecture Review and Target Structure

## Current Snapshot
- Framework: Next.js App Router + TypeScript
- UI: Tailwind + shadcn components
- Data source: Mock-data driven front-end
- Deployment assets: npm scripts + environment-specific config

## Key Findings (Current State)

### 1) Route Duplication
- `src/app/page.tsx` and `src/app/admin/page.tsx` contain near-identical app flow.
- Risk: behavior drift, double maintenance cost.

### 2) API Layer Duplication
- Two parallel API approaches exist:
  - mock API functions (`src/lib/api/auth.ts`, `users.ts`, `machines.ts`, `reservations.ts`)
  - service client layer (`src/lib/api/services.ts` + `endpoints.ts` + `types.ts`)
- Risk: unclear source of truth and dead code accumulation.

### 3) Endpoint Definition Duplication
- Endpoints are defined in both:
  - `src/lib/api/endpoints.ts`
  - `src/constants/index.ts` (`API_ENDPOINTS`)
- Risk: inconsistent endpoint changes.

### 4) Environment Strategy Mismatch
- Repo contains development, staging, integration, production env files and scripts.
- You currently require only development + production.
- Docs/scripts previously assumed 4 environments.

### 5) Stylesheet Source Confusion
- `src/app/globals.css` appears to contain generated Tailwind output.
- `src/styles/globals.css` contains authored design tokens/theme styles.
- Risk: duplicated style ownership and bloated source control.

### 6) Empty/Placeholder Structure in Active Paths
- Empty folders in API path:
  - `src/lib/api/endpoints/`
  - `src/lib/api/services/`
  - `src/lib/api/types/`
- Empty component bucket:
  - `src/components/common/`
- Risk: misleading architecture and onboarding confusion.

### 7) Mock-Data Coupling in UI
- Feature components import mock data directly in many places.
- Risk: backend integration becomes invasive later.

## Environment Simplification Recommendation (Dev + Prod Only)

### Keep
- `.env.development`
- `.env.production`

### Remove or Archive
- `.env.staging`
- `.env.integration`
- scripts and npm commands tied to staging/integration

### Align
- `ENVIRONMENT_SETUP.md`
- `README.md`
- `scripts/deploy.sh`
- `package.json` scripts
- `src/lib/config/environment.ts` types/helpers

## Proposed Folder Structure (Best Fit for This Project)

```text
src/
  app/
    (admin)/
      page.tsx
      layout.tsx
    layout.tsx
    globals.css

  components/
    ui/
    common/
    layout/
    features/
      admin/
      auth/
      machines/
      reservations/
      users/

  features/
    machines/
      model/
      services/
      hooks/
      mappers/
    users/
      model/
      services/
      hooks/
    reservations/
      model/
      services/
      hooks/

  lib/
    api/
      client.ts
      endpoints.ts
      types.ts
    config/
      environment.ts
    utils/
      date.ts
      format.ts

  mocks/
    data/
      machines.ts
      users.ts
      reservations.ts
    factory/
      generators.ts

  hooks/
  constants/
  types/
  styles/
```

## Placement Rules
- Shared, reusable visual components: `src/components`.
- Feature/domain logic and models: `src/features`.
- Global technical primitives (api/config/helpers): `src/lib`.
- Mock datasets and generators: `src/mocks`.
- Avoid importing mock data directly in UI components; consume through feature services/hooks.

## Cleanup Backlog (No-Code Planning)
1. Decide canonical admin route (keep either root page or `/admin`, not both).
2. Choose one API architecture (mock facade or service client) and remove the other.
3. Keep one endpoint map and one API type source.
4. Collapse environment model to development + production.
5. Keep only one authored global style entry point.
6. Remove empty placeholder directories from active paths.
7. Update all markdown docs to reflect real architecture.

## Risk Assessment
- High: route/API/env duplication causing drift.
- Medium: style source ambiguity and mock-data coupling.
- Low: empty directories and naming consistency.

## Review Conclusion
The project has a solid UI base and clear domain intent, but architecture currently carries duplicate paths and environment complexity that will slow backend integration and increase maintenance cost. The next best move is structural consolidation before adding more features.
