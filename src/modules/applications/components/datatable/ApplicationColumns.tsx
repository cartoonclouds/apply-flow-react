import Badge from "@/components/ui/badge";
import {
  ACTION_BUTTON_SEPARATOR,
  ActionButton,
} from "@/components/ui/data-table/action-button";
import SortableHeader from "@/components/ui/data-table/sortable-header";
import { sortTemporalColumn } from "@/components/ui/data-table/temporal-sorting";
import { formatRelativeDateTime } from "@/lib/date-utils";
import {
  getAttendanceLabel,
  getEmploymentLabel,
} from "@/modules/applications/labels";
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
      const label = getAttendanceLabel(row.original.attendanceType);

      return (
        <Badge className="border-sky-200 bg-sky-50 text-sky-700">{label}</Badge>
      );
    },
  },
  {
    accessorKey: "employmentType",
    header: ({ column }) =>
      SortableHeader({ label: "Employment Type", column }),
    cell: ({ row }) => {
      const label = getEmploymentLabel(row.original.employmentType);

      return (
        <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
          {label}
        </Badge>
      );
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
