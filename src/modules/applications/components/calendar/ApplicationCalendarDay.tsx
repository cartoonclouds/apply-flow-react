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
  applicationsData,
  ...props
}: ApplicationCalendarDayProps) {
  const weekday = day.date.getDay();
  const isWeekend = weekday === 0 || weekday === 6;

  console.log("applicationsData", applicationsData);

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
      {applicationsData?.length > 0 && (
        <span className="absolute top-1 right-1 text-xs font-bold text-black">
          {applicationsData.length}
        </span>
      )}
    </CalendarDayButton>
  );
}

export default ApplicationCalendarDay;
