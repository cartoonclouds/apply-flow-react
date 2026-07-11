import { Temporal } from "@js-temporal/polyfill";
import type { Row } from "@tanstack/react-table";

function asPlainDateTime(value: unknown): Temporal.PlainDateTime | null {
  if (value instanceof Temporal.PlainDateTime) {
    return value;
  }

  if (typeof value === "string") {
    try {
      return Temporal.PlainDateTime.from(
        value.replace(" ", "T").replace("Z", ""),
      );
    } catch {
      return null;
    }
  }

  return null;
}

export function sortTemporalColumn<TData>(
  rowA: Row<TData>,
  rowB: Row<TData>,
  columnId: string,
): number {
  const a = asPlainDateTime(rowA.getValue(columnId));
  const b = asPlainDateTime(rowB.getValue(columnId));

  if (!a && !b) {
    return 0;
  }

  if (!a) {
    return 1;
  }

  if (!b) {
    return -1;
  }

  return Temporal.PlainDateTime.compare(a, b);
}
