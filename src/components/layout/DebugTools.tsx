import { Button } from "@/components/ui/button";
import DraggableContainer from "@/components/ui/draggable-container";
import { resetDatabase } from "@/db";
import { getDatabaseMode, isTauriRuntime } from "@/db/runtime";
import { DatabaseZap, RotateCcw } from "lucide-react";
import React, { useState } from "react";

type DebugAction = "reset" | "seed" | null;

function DebugTools() {
  const [activeAction, setActiveAction] = useState<DebugAction>(null);

  if (!import.meta.env.DEV) {
    return null;
  }

  const isDesktop = isTauriRuntime();
  const dbMode = getDatabaseMode();
  const runtimeLabel = isDesktop ? "Desktop" : "Browser";
  const databaseLabel = dbMode === "tauri-sqlite" ? "SQLite" : "IndexedDB";

  async function handleReset() {
    const confirmed = window.confirm(
      "Reset the local development database and reload the app?",
    );

    if (!confirmed) {
      return;
    }

    setActiveAction("reset");

    try {
      await resetDatabase();
      window.location.reload();
    } catch (error) {
      setActiveAction(null);

      const message = error instanceof Error ? error.message : String(error);
      window.alert(`Failed to reset database: ${message}`);
    }
  }

  async function handleSeed() {
    const confirmed = window.confirm(
      "Run the full development seed and reload the app?",
    );

    if (!confirmed) {
      return;
    }

    setActiveAction("seed");

    try {
      const { runAllFactories } = await import("@/db/factories/run-all");
      await runAllFactories();
      window.location.reload();
    } catch (error) {
      setActiveAction(null);

      const message = error instanceof Error ? error.message : String(error);
      window.alert(`Failed to seed database: ${message}`);
    }
  }

  return (
    <DraggableContainer
      className="w-[min(24rem,calc(100vw-2rem))] rounded-2xl border-2 border-amber-400 bg-linear-to-br from-amber-50 via-white to-orange-50 p-4 text-slate-900 shadow-[0_18px_50px_rgba(245,158,11,0.25)] ring-1 ring-amber-200 backdrop-blur-sm"
      handleClassName="mb-3 flex items-start justify-between gap-3"
      initialPosition={{ x: 16, y: 16 }}
      viewportPadding={8}
      resolveInitialPosition={({ elementRect, viewport }) => ({
        x: 16,
        y: Math.max(8, viewport.height - elementRect.height - 16),
      })}
      handle={({ isDragging }) => (
        <>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-amber-700">
              Debug Tools
            </p>
            <p className="mt-1 text-sm font-medium text-slate-700">
              {runtimeLabel} runtime with {databaseLabel} storage
            </p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {isDragging ? "Dragging..." : "Drag panel"}
            </p>
          </div>

          <span
            className={[
              "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide whitespace-nowrap",
              isDesktop
                ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                : "border-sky-300 bg-sky-100 text-sky-800",
            ].join(" ")}
            title={`Runtime: ${runtimeLabel.toLowerCase()}, database: ${dbMode}`}
          >
            {runtimeLabel} / {databaseLabel}
          </span>
        </>
      )}
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSeed}
          disabled={activeAction !== null}
          className="justify-start border-amber-300 bg-white/80 font-semibold text-slate-800 hover:bg-amber-100"
        >
          <DatabaseZap />
          {activeAction === "seed" ? "Seeding..." : "Full Seed"}
        </Button>

        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleReset}
          disabled={activeAction !== null}
          className="justify-start font-semibold"
        >
          <RotateCcw />
          {activeAction === "reset" ? "Resetting..." : "Reset DB"}
        </Button>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-600">
        Development-only controls for rebuilding local data quickly.
      </p>
    </DraggableContainer>
  );
}

export default DebugTools;
