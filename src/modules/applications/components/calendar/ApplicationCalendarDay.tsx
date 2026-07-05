import { CalendarDayButton } from "@/components/ui/calendar";
import React from "react";

type ApplicationCalendarDayProps = React.ComponentPropsWithoutRef<
  typeof CalendarDayButton
>;

function ApplicationCalendarDay({
  children,
  className,
  modifiers,
  day,
  locale,
  ...props
}: ApplicationCalendarDayProps) {
  const weekday = day.date.getDay();
  const isWeekend = weekday === 0 || weekday === 6;

  return (
    <CalendarDayButton
      className={className ?? ""}
      day={day}
      locale={locale}
      modifiers={modifiers}
      {...props}
    >
      {children}
      {!modifiers.outside && <span>{isWeekend ? "$120" : "$100"}</span>}
    </CalendarDayButton>
  );
}

export default ApplicationCalendarDay;
