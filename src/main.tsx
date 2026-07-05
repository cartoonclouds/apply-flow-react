import { RouterProvider } from "@tanstack/react-router";
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// @ts-ignore -- CSS side-effect import is resolved by the bundler
import "./index.css";
import { router } from "./router.js";

async function bootstrap() {
  if (!("Temporal" in globalThis)) {
    const { Temporal } = await import("@js-temporal/polyfill");
    Object.defineProperty(globalThis, "Temporal", {
      value: Temporal,
      configurable: true,
      writable: true,
    });
  }

  if (typeof window !== "undefined") {
    const { runAllFactories } = await import("./db/factories/run-all");
    await runAllFactories();
  }

  const rootElement = document.getElementById("root");

  if (!rootElement) {
    throw new Error("Root element not found");
  }

  createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}

void bootstrap();
