# GitHub Copilot Instructions

## Import Style

- Prefer direct named imports over namespace access for React and other libraries.
- Do not use namespaced member calls like `React.useState`, `React.useEffect`, or `React.useMemo`.
- Use named imports and direct calls instead.

### Preferred

```tsx
import { useEffect, useMemo, useState } from "react";

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
