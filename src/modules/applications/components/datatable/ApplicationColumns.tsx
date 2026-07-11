import {
  ACTION_BUTTON_SEPARATOR,
  ActionButton,
} from "@/components/ui/data-table/action-button";
import SortableHeader from "@/components/ui/data-table/sortable-header";
import { sortTemporalColumn } from "@/components/ui/data-table/temporal-sorting";
import { formatRelativeDateTime } from "@/lib/date-utils";
import {
  ApplicationAttendanceType,
  ApplicationEmploymentType,
} from "@/modules/applications/enums";
import type { Application } from "@/modules/applications/types";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";

export const columns: ColumnDef<Application>[] = [
  {
    id: "companyName",
    accessorFn: (row) => row.company?.name ?? "",
    header: ({ column }) => SortableHeader({ label: "Company", column }),
    cell: ({ row }) => row.original.company?.name ?? "-",
  },
  {
    accessorKey: "title",
    header: ({ column }) => SortableHeader({ label: "Title", column }),
  },
  {
    accessorKey: "attendanceType",
    header: ({ column }) =>
      SortableHeader({ label: "Attendance Type", column }),
    cell: ({ row }) => {
      const attendanceType = row.original.attendanceType;

      switch (attendanceType) {
        case ApplicationAttendanceType.OnSite:
          return "Onsite";
        case ApplicationAttendanceType.Remote:
          return "Remote";
        case ApplicationAttendanceType.Hybrid:
          return "Hybrid";
        default:
          return attendanceType;
      }
    },
  },
  {
    accessorKey: "employmentType",
    header: ({ column }) =>
      SortableHeader({ label: "Employment Type", column }),
    cell: ({ row }) => {
      const employmentType = row.original.employmentType;

      switch (employmentType) {
        case ApplicationEmploymentType.FullTime:
          return "Full Time";
        case ApplicationEmploymentType.PartTime:
          return "Part Time";
        case ApplicationEmploymentType.Contract:
          return "Contract";
        case ApplicationEmploymentType.Internship:
          return "Internship";
        case ApplicationEmploymentType.Volunteer:
          return "Volunteer";
        default:
          return employmentType;
      }
    },
  },
  {
    accessorKey: "locationText",
    header: ({ column }) => SortableHeader({ label: "Location", column }),
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => SortableHeader({ label: "Updated At", column }),
    sortingFn: sortTemporalColumn,
    cell: ({ row }) => {
      return formatRelativeDateTime(row.original.updatedAt);
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const application = row.original;

      return (
        <ActionButton
          children={[
            {
              label: "Copy application ID",
              onClick: () => {
                if (application.id) {
                  navigator.clipboard.writeText(application.id);
                }
              },
            },
            {
              label: "View application",
              onClick: () => {
                // Implement view application logic here.
              },
            },
            ACTION_BUTTON_SEPARATOR,
            {
              label: "View details",
              onClick: () => {
                // Implement view details logic here.
              },
            },
          ]}
        />
      );
    },
  },
];
