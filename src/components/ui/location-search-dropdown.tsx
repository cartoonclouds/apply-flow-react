import { cn } from "@/lib/utils";
import {
    searchLocationSuggestions,
    type LocationSuggestion,
} from "@/modules/map/services/locationSearchService";
import React, { useEffect, useMemo, useRef, useState } from "react";

type LocationSearchDropdownProps = {
  className?: string;
  disabled?: boolean;
  noResultsText?: string;
  placeholder?: string;
  value: string;
  onValueChange: (value: string) => void;
};

function LocationSearchDropdown({
  className,
  disabled = false,
  noResultsText = "No matching locations",
  placeholder = "Search location",
  value,
  onValueChange,
}: LocationSearchDropdownProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);

  const normalizedValue = useMemo(() => value.trim(), [value]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (!rootRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (disabled) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    if (normalizedValue.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const abortController = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        const nextSuggestions = await searchLocationSuggestions(
          normalizedValue,
          abortController.signal,
        );

        setSuggestions(nextSuggestions);

        // Only open suggestions when the location input itself is focused.
        if (document.activeElement === inputRef.current) {
          setIsOpen(true);
        }
      } finally {
        setIsLoading(false);
      }
    }, 220);

    return () => {
      window.clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [disabled, normalizedValue]);

  function handleSelect(suggestion: LocationSuggestion) {
    onValueChange(suggestion.value);
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div className={cn("relative", className)} ref={rootRef}>
      <input
        ref={inputRef}
        type="text"
        className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => {
          if (suggestions.length) {
            setIsOpen(true);
          }
        }}
        onChange={(event) => {
          onValueChange(event.target.value);
          setIsOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
      />

      {isOpen &&
      (isLoading || suggestions.length > 0 || normalizedValue.length >= 2) ? (
        <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border bg-popover p-1 text-sm shadow-lg">
          {isLoading ? (
            <div className="px-2 py-1.5 text-muted-foreground">
              Searching...
            </div>
          ) : suggestions.length ? (
            suggestions.map((suggestion) => (
              <button
                key={suggestion.value}
                type="button"
                className="block w-full rounded-md px-2 py-1.5 text-left hover:bg-accent"
                onClick={() => {
                  handleSelect(suggestion);
                }}
              >
                {suggestion.label}
              </button>
            ))
          ) : (
            <div className="px-2 py-1.5 text-muted-foreground">
              {noResultsText}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default LocationSearchDropdown;
