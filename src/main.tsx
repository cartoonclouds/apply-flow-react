import { RouterProvider } from "@tanstack/react-router";
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// @ts-ignore -- CSS side-effect import is resolved by the bundler
import { dbMode, verifyDatabaseConnection } from "./db";
import "./index.css";
import { router } from "./router.js";

function renderBootstrapError(error: unknown) {
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    throw new Error("Root element not found");
  }

  const message = error instanceof Error ? error.message : String(error);

  createRoot(rootElement).render(
    <StrictMode>
      <main className="min-h-screen bg-red-50 text-red-900 p-6 flex items-center justify-center @container/main">
        <section className="max-w-xl w-full rounded-lg border border-red-200 bg-white p-5 shadow-sm">
          <h1 className="text-xl font-semibold mb-2">
            Database startup failed
          </h1>
          <p className="text-sm leading-6 whitespace-pre-wrap">{message}</p>
        </section>
      </main>
    </StrictMode>,
  );
}

async function bootstrap() {
  if (!("Temporal" in globalThis)) {
    const { Temporal } = await import("@js-temporal/polyfill");
    Object.defineProperty(globalThis, "Temporal", {
      value: Temporal,
      configurable: true,
      writable: true,
    });
  }

  if (dbMode === "tauri-sqlite") {
    await verifyDatabaseConnection();
  }

  if (typeof window !== "undefined" && dbMode === "indexeddb") {
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

void bootstrap().catch((error) => {
  console.error("Application bootstrap failed", error);
  renderBootstrapError(error);
});
