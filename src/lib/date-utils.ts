import { Temporal } from "@js-temporal/polyfill";

export function formatDateTime(date: Temporal.PlainDateTime): string {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}

export function formatRelativeDateTime(date: Temporal.PlainDateTime): string {
  const now = Temporal.Now.plainDateTimeISO();
  const diff = now.since(date);

  if (diff.years > 0) {
    return `${diff.years} year${diff.years > 1 ? "s" : ""} ago`;
  } else if (diff.months > 0) {
    return `${diff.months} month${diff.months > 1 ? "s" : ""} ago`;
  } else if (diff.days > 0) {
    return `${diff.days} day${diff.days > 1 ? "s" : ""} ago`;
  }

  if (diff.hours > 0) {
    return `${diff.hours} hour${diff.hours > 1 ? "s" : ""} ago`;
  }

  if (diff.minutes > 0) {
    return `${diff.minutes} minute${diff.minutes > 1 ? "s" : ""} ago`;
  }

  return "just now";
}

export function greeting(name: string): string {
  const now = Temporal.Now.plainDateTimeISO();
  const hour = now.hour;

  let greetingMessage: string;

  if (hour >= 5 && hour < 12) {
    greetingMessage = "Good morning";
  } else if (hour >= 12 && hour < 17) {
    greetingMessage = "Good afternoon";
  } else if (hour >= 17 && hour < 21) {
    greetingMessage = "Good evening";
  } else {
    greetingMessage = "Good night";
  }

  return `${greetingMessage}, ${name}`;
}
