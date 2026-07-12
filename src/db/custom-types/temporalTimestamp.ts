import { Temporal } from "@js-temporal/polyfill";
import { customType } from "drizzle-orm/pg-core";

function fromDriverTimestamp(value: unknown): Temporal.PlainDateTime {
  if (value == null) {
    throw new TypeError("temporalTimestamp received null from driver");
  }

  if (value instanceof Date) {
    return Temporal.Instant.fromEpochMilliseconds(value.getTime())
      .toZonedDateTimeISO("UTC")
      .toPlainDateTime();
  }

  if (typeof value === "string") {
    const normalized = value.replace(" ", "T").replace("Z", "");
    return Temporal.PlainDateTime.from(normalized);
  }

  throw new TypeError("Unsupported temporalTimestamp driver value");
}

function toDriverTimestamp(value: unknown): string {
  if (value == null) {
    throw new TypeError("temporalTimestamp received null app value");
  }

  if (value instanceof Temporal.PlainDateTime) {
    return value.toString();
  }

  if (value instanceof Temporal.ZonedDateTime) {
    return value.toPlainDateTime().toString();
  }

  if (value instanceof Temporal.Instant) {
    return value.toZonedDateTimeISO("UTC").toPlainDateTime().toString();
  }

  if (value instanceof Date) {
    return Temporal.Instant.fromEpochMilliseconds(value.getTime())
      .toZonedDateTimeISO("UTC")
      .toPlainDateTime()
      .toString();
  }

  if (typeof value === "string") {
    return value.replace(" ", "T").replace("Z", "");
  }

  throw new TypeError("Unsupported temporalTimestamp app value");
}

export const temporalTimestamp = customType<{
  data: Temporal.PlainDateTime;
  driverData: string | Date;
}>({
  dataType() {
    return "timestamp";
  },
  fromDriver(value: unknown): Temporal.PlainDateTime {
    return fromDriverTimestamp(value);
  },
  toDriver(value: unknown): string {
    return toDriverTimestamp(value);
  },
});

export const nullableTemporalTimestamp = customType<{
  data: Temporal.PlainDateTime | null;
  driverData: string | Date | null;
}>({
  dataType() {
    return "timestamp";
  },
  fromDriver(value: unknown): Temporal.PlainDateTime | null {
    if (value == null) {
      return null;
    }

    return fromDriverTimestamp(value);
  },
  toDriver(value: unknown): string | null {
    if (value == null) {
      return null;
    }

    return toDriverTimestamp(value);
  },
});
