import { cn } from "@/lib/utils";
import React, { useEffect, useMemo, useRef, useState } from "react";

type SearchableSelectOption = {
  value: string;
  label: string;
};

type SearchableSelectProps = {
  className?: string;
  disabled?: boolean;
  emptyOptionLabel?: string;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  value: string;
  onValueChange: (value: string) => void;
};

function SearchableSelect({
  className,
  disabled = false,
  emptyOptionLabel,
  options,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  value,
  onValueChange,
}: SearchableSelectProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedLabel = useMemo(() => {
    return options.find((option) => option.value === value)?.label ?? "";
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return options;
    }

    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedSearch),
    );
  }, [options, search]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (!rootRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [open]);

  function handleToggle() {
    if (disabled) {
      return;
    }

    setOpen((current) => !current);
  }

  function handleSelect(nextValue: string) {
    onValueChange(nextValue);
    setSearch("");
    setOpen(false);
  }

  return (
    <div className={cn("relative", className)} ref={rootRef}>
      <button
        type="button"
        className="flex h-8 w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 py-1 text-left text-sm disabled:pointer-events-none disabled:opacity-50"
        onClick={handleToggle}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
      >
        <span
          className={cn(
            "truncate",
            !selectedLabel ? "text-muted-foreground" : undefined,
          )}
        >
          {selectedLabel || placeholder}
        </span>
        <span className="ml-2 text-xs text-muted-foreground">▼</span>
      </button>

      {open ? (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover p-2 shadow-lg">
          <input
            ref={searchInputRef}
            className="mb-2 h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setOpen(false);
              }
            }}
          />

          <ul
            className="max-h-48 overflow-y-auto"
            role="listbox"
            aria-label="Searchable options"
          >
            {emptyOptionLabel ? (
              <li>
                <button
                  type="button"
                  className="flex w-full items-center rounded-md px-2 py-1 text-left text-sm hover:bg-accent"
                  onClick={() => {
                    handleSelect("");
                  }}
                >
                  {emptyOptionLabel}
                </button>
              </li>
            ) : null}

            {filteredOptions.length ? (
              filteredOptions.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center rounded-md px-2 py-1 text-left text-sm hover:bg-accent",
                      option.value === value ? "bg-accent" : undefined,
                    )}
                    onClick={() => {
                      handleSelect(option.value);
                    }}
                  >
                    {option.label}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-2 py-1 text-sm text-muted-foreground">
                No results found.
              </li>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default SearchableSelect;
