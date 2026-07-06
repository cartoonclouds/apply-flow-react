# React Native Migration Blueprint

This document describes a practical migration path for moving this codebase from a Vite web app to a React Native app without trying to mechanically port DOM-specific components.

## Summary

This repository should be migrated with a parallel-app approach:

- Keep the existing web app running.
- Create a separate React Native app with Expo.
- Extract shared domain, data contracts, and utilities into reusable packages.
- Rebuild the app shell and feature screens natively.
- Replace browser-only persistence and UI libraries with native equivalents.

This is not a direct renderer swap. The current app is web-first in its runtime, routing, layout primitives, and persistence layer.

## Current Constraints

The main web-specific surfaces are:

- `src/main.tsx`: uses `react-dom`, `document`, and CSS side-effect imports.
- `src/router.tsx`: uses the TanStack web router.
- `src/App.tsx`: uses resizable DOM panels for desktop layout.
- `src/components/ui/*`: wraps Base UI and DOM-based components.
- `src/components/ui/calendar.jsx`: depends on `react-day-picker`.
- `src/components/ui/data-table/data-table.tsx`: depends on semantic table markup and TanStack Table rendering.
- `src/db/index.js`: creates a PGlite database backed by IndexedDB.
- `src/db/factories/run-all.ts`: branches on `window` and browser persistence.
- `src/store/useAppStore.js`: uses Zustand persistence with web storage defaults.

## What Can Be Shared

These parts are good candidates for cross-platform reuse after refactoring:

- Type definitions under `src/types` and `src/modules/*/types`.
- Date and formatting utilities under `src/lib`.
- Repository-level data mapping logic, once storage access is abstracted.
- Drizzle schema knowledge under `src/db/schema`, if native storage also uses Drizzle.
- Context and state shape, after removing web-specific persistence assumptions.

## Recommended Target Stack

Use these platform choices for the native app:

- Runtime: Expo
- Navigation: `expo-router`
- Local database: `expo-sqlite`
- ORM: Drizzle SQLite adapter
- Icons: `lucide-react-native`
- List rendering: `@shopify/flash-list`
- Calendar: `react-native-calendars`
- Local key-value persistence: `@react-native-async-storage/async-storage`
- Styling: React Native `StyleSheet` or NativeWind

Notes:

- NativeWind helps if the team wants Tailwind-like ergonomics, but it will not make DOM components reusable.
- Expo is preferred because it reduces native setup cost and gives a clear path for SQLite, fonts, and routing.

## Target Repository Shape

Recommended monorepo layout:

```text
apps/
  web/
  mobile/
packages/
  domain/
  data/
  db/
  ui-native/
```

Suggested responsibilities:

- `apps/web`: current Vite application
- `apps/mobile`: Expo application
- `packages/domain`: types, enums, pure utilities, domain helpers
- `packages/data`: repository interfaces, use cases, and platform-agnostic mapping
- `packages/db`: shared Drizzle schema and migration helpers where possible
- `packages/ui-native`: optional native-only shared components if the mobile app grows

## File Mapping From Current Repo

### Keep and extract

- `src/modules/*/types` -> `packages/domain`
- `src/types/index.d.ts` -> `packages/domain`
- `src/lib/date-utils.ts` -> `packages/domain`
- selected logic from `src/modules/applications/repositories/ApplicationRepository.ts` -> `packages/data`
- `src/db/schema/*` -> `packages/db`

### Replace in mobile

- `src/main.tsx` -> Expo entry files in `apps/mobile`
- `src/router.tsx` -> `apps/mobile/app` routes with `expo-router`
- `src/App.tsx` -> mobile shell composed from native layout primitives
- `src/components/layout/*` -> native layout components
- `src/components/ui/*` -> native UI components
- `src/components/ui/data-table/*` -> list-based mobile views
- `src/components/ui/calendar.jsx` -> native calendar wrapper
- `src/db/index.js` -> native SQLite database bootstrap

### Keep web-only

- Vite config
- Tailwind CSS setup
- Base UI wrappers
- DOM table and calendar implementations

## First Extraction Batch

This is the smallest useful split that creates shared packages without forcing a full app rewrite.

### Package: `packages/domain`

Move or recreate these first:

- `src/modules/applications/types/index.d.ts`
- `src/modules/companies/types/index.d.ts`
- `src/modules/contacts/types/index.d.ts`
- `src/modules/documents/types/index.d.ts`
- `src/modules/applications/enums.ts`
- `src/lib/date-utils.ts`
- the pure parts of `src/types/index.d.ts`

Recommended `packages/domain` contents:

- `application.ts`
- `company.ts`
- `contact.ts`
- `document.ts`
- `application-enums.ts`
- `user.ts`
- `repository.ts`
- `dates.ts`
- `routes.ts`

Do not move these into `domain` unchanged:

- `MenuItem` from `src/types/index.d.ts`
- any type that imports `lucide-react`
- any type that assumes DOM or browser globals

Reason:

- `domain` must remain platform-neutral.
- icon-bearing navigation items are presentation data, not domain data.

### Package: `packages/data`

Extract or create these first:

- repository interfaces for applications and users
- data source interfaces for applications and users
- mapping logic from `src/modules/applications/repositories/ApplicationRepository.ts`
- shared query result normalization helpers if needed

Recommended `packages/data` contents:

- `contracts/ApplicationDataSource.ts`
- `contracts/UserDataSource.ts`
- `repositories/ApplicationRepository.ts`
- `repositories/UserRepository.ts`
- `mappers/application.ts`

Web-only implementations should stay out of `packages/data` initially and live under the app until native is ready.

### Keep in `apps/web`

Do not extract these in the first batch:

- `src/repositories/SidebarRepository.ts`
- `src/components/layout/Sidebar.tsx`
- `src/components/ui/**/*`
- `src/modules/applications/components/**/*`
- `src/router.tsx`
- `src/App.tsx`
- `src/main.tsx`
- `src/db/index.js`
- `src/db/factories/run-all.ts`

Reason:

- these files are either DOM-specific, browser-storage-specific, or UI composition concerns that are not useful to share yet.

## Type Cleanup Needed Before Extraction

Some current files should not be copied verbatim.

### `src/types/index.d.ts`

Split this file into platform-neutral and web-only parts.

Move to `packages/domain`:

- `AppRoute`
- `User`
- generic `Repository<T>` if you still want a shared CRUD contract

Keep out of `packages/domain`:

- `MenuItem`, because it depends on `LucideIcon`

Recommended replacement:

- define a nav item shape in web and native apps separately
- if a shared route label model is needed, use a pure type like `{ id: number; label: string; route: AppRoute }`

### `src/modules/contacts/types/index.d.ts`

This file references `ContactType` without declaring or importing it.

Before extraction:

- add an explicit `ContactType` declaration in the same file or move it to a shared type file
- keep the contact model self-contained

### `src/modules/companies/types/index.d.ts`

This file uses `Temporal.PlainDateTime` but does not currently import `Temporal`.

Before extraction:

- add the missing type import
- ensure all domain types are internally valid before moving them

## Exact Extraction Order

Use this order to keep the web app compiling during the split.

1. Create `packages/domain` and move enums, user type, route type, repository contract, and date utilities.
2. Move application, company, contact, and document types after fixing missing imports and references.
3. Update web imports to read from `packages/domain` instead of `src/modules/*/types` and `src/types`.
4. Create `packages/data` contracts for `ApplicationDataSource` and `UserDataSource`.
5. Move shared repository logic into `packages/data` and inject the web implementation from the app layer.
6. Leave `SidebarRepository` in web and replace it later with app-local navigation config.

## Immediate Refactor Targets

These current files are the best first edits if you start implementing the split:

- `src/types/index.d.ts`
- `src/modules/contacts/types/index.d.ts`
- `src/modules/companies/types/index.d.ts`
- `src/modules/applications/repositories/ApplicationRepository.ts`
- `src/providers/AppProviders.tsx`

Why these first:

- they sit directly on the boundary between shared models and app-specific wiring
- they expose the current dependency on PGlite, icons, and browser-backed runtime assumptions
- they let the web app keep working while introducing shared packages incrementally

## Architecture Decision

Do not let repositories depend directly on `drizzle-orm/pglite`.

Instead, introduce contracts in `packages/data` and provide platform-specific implementations.

Example shape:

```ts
export interface ApplicationDataSource {
  listApplications(): Promise<Application[]>;
}

export class ApplicationRepository {
  constructor(private readonly dataSource: ApplicationDataSource) {}

  list() {
    return this.dataSource.listApplications();
  }
}
```

Then implement:

- `WebApplicationDataSource` backed by PGlite
- `NativeApplicationDataSource` backed by Expo SQLite

This reduces migration risk and keeps feature code from depending on browser storage details.

## Migration Phases

## Phase 1: Split shared code

Goal:

- Extract platform-agnostic code without changing user-visible behavior.

Tasks:

- Move types and enums into `packages/domain`.
- Move shared date helpers into `packages/domain`.
- Extract repository interfaces and mapping logic into `packages/data`.
- Move Drizzle schema into `packages/db` if both apps will share it.
- Replace direct imports from `src/...` with package imports where appropriate.

Deliverable:

- Web app still runs.
- Shared packages compile independently.

## Phase 2: Introduce data source abstraction

Goal:

- Remove hard dependency on PGlite from feature repositories.

Tasks:

- Define data source interfaces for users, applications, contacts, and documents.
- Wrap current web database access behind web implementations.
- Move seed/demo setup behind a platform gate instead of calling it from app bootstrap.
- Adapt Zustand persistence to injectable storage.

Deliverable:

- Web behavior unchanged.
- Repositories no longer know about IndexedDB or `window`.

## Phase 3: Create Expo app

Goal:

- Stand up a runnable native shell.

Tasks:

- Create `apps/mobile` with Expo.
- Install router, SQLite, icons, and storage dependencies.
- Configure TypeScript path aliases to match shared packages.
- Add app-level providers for user context and store hydration.

Deliverable:

- Expo app boots to a placeholder home screen.
- Shared packages are imported successfully.

## Phase 4: Add native storage

Goal:

- Make repository-backed data available in native.

Tasks:

- Create SQLite bootstrap for native.
- Port Drizzle schema usage to SQLite-compatible setup.
- Implement native data source classes.
- Decide whether seed data runs on first launch, in dev builds only, or through a scripted import.

Deliverable:

- Native app can load the same core entities as the web app.

## Phase 5: Rebuild navigation and shell

Goal:

- Replace desktop-specific layout with native navigation.

Tasks:

- Convert sidebar routes into tab or drawer navigation.
- Replace the resizable panel layout with a native app shell.
- Rebuild header content with native components.

Deliverable:

- Dashboard, Applications, and Calendar are navigable in native.

## Phase 6: Rebuild feature screens

Goal:

- Recreate the useful product surfaces in native interaction patterns.

Tasks:

- Replace the data table with `FlashList` rows and detail actions.
- Replace the calendar with `react-native-calendars` and a date detail panel.
- Replace dropdown menus, tooltips, drawers, and hover states with native affordances.
- Replace clipboard access with Expo Clipboard or platform-native clipboard support.

Deliverable:

- Mobile feature parity for the main dashboard flows.

## Phase 7: Stabilize platform differences

Goal:

- Clean up remaining web assumptions.

Tasks:

- Audit all direct uses of `window`, `document`, `navigator`, `import.meta.env`, and CSS imports.
- Replace browser-only tests or mocks.
- Add native-specific error handling and loading states.

Deliverable:

- No browser globals remain in shared code.

## Screen-Level Strategy

### Dashboard

Current web implementation uses cards and grid layout.

Native approach:

- Use `ScrollView` with stacked summary cards.
- Keep insight calculation logic shared.
- Rebuild card presentation natively.

### Applications

Current web implementation uses TanStack Table.

Native approach:

- Use `FlashList` with a row card per application.
- Move sorting and filtering logic into hooks or shared data utilities.
- Replace column-based action menus with per-row action sheets or inline buttons.

### Calendar

Current web implementation customizes `react-day-picker` day cells.

Native approach:

- Use a native calendar library.
- Mark dates with application counts.
- Show selected-day applications below the calendar rather than embedding desktop-style cell composition.

## Library Replacement Matrix

| Current                  | Native target                      | Notes                             |
| ------------------------ | ---------------------------------- | --------------------------------- |
| `react-dom`              | Expo runtime                       | Full runtime replacement          |
| `@tanstack/react-router` | `expo-router`                      | Native navigation model           |
| `@base-ui/react`         | Native primitives or native UI kit | Rebuild, do not port wrappers     |
| `react-day-picker`       | `react-native-calendars`           | Different API and rendering model |
| `react-resizable-panels` | none                               | Remove desktop-only behavior      |
| `lucide-react`           | `lucide-react-native`              | Straightforward icon swap         |
| Zustand web persistence  | AsyncStorage-backed persistence    | Keep store shape, swap storage    |
| PGlite + IndexedDB       | Expo SQLite + Drizzle              | Replace browser storage           |

## High-Risk Areas

These files likely have the highest migration cost:

- `src/components/ui/calendar.jsx`
- `src/components/ui/data-table/data-table.tsx`
- `src/components/ui/dropdown-menu.jsx`
- `src/components/ui/drawer.jsx`
- `src/components/ui/tooltip.jsx`
- `src/App.tsx`
- `src/db/index.js`
- `src/db/factories/run-all.ts`

## Low-Risk Areas

These are likely simple to share or adapt:

- `src/lib/date-utils.ts`
- `src/modules/*/types`
- `src/types/index.d.ts`
- pure repository mapping code after abstraction
- user context shape and feature-level state

## Suggested Initial Work Items

Implement these first:

1. Create `apps/mobile` with Expo.
2. Extract `src/modules/*/types` and `src/types/index.d.ts` into a shared package.
3. Introduce data source interfaces so repositories stop depending on PGlite directly.
4. Move web database bootstrap behind a web-only adapter.
5. Port the Applications screen first, because it will force the right choices for data access, navigation, and list rendering.

## Definition Of Done

The migration should be considered structurally complete when:

- web and mobile apps build independently
- shared packages contain no browser globals
- repositories depend on contracts, not web storage directly
- native app can navigate between Dashboard, Applications, and Calendar
- native app reads real data from a supported storage backend
- no shared code imports DOM components, CSS files, or browser-only libraries

## Non-Goals

These should not drive the first migration pass:

- pixel-perfect parity with the current desktop layout
- preserving DOM component APIs in native
- reusing Tailwind class strings unchanged
- preserving resizable panel behavior on mobile

## Recommendation

Treat this as a shared-domain, dual-app architecture project rather than a component port. The fastest safe route is:

- extract the shared logic
- isolate web-only storage and UI
- build native screens from feature requirements

That keeps the current web app stable while making the native app practical to maintain.
