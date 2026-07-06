# JAA React

A modern React + Vite application with Drizzle ORM + PGlite, state management, and shadcn/ui components.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Generate DB migrations
npm run db:generate

# Apply migrations (runtime migrator)
npm run db:migrate

# Open Drizzle Studio (interactive DB explorer)
npm run db:studio

# Build for production
npm run build

# Lint code
npm run lint
```

## Dependencies

### Runtime Dependencies

| Package                        | Version | Purpose                                                  | GitHub                                                                  |
| ------------------------------ | ------- | -------------------------------------------------------- | ----------------------------------------------------------------------- |
| **react**                      | 19.2.7  | UI library for building interactive interfaces           | [facebook/react](https://github.com/facebook/react)                     |
| **react-dom**                  | 19.2.7  | React DOM rendering library                              | [facebook/react](https://github.com/facebook/react)                     |
| **drizzle-orm**                | 0.45.2  | TypeScript ORM for SQL databases with type safety        | [drizzle-team/drizzle-orm](https://github.com/drizzle-team/drizzle-orm) |
| **zustand**                    | 5.0.14  | Lightweight state management library (~2KB)              | [pmndrs/zustand](https://github.com/pmndrs/zustand)                     |
| **tailwindcss**                | 4.3.2   | Utility-first CSS framework                              | [tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss) |
| **class-variance-authority**   | 0.7.1   | Utility for managing component class variants            | [joe-bell/cva](https://github.com/joe-bell/cva)                         |
| **clsx**                       | 2.1.1   | Utility for constructing className strings conditionally | [lukeed/clsx](https://github.com/lukeed/clsx)                           |
| **tailwind-merge**             | 3.6.0   | Merge Tailwind CSS classes without conflicts             | [dcastil/tailwind-merge](https://github.com/dcastil/tailwind-merge)     |
| **lucide-react**               | 1.23.0  | Beautiful icon library for React                         | [lucide-icons/lucide](https://github.com/lucide-icons/lucide)           |
| **@radix-ui/react-slot**       | 1.3.0   | Radix UI slot primitive for component composition        | [radix-ui/primitives](https://github.com/radix-ui/primitives)           |
| **@base-ui/react**             | 1.6.0   | Unstyled React components and hooks                      | [base-ui/base-ui](https://github.com/base-ui/base-ui)                   |
| **@fontsource-variable/geist** | 5.2.9   | Variable font (Geist) from Vercel                        | [fontsource/fontsource](https://github.com/fontsource/fontsource)       |
| **shadcn**                     | 4.13.0  | CLI for adding shadcn/ui components                      | [shadcn/ui](https://github.com/shadcn-ui/ui)                            |
| **tw-animate-css**             | 1.4.0   | Tailwind CSS animation utilities                         | [chankruze/tw-animate-css](https://github.com/chankruze/tw-animate-css) |

### Dev Dependencies

| Package                   | Version | Purpose                                              | GitHub                                                                                |
| ------------------------- | ------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **vite**                  | 8.1.1   | Next-generation build tool and dev server            | [vitejs/vite](https://github.com/vitejs/vite)                                         |
| **@vitejs/plugin-react**  | 6.0.3   | Vite plugin for React with Fast Refresh              | [vitejs/vite](https://github.com/vitejs/vite/tree/main/packages/plugin-react)         |
| **@tailwindcss/vite**     | 4.3.2   | Vite plugin for Tailwind CSS v4                      | [tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss)               |
| **drizzle-kit**           | 0.31.10 | CLI for Drizzle ORM migrations and schema generation | [drizzle-team/drizzle-orm](https://github.com/drizzle-team/drizzle-orm)               |
| **@types/better-sqlite3** | 7.6.13  | TypeScript type definitions for better-sqlite3       | [WiseLibs/better-sqlite3](https://github.com/WiseLibs/better-sqlite3)                 |
| **@types/react**          | 19.2.17 | TypeScript type definitions for React                | [DefinitelyTyped/DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) |
| **@types/react-dom**      | 19.2.3  | TypeScript type definitions for React DOM            | [DefinitelyTyped/DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) |
| **oxlint**                | 1.71.0  | Fast and extensible JavaScript linter                | [oxc-project/oxc](https://github.com/oxc-project/oxc)                                 |

## Project Structure

```
src/
├── main.jsx              # Entry point
├── App.jsx               # Root component
├── App.css               # App component styles
├── index.css             # Global styles & theme
├── components/
│   └── ui/               # shadcn/ui components
│       ├── button.jsx
│       ├── drawer.jsx
│       └── table.jsx
├── db/
│   ├── index.js          # Database connection instance
│   └── schema/           # Drizzle ORM schema definitions
│       ├── index.js
│       ├── enums.js
│       ├── companies.js
│       ├── contacts.js
│       ├── applications.js
│       ├── documents.js
│       ├── application-documents.js
│       ├── application-contacts.js
│       └── relations.js
├── lib/
│   └── utils.js          # Utility functions (cn helper)
├── store/
│   └── useAppStore.js    # Zustand store (state management)
└── assets/               # Static files
```

## Key Features

### Database (Drizzle ORM + PGlite)

Fully typed Drizzle schema with 6 tables:

- **companies** — job posting companies
- **contacts** — recruiters and company contacts
- **applications** — job applications
- **documents** — attachments and resumes
- **application_documents** — junction table
- **application_contacts** — junction table

**Usage:**

```js
import { db } from "@/db/index.js";
import { applications, companies } from "@/db/schema";

const apps = await db.query.applications.findMany({
  with: { company: true },
});
```

### State Management (Zustand)

Lightweight, scalable store with DevTools and persistence:

```js
import useAppStore from "@/store/useAppStore";

function Counter() {
  const { count, increment } = useAppStore();
  return <button onClick={increment}>{count}</button>;
}
```

### UI Components (shadcn/ui)

Pre-configured components:

- `Button` — with variants (default, outline, ghost, destructive, link)
- `Drawer` — slide-out drawer component
- `Table` — data table with semantic HTML

Add more: `bun x --bun shadcn@latest add <component>`

### Styling (Tailwind CSS v4)

- **Tailwind v4** with `@tailwindcss/vite` plugin
- **CSS Variables** for theming (light/dark mode)
- **OKLch color space** for perceptually uniform colors
- **@layer** system for organized styles

## Scripts

| Script        | Command                            | Purpose                                                |
| ------------- | ---------------------------------- | ------------------------------------------------------ |
| `dev`         | `vite`                             | Start dev server at `http://localhost:5173`            |
| `build`       | `vite build`                       | Build for production → `dist/`                         |
| `preview`     | `vite preview`                     | Preview production build locally                       |
| `lint`        | `oxlint`                           | Lint code with oxlint                                  |
| `db:generate` | `drizzle-kit generate`             | Generate SQL migrations from schema                    |
| `db:migrate`  | `node scripts/migrate-runtime.mjs` | Apply pending migrations with Drizzle runtime migrator |
| `db:studio`   | `drizzle-kit studio`               | Open interactive Drizzle Studio UI                     |

## Configuration Files

| File                 | Purpose                                                      |
| -------------------- | ------------------------------------------------------------ |
| `vite.config.js`     | Vite build config, React plugin, Tailwind plugin, path alias |
| `drizzle.config.js`  | Drizzle ORM config (schema, migrations dir, DB path)         |
| `jsconfig.json`      | JavaScript path aliases (`@/*` → `./src/*`)                  |
| `components.json`    | shadcn/ui config (style, aliases, component paths)           |
| `tailwind.config.js` | Tailwind CSS configuration (theme, colors)                   |

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires ES2020+ JavaScript support
