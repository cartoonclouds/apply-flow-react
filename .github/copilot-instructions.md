# GitHub Copilot Instructions

## Import Style

- For every React component file, always include `import React from "react";`.
- When creating a new component, add `import React from "react";` at the top.
- When editing an existing component, ensure `import React from "react";` is present.
- Prefer direct named imports over namespace access for React and other libraries.
- Do not use namespaced member calls like `React.useState`, `React.useEffect`, or `React.useMemo`.
- Use named imports and direct calls instead.

### Preferred

```tsx
import React, { useEffect, useMemo, useState } from "react";

const [value, setValue] = useState(0);
useEffect(() => {
  // ...
}, []);
```

### Avoid

```tsx
import React from "react";

const [value, setValue] = React.useState(0);
React.useEffect(() => {
  // ...
}, []);
```

## General Rule

- When generating code, import the specific symbol/component/hook that is used.
- Avoid wildcard or namespace-style usage unless explicitly required by an external API.

## Type File Naming

- Name type-only files using the declaration-file format `*.d.ts`.
- Do not create type-only files as `*.ts`.
- When migrating existing type-only files from `*.ts`, rename them to matching `*.d.ts` names.

## TanStack Router Import Style

- Prefer named imports from `@tanstack/react-router`.
- Use direct symbol usage such as `Link`, `Outlet`, `RouterProvider`, `createRouter`, and `createRoute`.
- Avoid namespace imports and member access patterns for router APIs.

### Preferred

```tsx
import { Link, Outlet, RouterProvider } from "@tanstack/react-router";
```

### Avoid

```tsx
import * as TanStackRouter from "@tanstack/react-router";

<TanStackRouter.Link to="/applications" />;
```
