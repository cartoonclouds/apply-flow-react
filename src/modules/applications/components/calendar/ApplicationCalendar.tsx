import React, { useEffect, useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db";
import { ApplicationRepository } from "../../repositories/ApplicationRepository";
import { Application } from "../../types";
import ApplicationCalendarDay from "./ApplicationCalendarDay";

export function ApplicationCalendar() {
  const [applicationsData, setApplicationsData] = useState<Application[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  useEffect(() => {
    const applicationRepository = new ApplicationRepository(db as any);

    void applicationRepository
      .list()
      .then((data) => {
        setApplicationsData(data);
        // setError(null);
      })
      .catch((caught) => {
        const message =
          caught instanceof Error ? caught.message : "Failed to load data";
        // setError(message);
      });
    // .finally(() => {
    //   setLoading(false);
    // });
  }, []);

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
            DayButton: ({ children, modifiers, day, ...props }) => {
              const dateApplications = applicationsData.filter((app) => {
                return app.createdAt?.day === day.date.getDate();
              });

              return (
                <ApplicationCalendarDay
                  day={day}
                  modifiers={modifiers}
                  applicationsData={dateApplications}
                  {...props}
                >
                  {children}
                </ApplicationCalendarDay>
              );
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
