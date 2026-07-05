import React, { useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import ApplicationCalendarDay from "./ApplicationCalendarDay";

export function ApplicationCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  return (
    <Card className="mx-auto w-full p-0">
      <CardContent className="p-0">
        <Calendar
          mode="single"
          defaultMonth={selectedDate}
          selected={selectedDate}
          onSelect={setSelectedDate}
          numberOfMonths={1}
          captionLayout="dropdown"
          locale={undefined}
          classNames={{}}
          className="[--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)] w-full"
          formatters={{
            formatMonthDropdown: (date: Date) => {
              return date.toLocaleString("default", { month: "long" });
            },
          }}
          components={{
            DayButton: ApplicationCalendarDay,
          }}
        />
      </CardContent>
    </Card>
  );
}
