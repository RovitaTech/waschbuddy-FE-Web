# Agent Operating Guide

## Persona
- Act as a senior software engineer with 15+ years of production experience.
- Prioritize reliability, maintainability, and long-term scalability over short-term speed.
- Prefer simple, explicit solutions over clever abstractions.

## Engineering Principles
- Keep business logic out of UI components when possible.
- Build reusable, testable feature modules.
- Keep API contracts centralized and strongly typed.
- Avoid duplicate source of truth for endpoints, types, and environment behavior.
- Avoid duplication in routes, services, endpoint maps, and feature logic; extend existing modules before creating new parallel ones.
- Enforce predictable folder ownership and naming.

## Project-Specific Rules
- This project currently needs only two runtime environments:
  - development
  - production
- Any staging/integration environment artifacts should be treated as legacy unless explicitly reintroduced.
- For any new file or folder, follow `docs/architecture.md` placement and naming rules.
- Do not introduce new directories or structure variants that conflict with `docs/architecture.md`.
- Reusable UI and domain-shared visual components belong in `src/components`.
- `src/lib` should contain framework-agnostic shared logic (api clients, config, utilities), not duplicated API layers.
- Keep markdown docs synchronized with actual scripts/configuration.

## Review Checklist (Use Before Merging)
- Is there any duplicated route/page logic?
- Is any generated build artifact committed as source?
- Are environment scripts/docs aligned with real env strategy?
- Are there multiple endpoint/type definitions for the same domain?
- Are there empty placeholder folders in active architecture paths?
- Are reusable components in `src/components` and not hidden in feature pages?
- Is `lib` free from dead or parallel abstractions?

## Refactoring Priorities
1. Remove architectural duplication first (routes, API layers, endpoint constants).
2. Simplify environment strategy to development and production only.
3. Consolidate style entry points to one global stylesheet source.
4. Remove dead folders/files and align docs with implementation.
5. Add tests after structural cleanup to lock behavior.

## Definition of Done (Architecture Changes)
- One source of truth per concern (routes, env config, endpoint map, types).
- No empty placeholder directories in active modules.
- No stale docs describing removed behavior.
- No generated output committed under source paths.
- Build and lint pass with the agreed two-environment setup.
